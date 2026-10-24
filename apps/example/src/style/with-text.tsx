import {NativeIcon, type NativeIconName} from '@hzblj/expo-native-icons'
import {Box, type ColorToken, Pressable, RnText, useAppTheme} from '@hzblj/kara-ui'
import {useState} from 'react'
import {Share} from 'react-native'

import {CodeBlock, Rows, Section} from '../ui'

type SettingRow = {
  bg: ColorToken
  icon: NativeIconName
  /** The icon's colour on `bg`. */
  on: ColorToken
  title: string
  value: string
}

const SETTINGS: SettingRow[] = [
  {
    bg: 'fill.destructive.primary',
    icon: 'notifications-filled',
    on: 'content.on.destructive',
    title: 'Notifications',
    value: 'On',
  },
  {
    bg: 'fill.accent.primary',
    icon: 'dark-mode-filled',
    on: 'content.on.accent',
    title: 'Appearance',
    value: 'Automatic',
  },
  {bg: 'fill.success.primary', icon: 'lock-filled', on: 'content.on.accent', title: 'Passcode', value: 'Face ID'},
]

/** Rows of a settings list: a white glyph on a coloured tile, the way iOS Settings draws them. */
const SettingsList = () => {
  const theme = useAppTheme()

  return (
    <Rows inset="s56">
      {SETTINGS.map(row => (
        <Box accessible align="center" gap="s12" key={row.title} px="s16" py="s12" row>
          <Box align="center" bg={row.bg} borderRadius="small" h={30} justify="center" w={30}>
            <NativeIcon color={theme.color(row.on)} name={row.icon} size={18} />
          </Box>
          <RnText flex={1} variant="body">
            {row.title}
          </RnText>
          <RnText color="content.secondary" variant="body">
            {row.value}
          </RnText>
        </Box>
      ))}
    </Rows>
  )
}

/** One fact of a place: a small glyph that grows with the text beside it. */
const Fact = ({color, icon, label}: {color: ColorToken; icon: NativeIconName; label: string}) => {
  const theme = useAppTheme()

  return (
    <Box align="center" gap="s4" row>
      <NativeIcon allowFontScaling color={theme.color(color)} name={icon} size={16} />
      <RnText color="content.secondary" variant="footnote">
        {label}
      </RnText>
    </Box>
  )
}

const Place = () => (
  <Box bg="surface.primary" borderRadius="large" gap="s8" p="s16">
    <Box gap="s2">
      <RnText variant="headline">Café Savoy</RnText>
      <RnText color="content.secondary" variant="subheadline">
        Vítězná 5, Prague
      </RnText>
    </Box>
    <Box gap="s16" row>
      <Fact color="content.accent" icon="star-filled" label="4.8" />
      <Fact color="content.secondary" icon="schedule" label="Open until 22:00" />
      <Fact color="content.secondary" icon="location-on" label="1.2 km" />
    </Box>
  </Box>
)

type PillProps = {
  active?: boolean
  icon: NativeIconName
  label: string
  onPress: () => void
}

const Pill = ({active = false, icon, label, onPress}: PillProps) => {
  const theme = useAppTheme()

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityValue={active ? 'On' : undefined}
      align="center"
      animate="quick"
      bg={active ? 'fill.accent.base' : 'fill.tertiary'}
      borderRadius="full"
      gap="s6"
      haptic="selection"
      onPress={onPress}
      px="s16"
      py="s10"
      row
    >
      <NativeIcon
        allowFontScaling
        color={theme.color(active ? 'content.accent' : 'content.primary')}
        name={icon}
        size={18}
      />
      <RnText color={active ? 'content.accent' : 'content.primary'} variant="subheadlineMedium">
        {label}
      </RnText>
    </Pressable>
  )
}

/** Buttons of the app's own: Save and Like swap to the filled icon while on, Share opens the system's sheet. */
const Actions = () => {
  const [saved, setSaved] = useState(false)
  const [liked, setLiked] = useState(true)

  return (
    <Box gap="s8" row wrap>
      <Pill
        icon="share"
        label="Share"
        onPress={() => {
          void Share.share({message: 'Your SVG icons as native assets: https://github.com/hzblj/expo-native-icons'})
        }}
      />
      <Pill
        active={saved}
        icon={saved ? 'bookmark-filled' : 'bookmark'}
        label={saved ? 'Saved' : 'Save'}
        onPress={() => setSaved(value => !value)}
      />
      <Pill
        active={liked}
        icon={liked ? 'favorite-filled' : 'favorite'}
        label="Like"
        onPress={() => setLiked(value => !value)}
      />
    </Box>
  )
}

/** Icons where an app puts them: on tiles in a list, in a line of facts, inside buttons. */
export const WithTextSection = () => (
  <Section
    caption="With allowFontScaling an icon grows with the user’s text size, as the text beside it does, and maxFontSizeMultiplier caps both alike. It is off by default, so an icon inside a fixed-size control keeps its size."
    title="Beside text"
  >
    <SettingsList />
    <Place />
    <Actions />
    <CodeBlock code={'<NativeIcon\n  allowFontScaling\n  name="schedule"\n  size={16}\n/>'} />
  </Section>
)
