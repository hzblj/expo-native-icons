import {NativeIcon, type NativeIconProps} from '@hzblj/expo-native-icons'
import {Box, Pressable, RnText, useAppTheme} from '@hzblj/kara-ui'

type EffectCardProps = Omit<NativeIconProps, 'size'> & {
  /** What the card plays, under the icon. */
  label: string
  /** Called on a tap; the card is static without it. */
  onPress?: () => void
}

/** One icon on a card with its label, the tap that plays it, and nothing else. */
export const EffectCard = ({label, onPress, ...icon}: EffectCardProps) => {
  const theme = useAppTheme()

  return (
    <Pressable
      accessibilityLabel={label}
      align="center"
      bg="surface.primary"
      borderRadius="large"
      disabled={!onPress}
      gap="s12"
      haptic={onPress ? 'selection' : undefined}
      onPress={onPress}
      py="s20"
    >
      <Box align="center" h={56} justify="center" w={56}>
        <NativeIcon color={theme.color('content.primary')} size={44} {...icon} />
      </Box>
      <RnText color="content.secondary" monospaced numberOfLines={1} variant="caption">
        {label}
      </RnText>
    </Pressable>
  )
}
