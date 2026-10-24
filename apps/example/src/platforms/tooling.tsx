import {Box, RnText} from '@hzblj/kara-ui'

import {CodeBlock, InlineCode, Rows, Section} from '../ui'
import {ICON_COUNT} from './folder'

const DECLARATION =
  "// native-icons.d.ts, generated\ndeclare global {\n  interface NativeIcons {\n    bolt: true\n    'bolt-filled': true\n    // one key per SVG\n  }\n}"

const USAGE = '<NativeIcon name="bolt" />\n\n// @ts-expect-error: not in the folder\n<NativeIcon name="lightning" />'

const CLI = `npx native-icons ./assets/icons\n\n# native-icons: ${ICON_COUNT} icons\n# (${ICON_COUNT} iOS, ${ICON_COUNT} Android)\n# → native-icons.d.ts`

const CLEANUP = [
  {
    detail: '"author": "@hzblj/expo-native-icons"',
    text: 'Removes the image sets it stamped whose SVG is gone.',
    title: 'iOS',
  },
  {
    detail: 'native_icon_*.xml',
    text: 'Removes the drawables with its prefix that the folder no longer makes.',
    title: 'Android',
  },
]

/** Typed names, the CLI that writes them without Expo, and what a prebuild removes. */
export const ToolingSection = () => (
  <>
    <Section
      caption="NativeIconName is the keys of a global NativeIcons, which the plugin rewrites whenever the config is read: expo start alone picks up a new SVG, and a deleted one fails at every call site. Until the file exists any string type-checks, so a project can adopt icons gradually."
      title="Typed names"
    >
      <CodeBlock code={DECLARATION} />
      <CodeBlock code={USAGE} />
    </Section>
    <Section
      caption="It checks every SVG the way prebuild will and writes the declaration, with no Expo project: for CI, or for a type check that runs before Metro ever starts. --out picks the file."
      title="CLI"
    >
      <CodeBlock code={CLI} />
    </Section>
    <Section
      caption="An image set added by hand is never touched. On Android the native_icon_ prefix belongs to the plugin: never give a drawable of your own a name that starts with it."
      title="Clean-up"
    >
      <Rows>
        {CLEANUP.map(entry => (
          <Box gap="s4" key={entry.title} px="s16" py="s12">
            <RnText variant="subheadlineMedium">{entry.title}</RnText>
            <RnText color="content.secondary" variant="footnote">
              {entry.text}
            </RnText>
            <InlineCode>{entry.detail}</InlineCode>
          </Box>
        ))}
      </Rows>
    </Section>
  </>
)
