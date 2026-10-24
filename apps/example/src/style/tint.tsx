import {NativeIcon, type NativeIconName} from '@hzblj/expo-native-icons'
import {Box, type ColorToken, Pressable, RnText, useAppTheme} from '@hzblj/kara-ui'
import {useState} from 'react'

import {CodeBlock, Section} from '../ui'

type Tint = {
  label: string
  /** kara's token for it; unset is the platform's own default. */
  token?: ColorToken
}

const TINTS: Tint[] = [
  {label: 'Unset'},
  {label: 'Secondary', token: 'content.secondary'},
  {label: 'Accent', token: 'content.accent'},
  {label: 'Success', token: 'content.success'},
  {label: 'Destructive', token: 'content.destructive'},
]

const PREVIEW: NativeIconName[] = ['favorite-filled', 'star', 'bolt-filled', 'notifications', 'eco-filled']

const SWATCH = 40
const DOT = 28

const tintCode = (token?: ColorToken) =>
  token
    ? `const {color} = useAppTheme()\n\n<NativeIcon\n  color={color('${token}')}\n  name="favorite-filled"\n/>`
    : '// UIColor.label on iOS,\n// textColorPrimary on Android\n<NativeIcon name="favorite-filled" />'

const Swatch = ({onPress, selected, tint}: {onPress: () => void; selected: boolean; tint: Tint}) => (
  <Pressable
    accessibilityLabel={tint.label}
    accessibilityValue={selected ? 'Selected' : undefined}
    align="center"
    gap="s6"
    haptic="selection"
    onPress={onPress}
    pressEffect="opacity"
    ripple={false}
  >
    <Box
      align="center"
      borderColor={selected ? (tint.token ?? 'content.primary') : 'border.tertiary'}
      borderRadius="full"
      borderWidth={selected ? 2 : 1}
      h={SWATCH}
      justify="center"
      w={SWATCH}
    >
      <Box bg={tint.token ?? 'content.primary'} borderRadius="full" h={DOT} w={DOT} />
    </Box>
    <RnText color={selected ? 'content.primary' : 'content.secondary'} variant="captionMedium">
      {tint.label}
    </RnText>
  </Pressable>
)

/** Every icon is a template: one glyph in any of kara's content colours, or the platform's default. */
export const TintSection = () => {
  const theme = useAppTheme()
  const [selected, setSelected] = useState<Tint>(TINTS[0] as Tint)
  const color = selected.token ? theme.color(selected.token) : undefined

  return (
    <Section
      caption="The colour in the SVG is ignored: color takes any colour React Native does, and a kara token resolves to one. Unset, an icon takes the platform’s primary text colour and follows dark mode by itself."
      title="Tint"
    >
      <Box bg="surface.primary" borderRadius="large" gap="s20" px="s16" py="s20">
        <Box justify="space-around" row>
          {PREVIEW.map(name => (
            <NativeIcon color={color} key={name} name={name} size={36} />
          ))}
        </Box>
        <Box bg="border.tertiary" h={1} />
        <Box justify="space-between" row>
          {TINTS.map(tint => (
            <Swatch key={tint.label} onPress={() => setSelected(tint)} selected={tint === selected} tint={tint} />
          ))}
        </Box>
      </Box>
      <CodeBlock code={tintCode(selected.token)} />
    </Section>
  )
}
