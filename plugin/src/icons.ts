import {existsSync, readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'

/** One `<path>` of a glyph. `evenOdd` keeps holes punched by an inner contour, the way Figma exports them. */
export type IconPath = {d: string; evenOdd: boolean}

/** A single-colour glyph, read from an SVG: its viewBox and the paths drawn in it. */
export type SvgIcon = {
  height: number
  minX: number
  minY: number
  name: string
  paths: IconPath[]
  width: number
}

/** Kebab or snake case, lower case, starting with a letter: the file name is the icon name. */
const ICON_NAME = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/

export type IconPlatform = 'android' | 'ios'

/** `share.android.svg` replaces `share.svg` on Android only: the platform's own glyph where the two differ. */
const PLATFORM_SUFFIX = /\.(android|ios)$/

/** Every element the generator understands. Anything else (groups, clips, masks, strokes) must be flattened first. */
const ALLOWED_TAGS = new Set(['path', 'svg', 'title'])

const fail = (file: string, message: string): never => {
  throw new Error(`[native-icons] ${path.basename(file)}: ${message}`)
}

/** `arrow-left` → `arrow_left`: Android resource names allow neither `-` nor capitals. */
export const snakeCase = (name: string): string => name.replace(/-/g, '_').toLowerCase()

/**
 * An icon's native name, the same on both platforms: `native_icon_<name>`, the asset and the drawable. Mirrors
 * `iconResourceName` in `src/`, which runs in the app and cannot be imported from Node; a test keeps the two equal.
 */
export const iconResourceName = (name: string): string => `native_icon_${snakeCase(name)}`

/**
 * Reads one glyph. Only `<path>` elements (optionally `fill-rule="evenodd"`) inside one `<svg>` with a numeric
 * `viewBox` are accepted, and anything else fails loudly: a glyph that silently lost a clip or a mask is worse than
 * none (a mask leftover flattens into a solid square). The colour in the file is ignored: every icon is a template the
 * platform tints.
 */
export const parseSvgIcon = (file: string): SvgIcon => {
  const name = path.basename(file, '.svg').replace(PLATFORM_SUFFIX, '')
  const svg = readFileSync(file, 'utf8')

  if (!ICON_NAME.test(name)) {
    fail(file, 'name it in lower kebab or snake case, starting with a letter: the file name is the icon name')
  }

  const viewBox = svg.match(/viewBox="\s*(-?[\d.]+)[\s,]+(-?[\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/)

  if (!viewBox) {
    fail(file, 'expected a numeric viewBox="<minX> <minY> <width> <height>"')
  }

  for (const [, tag = ''] of svg.matchAll(/<([a-zA-Z][\w-]*)/g)) {
    if (!ALLOWED_TAGS.has(tag)) {
      fail(file, `only <path> elements are supported, found <${tag}>. Flatten groups, clips, masks and strokes first`)
    }
  }

  const paths: IconPath[] = []

  for (const [, attributes = ''] of svg.matchAll(/<path\b([^>]*)>/g)) {
    const d = attributes.match(/\sd="([^"]+)"/)?.[1]

    if (!d) {
      fail(file, '<path> without d')
    }

    paths.push({d: d as string, evenOdd: /fill-rule="evenodd"/.test(attributes)})
  }

  if (paths.length === 0) {
    fail(file, 'no <path> elements')
  }

  const [, minX, minY, width, height] = viewBox as RegExpMatchArray

  return {height: Number(height), minX: Number(minX), minY: Number(minY), name, paths, width: Number(width)}
}

/** What one folder holds: each platform's glyphs, and every name that exists on at least one of them. */
export type IconFolder = {android: SvgIcon[]; ios: SvgIcon[]; names: string[]}

const glyphsFor = (directory: string, names: string[], platform: IconPlatform): SvgIcon[] =>
  names.flatMap(name => {
    const variant = path.join(directory, `${name}.${platform}.svg`)
    const shared = path.join(directory, `${name}.svg`)

    if (existsSync(variant)) {
      return [parseSvgIcon(variant)]
    }

    return existsSync(shared) ? [parseSvgIcon(shared)] : []
  })

/**
 * Every icon in a folder, per platform: `<name>.svg` for both, `<name>.ios.svg` / `<name>.android.svg` for one. A
 * variant wins over the shared file on its platform, and a name with only a variant exists on that platform alone.
 * Refused when two names would land on one native resource name (`arrow-left` and `arrow_left`).
 */
export const readIconFolder = (directory: string): IconFolder => {
  if (!existsSync(directory)) {
    throw new Error(`[native-icons] No icon folder at ${directory}.`)
  }

  const names = [
    ...new Set(
      readdirSync(directory)
        .filter(file => file.endsWith('.svg'))
        .map(file => path.basename(file, '.svg').replace(PLATFORM_SUFFIX, ''))
    ),
  ].sort()

  const byResource = new Map<string, string>()

  for (const name of names) {
    const resource = snakeCase(name)
    const existing = byResource.get(resource)

    if (existing) {
      throw new Error(`[native-icons] "${existing}" and "${name}" would both become the resource "${resource}".`)
    }

    byResource.set(resource, name)
  }

  return {android: glyphsFor(directory, names, 'android'), ios: glyphsFor(directory, names, 'ios'), names}
}

const fillRule = (iconPath: IconPath) => (iconPath.evenOdd ? ' fill-rule="evenodd"' : '')

/**
 * An asset-catalog image set: the glyph as an SVG template that keeps its vector data, so SwiftUI's `resizable()` and
 * `UIImageView` scale it crisply to any size, and UIKit tints it with the view's tint colour. `size` is the point size
 * a system control draws it at when nothing resizes it.
 */
export const iosImageset = (icon: SvgIcon, assetName: string, size: number, author: string) => {
  const paths = icon.paths.map(iconPath => `  <path d="${iconPath.d}"${fillRule(iconPath)} fill="black"/>`)
  const viewBox = `${icon.minX} ${icon.minY} ${icon.width} ${icon.height}`

  return {
    contents: `${JSON.stringify(
      {
        images: [{filename: `${assetName}.svg`, idiom: 'universal'}],
        info: {author, version: 1},
        properties: {'preserves-vector-representation': true, 'template-rendering-intent': 'template'},
      },
      null,
      2
    )}\n`,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">\n${paths.join('\n')}\n</svg>\n`,
  }
}

/**
 * The glyph as an Android vector drawable, compiled by aapt like any resource and drawn by `ImageView` and Compose's
 * `painterResource` alike. White fill, because every consumer tints it. Its longer side is `size` dp and the other
 * follows the viewBox, since a vector drawable stretches its viewport to its size. A viewBox that does not start at the
 * origin (Material Symbols use `0 -960 960 960`) is moved there by a group, since a vector's viewport always starts at
 * 0,0.
 */
export const androidVectorDrawable = (icon: SvgIcon, size = 24): string => {
  const paths = icon.paths.map(
    iconPath =>
      `    <path\n        android:fillColor="@android:color/white"${iconPath.evenOdd ? '\n        android:fillType="evenOdd"' : ''}\n        android:pathData="${iconPath.d}"/>`
  )
  const offset = icon.minX !== 0 || icon.minY !== 0
  const body = offset
    ? `  <group android:translateX="${-icon.minX}" android:translateY="${-icon.minY}">\n${paths.join('\n')}\n  </group>`
    : paths.join('\n').replace(/^ {2}/gm, '')

  const longer = Math.max(icon.width, icon.height)
  const dp = (side: number) => Number(((size * side) / longer).toFixed(2))

  return `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${dp(icon.width)}dp"
    android:height="${dp(icon.height)}dp"
    android:viewportWidth="${icon.width}"
    android:viewportHeight="${icon.height}">
${body}
</vector>
`
}

/**
 * The declaration that teaches TypeScript the app's icon names: a global `NativeIcons` that `NativeIconName` reads, so
 * `<NativeIcon name="bolt" />` type-checks without any import, and an icon deleted from the folder fails at its call
 * sites.
 */
export const iconTypes = (names: string[], source: string): string => {
  const key = (name: string) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : `'${name}'`)
  const entries = names.map(name => `    ${key(name)}: true`)

  return `// Generated by @hzblj/expo-native-icons from ${source}. Do not edit: it is rewritten whenever the app config is
// read (\`expo start\`, \`expo prebuild\`), or by \`npx native-icons ${source}\`.
declare global {
  interface NativeIcons {
${entries.join('\n')}
  }
}

export {}
`
}
