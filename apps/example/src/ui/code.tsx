import {Box, type ColorToken, useAppTheme} from '@hzblj/kara-ui'
import {useMemo} from 'react'
import {Platform, Text} from 'react-native'

const MONOSPACE = Platform.select({android: 'monospace', default: 'Menlo'})

const useCodeStyle = (size: number, color: ColorToken = 'content.secondary') => {
  const theme = useAppTheme()

  // A whole number of points: with a fractional line height, iOS could lay the paragraph out a hair short of its
  // last line and drop it.
  return useMemo(
    () => ({color: theme.color(color), fontFamily: MONOSPACE, fontSize: size, lineHeight: Math.round(size * 1.5)}),
    [color, size, theme]
  )
}

type InlineCodeProps = {
  children: string
  color?: ColorToken
  /** How many lines it may take before it is cut. One by default. */
  lines?: number
}

/** A name or a call in a line of code, under a title or beside a label. */
export const InlineCode = ({children, color, lines = 1}: InlineCodeProps) => (
  <Text numberOfLines={lines} style={useCodeStyle(12, color)}>
    {children}
  </Text>
)

/** A snippet to copy. Plain React Native text: kara's own text has no monospaced face, and should not need one. */
export const CodeBlock = ({code}: {code: string}) => (
  <Box bg="fill.tertiary" borderRadius="medium" p="s16">
    <Text selectable style={useCodeStyle(13)}>
      {code}
    </Text>
  </Box>
)
