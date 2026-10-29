import {NativeIcon, type NativeIconName, type NativeIconRenderingMode} from '@hzblj/expo-native-icons'
import {Box, HStack, Island, RnText, Spacer, Switch, Text, useAppTheme} from '@hzblj/kara-ui'
import {useState} from 'react'

import {CodeBlock, Section} from '../ui'

const MODES: NativeIconRenderingMode[] = ['monochrome', 'hierarchical', 'palette', 'multicolor']
const ICONS: NativeIconName[] = ['weather', 'bell-badge', 'volume']

const CODE = `<NativeIcon
  color={color('content.accent')}
  secondaryColor={color('content.success')}
  name="weather"
  renderingMode="palette"
/>`

const SVG = `<path fill="#FFB300" fill-opacity="0.5" d="…"/>  <!-- the sun -->
<path d="…"/>                                     <!-- the cloud -->`

/** One SVG, four ways to colour it: the paths' own opacity and fill decide each layer. */
export const RenderingSection = () => {
  const theme = useAppTheme()
  const [gradient, setGradient] = useState(false)

  return (
    <Section
      caption="Each path is a layer. Its opacity in the SVG makes it secondary (under 0.75) or tertiary (under 0.375): hierarchical draws those fainter and palette gives them secondaryColor and tertiaryColor. Its fill, if it has one other than black, is what multicolor keeps; every other layer takes the tint. gradient is SF Symbols’ iOS 26 shading, drawn on Android too."
      title="Rendering modes"
    >
      <Box bg="surface.primary" borderRadius="large" gap="s16" p="s16">
        {MODES.map(mode => (
          <Box align="center" gap="s16" key={mode} row>
            <Box w={96}>
              <RnText color="content.secondary" monospaced variant="caption">
                {mode}
              </RnText>
            </Box>
            {ICONS.map(name => (
              <NativeIcon
                color={theme.color('content.accent')}
                gradient={gradient}
                key={name}
                name={name}
                renderingMode={mode}
                secondaryColor={theme.color('content.success')}
                size={40}
                tertiaryColor={theme.color('content.destructive')}
              />
            ))}
          </Box>
        ))}
      </Box>
      <Island>
        <HStack align="center" bg="surface.primary" borderRadius="large" p="s16" wide>
          <Text variant="subheadlineMedium">gradient</Text>
          <Spacer />
          <Switch onValueChange={setGradient} value={gradient} />
        </HStack>
      </Island>
      <CodeBlock code={SVG} />
      <CodeBlock code={CODE} />
    </Section>
  )
}
