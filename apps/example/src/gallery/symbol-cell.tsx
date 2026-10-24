import {NativeIcon, type NativeIconName} from '@hzblj/expo-native-icons'
import {Box, Pressable, RnText, useAppTheme} from '@hzblj/kara-ui'
import {memo} from 'react'

/** Two lines of the `label` variant: every cell keeps the same height, whether its name wraps or not. */
const NAME_HEIGHT = 32

type SymbolCellProps = {
  name: NativeIconName
  onPress: (name: NativeIconName) => void
}

/** One icon of the gallery: the glyph, drawn natively, and its name. */
export const SymbolCell = memo(({name, onPress}: SymbolCellProps) => {
  const theme = useAppTheme()

  return (
    <Pressable
      accessibilityHint="Shows its native names and the code that draws it"
      accessibilityLabel={name}
      align="center"
      bg="surface.primary"
      borderRadius="large"
      gap="s10"
      onPress={() => onPress(name)}
      pb="s10"
      pt="s20"
      px="s8"
    >
      <NativeIcon color={theme.color('content.primary')} name={name} size={32} />
      <Box h={NAME_HEIGHT}>
        <RnText align="center" color="content.secondary" numberOfLines={2} variant="label">
          {name}
        </RnText>
      </Box>
    </Pressable>
  )
})
