import svgpath from 'svgpath'

import {type IconLayer, iconLayers, type SvgIcon, snakeCase} from './icons'

/**
 * An icon's custom SF Symbol, iOS only: `native_symbol_<name>`, beside the `native_icon_<name>` image. Mirrors
 * `iconSymbolName` in `src/`, which runs in the app; a test keeps the two equal.
 */
export const iconSymbolName = (name: string): string => `native_symbol_${snakeCase(name)}`

/** The template's small-scale guides at point size 100, where SF Symbols' own templates draw them. */
const BASELINE = 696
const CAPLINE = 625.541
const CAP_HEIGHT = BASELINE - CAPLINE

/**
 * The glyph's longer side in template units: at point size 100 and the small symbol scale, 100 units are 100 points,
 * so a symbol drawn at point size `n` with `.small` scale fills an `n` point box, as the image does.
 */
const BOX = 100

/** Three weights of the small scale, the minimum of an interpolatable template, all drawn with the same glyph. */
const SOURCES: [id: string, centre: number][] = [
  ['Ultralight-S', 559.711],
  ['Regular-S', 1449.84],
  ['Black-S', 2933.4],
]

type Point = [number, number]

/** A subpath after `abs().unarc().unshort()`: lines and curves only, every point absolute. */
type Segment = {controls: Point[]; end: Point}
type Contour = {closed: boolean; segments: Segment[]; start: Point}

const contoursOf = (d: string): Contour[] => {
  const contours: Contour[] = []
  let current: Contour | undefined

  const add = (segment: Segment, x: number, y: number) => {
    if (!current) {
      current = {closed: false, segments: [], start: [x, y]}
      contours.push(current)
    }
    current.segments.push(segment)
  }

  svgpath(d)
    .abs()
    .unarc()
    .unshort()
    .iterate((segment, _index, x, y) => {
      const [command, ...values] = segment as [string, ...number[]]
      const v = (index: number) => values[index] ?? 0

      switch (command) {
        case 'M':
          current = {closed: false, segments: [], start: [v(0), v(1)]}
          contours.push(current)
          break
        case 'L':
          add({controls: [], end: [v(0), v(1)]}, x, y)
          break
        case 'H':
          add({controls: [], end: [v(0), y]}, x, y)
          break
        case 'V':
          add({controls: [], end: [x, v(0)]}, x, y)
          break
        case 'Q':
          add({controls: [[v(0), v(1)]], end: [v(2), v(3)]}, x, y)
          break
        case 'C':
          add(
            {
              controls: [
                [v(0), v(1)],
                [v(2), v(3)],
              ],
              end: [v(4), v(5)],
            },
            x,
            y
          )
          break
        default:
          if (current) {
            current.closed = true
          }
          current = undefined
      }
    })

  return contours
}

const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

/** A point on a segment's curve by de Casteljau. */
const pointAt = (from: Point, segment: Segment, t: number): Point => {
  let points = [from, ...segment.controls, segment.end]

  while (points.length > 1) {
    points = points.slice(1).map((point, index) => lerp(points[index] as Point, point, t))
  }

  return points[0] as Point
}

/** The contour as a polygon: every line's end, and four points along every curve. */
const polygonOf = ({segments, start}: Contour): Point[] => {
  const polygon: Point[] = [start]
  let from = start

  for (const segment of segments) {
    if (segment.controls.length > 0) {
      polygon.push(pointAt(from, segment, 0.25), pointAt(from, segment, 0.5), pointAt(from, segment, 0.75))
    }
    polygon.push(segment.end)
    from = segment.end
  }

  return polygon
}

const signedArea = (polygon: Point[]): number =>
  polygon.reduce((area, [x, y], index) => {
    const [nextX, nextY] = polygon[(index + 1) % polygon.length] as Point
    return area + x * nextY - nextX * y
  }, 0) / 2

const contains = (polygon: Point[], [x, y]: Point): boolean => {
  let inside = false

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [xi, yi] = polygon[index] as Point
    const [xj, yj] = polygon[previous] as Point

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

/** The same contour drawn the other way round: every segment backwards, its control points swapped. */
const reversed = ({closed, segments, start}: Contour): Contour => {
  const last = segments.at(-1)?.end ?? start
  const all =
    closed && (last[0] !== start[0] || last[1] !== start[1]) ? [...segments, {controls: [], end: start}] : segments
  const points = [start, ...all.map(segment => segment.end)]

  return {
    closed,
    segments: all
      .map((segment, index) => ({controls: [...segment.controls].reverse(), end: points[index] as Point}))
      .reverse(),
    start: points.at(-1) as Point,
  }
}

const serialize = (contours: Contour[]): string =>
  contours
    .map(({closed, segments, start}) => {
      const commands = segments.map(({controls, end}) => {
        const points = [...controls, end].map(point => point.join(' ')).join(' ')
        return `${['L', 'Q', 'C'][controls.length]}${points}`
      })
      return `M${start.join(' ')}${commands.join('')}${closed ? 'Z' : ''}`
    })
    .join('')

/**
 * An even-odd path redrawn for the non-zero rule, the only one SF Symbols fills by: a contour inside an odd number of
 * others is a hole, so it runs against the contours around it. Without this, every hole Figma punched with
 * `fill-rule="evenodd"` came out filled. Exact for nested contours, which is what icons are made of; where two
 * contours side by side overlap, even-odd left the overlap empty and non-zero fills it.
 */
export const nonZeroPath = (d: string): string => {
  const contours = contoursOf(d)
  const polygons = contours.map(polygonOf)

  return serialize(
    contours.map((contour, index) => {
      const polygon = polygons[index] as Point[]
      const area = signedArea(polygon)
      const probe = pointAt(contour.start, contour.segments[0] ?? {controls: [], end: contour.start}, 0.5)
      const depth = polygons.filter((other, otherIndex) => otherIndex !== index && contains(other, probe)).length
      const clockwise = area > 0

      return area !== 0 && clockwise === (depth % 2 === 1) ? reversed(contour) : contour
    })
  )
}

const motion = (layer: Pick<IconLayer, 'motionGroup' | 'threshold'>) =>
  [
    layer.threshold !== undefined && `-sfsymbols-variable-threshold:${layer.threshold}`,
    `-sfsymbols-motion-group:${layer.motionGroup ?? 0}`,
  ].filter(Boolean)

/** `tintColor` for a tinted layer, a name of its own for a layer with its colour: a non-system name takes its fill. */
const multicolorName = (layer: Pick<IconLayer, 'color'>) =>
  layer.color ? `custom${layer.color.slice(1)}` : 'tintColor'

const fixed = (value: number) => Number(value.toFixed(3))

/**
 * A custom SF Symbol set: the glyph as a symbol template, so the platform's symbol machinery works on it (effects,
 * the replace transition, hierarchical, palette and multicolor rendering, variable values). One layer per path, plus
 * an invisible first layer covering the whole viewBox: a symbol is otherwise as tall as its ink, and a glyph that does
 * not fill its box would come out bigger and off centre next to the image of the same icon.
 */
export const iosSymbolset = (icon: SvgIcon, author: string) => {
  const scale = BOX / Math.max(icon.width, icon.height)
  const width = icon.width * scale
  const height = icon.height * scale
  const top = -CAP_HEIGHT / 2 - height / 2
  const box = `M${icon.minX} ${icon.minY}h${icon.width}v${icon.height}h${-icon.width}Z`
  const layers: (IconLayer & {hidden?: true})[] = [{d: box, evenOdd: false, hidden: true}, ...iconLayers(icon)]

  const styles = [
    ...layers.map((layer, index) => {
      const hidden = layer.hidden ? ['opacity:0.0'] : []
      return `.monochrome-${index} {${[...hidden, ...motion(layer)].join(';')}}`
    }),
    '',
    ...layers.map((layer, index) => {
      const fill = [`fill:${layer.color ?? '#007AFF'}`, ...(layer.hidden ? ['opacity:0.0'] : [])]
      return `.multicolor-${index}:${multicolorName(layer)} {${[...fill, ...motion(layer)].join(';')}}`
    }),
    '',
    ...layers.map((layer, index) => {
      const fill = ['fill:#212121', ...(layer.hidden ? ['opacity:0.0'] : [])]
      return `.hierarchical-${index}:${layer.level ?? 'primary'} {${[...fill, ...motion(layer)].join(';')}}`
    }),
    '',
    '.SFSymbolsPreviewWireframe {fill:none;opacity:1.0;stroke:black;stroke-width:0.5}',
  ]

  const paths = layers.map((layer, index) => {
    const d = svgpath(layer.evenOdd ? nonZeroPath(layer.d) : layer.d)
      .translate(-icon.minX, -icon.minY)
      .scale(scale)
      .translate(0, top)
      .round(3)
      .toString()
    const classes = `monochrome-${index} multicolor-${index}:${multicolorName(layer)} hierarchical-${index}:${layer.level ?? 'primary'}`

    return `   <path class="${classes} SFSymbolsPreviewWireframe" d="${d}"/>`
  })

  const margins = SOURCES.flatMap(([id, centre]) => {
    const left = fixed(centre - width / 2)
    const right = fixed(centre + width / 2)
    const line = 'style="fill:none;stroke:#00AEEF;stroke-width:0.5;opacity:1.0;"'

    return [
      `  <line id="left-margin-${id}" ${line} x1="${left}" x2="${left}" y1="600.785" y2="720.121"/>`,
      `  <line id="right-margin-${id}" ${line} x1="${right}" x2="${right}" y1="600.785" y2="720.121"/>`,
    ]
  })

  const symbols = SOURCES.map(
    ([id, centre]) =>
      `  <g id="${id}" transform="matrix(1 0 0 1 ${fixed(centre - width / 2)} ${BASELINE})">\n${paths.join('\n')}\n  </g>`
  )

  const guide = (id: string, y: number) =>
    `  <line id="${id}" style="fill:none;stroke:#27AAE1;opacity:1;stroke-width:0.5;" x1="263" x2="3036" y1="${y}" y2="${y}"/>`

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!--Generated by ${author} from ${icon.name}.svg-->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="3300" height="2200">
 <style>${styles.join('\n')}
</style>
 <g id="Notes">
  <rect height="2200" id="artboard" style="fill:white;opacity:1" width="3300" x="0" y="0"/>
  <text id="template-version" style="stroke:none;fill:black;font-family:sans-serif;font-size:13;text-anchor:end;" transform="matrix(1 0 0 1 3036 1933)">Template v.7.0</text>
 </g>
 <g id="Guides">
${guide('Baseline-S', BASELINE)}
${guide('Capline-S', CAPLINE)}
${guide('Baseline-M', 1126)}
${guide('Capline-M', 1055.54)}
${guide('Baseline-L', 1556)}
${guide('Capline-L', 1485.54)}
${margins.join('\n')}
 </g>
 <g id="Symbols">
${symbols.join('\n')}
 </g>
</svg>
`

  return {
    contents: `${JSON.stringify({info: {author, version: 1}, symbols: [{filename: `${iconSymbolName(icon.name)}.svg`, idiom: 'universal'}]}, null, 2)}\n`,
    svg,
  }
}
