import {NativeIcon, type NativeIconName} from '@hzblj/expo-native-icons'
import {Box, RnText, useAppTheme} from '@hzblj/kara-ui'

import {CodeBlock, Grid, InlineCode, Rows, Section} from '../ui'

const RULES = [
  {allowed: true, text: 'Only <path> elements, in one <svg>'},
  {allowed: true, text: 'A numeric viewBox, at any origin'},
  {allowed: true, text: 'Any colour: every icon is a template'},
  {allowed: true, text: 'File names in lower kebab or snake case'},
  {allowed: false, text: '<g>, <mask>, <clipPath>, strokes'},
  {allowed: false, text: 'arrow-left.svg beside arrow_left.svg'},
]

const ERROR =
  '[native-icons] badge.svg: only <path>\nelements are supported, found <mask>.\nFlatten groups, clips, masks and\nstrokes first'

type FillRule = {
  attribute: string
  description: string
  name: NativeIconName
}

const FILL_RULES: FillRule[] = [
  {attribute: 'fill-rule="evenodd"', description: 'Every inner contour is a hole.', name: 'even-odd'},
  {attribute: 'No fill-rule', description: 'Non-zero: the same contours fill in.', name: 'non-zero'},
]

const FillRuleTile = ({rule}: {rule: FillRule}) => {
  const theme = useAppTheme()

  return (
    <Box bg="surface.primary" borderRadius="large" flex={1} gap="s12" p="s16">
      <NativeIcon color={theme.color('content.primary')} name={rule.name} size={56} />
      <Box gap="s2">
        <InlineCode color="content.primary">{rule.attribute}</InlineCode>
        <RnText color="content.secondary" variant="footnote">
          {rule.description}
        </RnText>
      </Box>
    </Box>
  )
}

/** What a glyph may be made of, what fails the prebuild, and the fill rule that keeps holes open. */
export const SvgRulesSection = () => {
  const theme = useAppTheme()

  return (
    <>
      <Section
        caption="Anything else fails the prebuild, and the CLI, naming the file: a glyph that silently lost its mask is worse than none, since a leftover mask flattens into a solid square. Flatten the drawing before exporting it."
        title="The SVGs"
      >
        <Rows inset="s48">
          {RULES.map(rule => (
            <Box align="center" gap="s12" key={rule.text} px="s16" py="s12" row>
              <NativeIcon
                accessibilityLabel={rule.allowed ? 'Accepted' : 'Refused'}
                color={theme.color(rule.allowed ? 'content.success' : 'content.destructive')}
                name={rule.allowed ? 'check-circle-filled' : 'cancel-filled'}
                size={20}
              />
              <RnText flex={1} variant="subheadline">
                {rule.text}
              </RnText>
            </Box>
          ))}
        </Rows>
        <CodeBlock code={ERROR} />
      </Section>
      <Section
        caption="The same three circles, all drawn in one direction. Figma exports holes with the even-odd rule, and both platforms keep it: android:fillType on Android, the SVG’s own fill-rule on iOS."
        title="Holes"
      >
        <Grid items={FILL_RULES} keyOf={rule => rule.name} render={rule => <FillRuleTile rule={rule} />} />
      </Section>
    </>
  )
}
