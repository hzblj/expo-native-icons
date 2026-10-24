import {iconResourceName, NativeIcon} from '@hzblj/expo-native-icons'
import {Box, type NavigationBarItem, RnText, SegmentedControl, Sheet, useAppTheme} from '@hzblj/kara-ui'
import {useMemo} from 'react'

import {CodeBlock, InlineCode, Rows, Section} from '../ui'
import {type GallerySymbol, STYLE_LABELS, STYLES, type SymbolStyle} from './symbols'

/** Past this many characters a call breaks over lines, so the snippet fits a phone's width. */
const LINE = 40

/** `<NativeIcon name="…" />` and `iconResourceName('…')` for one icon, broken the way Prettier would. */
const drawCode = (name: string, resource: string) => {
  const element = `<NativeIcon name="${name}" />`
  const call = `iconResourceName('${name}')`

  return [
    element.length <= LINE ? element : `<NativeIcon\n  name="${name}"\n/>`,
    '',
    call.length <= LINE ? call : `iconResourceName(\n  '${name}'\n)`,
    `// '${resource}'`,
  ].join('\n')
}

type NameRowProps = {
  /** What the plugin writes, by its file name. */
  file: string
  /** The folder it goes in. */
  folder: string
  title: string
}

const NameRow = ({file, folder, title}: NameRowProps) => (
  <Box gap="s4" px="s16" py="s12">
    <Box align="baseline" justify="space-between" row>
      <RnText variant="subheadlineMedium">{title}</RnText>
      <RnText color="content.tertiary" variant="footnote">
        {folder}
      </RnText>
    </Box>
    <InlineCode lines={2}>{file}</InlineCode>
  </Box>
)

type SymbolSheetProps = {
  onClose: () => void
  onStyleChange: (style: SymbolStyle) => void
  style: SymbolStyle
  symbol: GallerySymbol
  visible: boolean
}

/** One icon up close: large, in either style, with what it is called natively and the code that draws it. */
export const SymbolSheet = ({onClose, onStyleChange, style, symbol, visible}: SymbolSheetProps) => {
  const theme = useAppTheme()
  const name = symbol[style]
  const resource = iconResourceName(name)
  const close = useMemo<NavigationBarItem[]>(() => [{onPress: onClose, type: 'close'}], [onClose])

  return (
    <Sheet bg="surface.base" onDismiss={onClose} visible={visible}>
      <Sheet.Header title={name} trailingItems={close} />
      <Box gap="s24" pb="s40" pt="s8" px="s20">
        <Box gap="s12">
          <Box align="center" bg="surface.primary" borderRadius="large" h={200} justify="center">
            <NativeIcon accessibilityLabel={name} color={theme.color('content.primary')} name={name} size={128} />
          </Box>
          <SegmentedControl
            onChange={index => onStyleChange(STYLES[index] ?? 'outlined')}
            selectedIndex={STYLES.indexOf(style)}
            values={STYLES.map(entry => STYLE_LABELS[entry])}
          />
        </Box>
        <Section
          caption="One name on both platforms: native_icon_ and the icon’s name, with - turned into _. iOS keeps the SVG as a template with its vector data; Android’s drawable is white, tinted where it is drawn."
          title="Native names"
        >
          <Rows>
            <NameRow file={`${resource}.imageset`} folder="Images.xcassets" title="iOS image set" />
            <NameRow file={`${resource}.xml`} folder="res/drawable" title="Android drawable" />
          </Rows>
        </Section>
        <Section title="Draw it">
          <CodeBlock code={drawCode(name, resource)} />
        </Section>
      </Box>
    </Sheet>
  )
}
