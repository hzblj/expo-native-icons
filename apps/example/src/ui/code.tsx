import {Box, type ColorToken, RnText} from '@hzblj/kara-ui'
import {Platform} from 'react-native'

/** Kara's typography has no monospaced face, and should not need one: the variant sets the size, this the face. */
const CODE = {fontFamily: Platform.select({android: 'monospace', default: 'Menlo'})}

type InlineCodeProps = {
  children: string
  color?: ColorToken
  /** How many lines it may take before it is cut. One by default. */
  lines?: number
}

/** A name or a call in a line of code, under a title or beside a label. */
export const InlineCode = ({children, color = 'content.secondary', lines = 1}: InlineCodeProps) => (
  <RnText color={color} numberOfLines={lines} style={CODE} variant="label">
    {children}
  </RnText>
)

/** A snippet to copy. */
export const CodeBlock = ({code}: {code: string}) => (
  <Box bg="fill.tertiary" borderRadius="medium" p="s16">
    <RnText color="content.secondary" selectable style={CODE} variant="footnote">
      {code}
    </RnText>
  </Box>
)
