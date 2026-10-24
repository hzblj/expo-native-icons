import {NativeIcon} from '@hzblj/expo-native-icons'
import {Box, RnText, useAppTheme} from '@hzblj/kara-ui'
import {Platform} from 'react-native'

import {CodeBlock, Section} from '../ui'

const FILE = Platform.OS === 'ios' ? 'share.ios.svg' : 'share.android.svg'
const OTHER = Platform.OS === 'ios' ? 'Android' : 'iOS'

const FOLDER =
  'assets/icons/\n  share.ios.svg      // iOS\n  share.android.svg  // Android\n\n<NativeIcon name="share" />'

/** One name, a glyph per platform: `share` is the square and arrow on iOS, three joined dots on Android. */
export const VariantsSection = () => {
  const theme = useAppTheme()

  return (
    <Section
      caption="A variant replaces <name>.svg on its platform, and a name with only one variant exists on that platform alone. Here share is Material’s ios_share on iOS and its share glyph on Android, each where its users expect it."
      title="Platform variants"
    >
      <Box align="center" bg="surface.primary" borderRadius="large" gap="s16" p="s16" row>
        <Box align="center" bg="fill.accent.base" borderRadius="medium" h={72} justify="center" w={72}>
          <NativeIcon accessibilityLabel="Share" color={theme.color('content.accent')} name="share" size={40} />
        </Box>
        <Box flex={1} gap="s4">
          <RnText variant="headline">share</RnText>
          <RnText color="content.secondary" variant="footnote">
            {`Drawn from ${FILE}. The ${OTHER} glyph never reaches this app’s bundle.`}
          </RnText>
        </Box>
      </Box>
      <CodeBlock code={FOLDER} />
    </Section>
  )
}
