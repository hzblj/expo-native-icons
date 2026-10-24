import {NativeIcon} from '@hzblj/expo-native-icons'
import {Box, RnText, useAppTheme} from '@hzblj/kara-ui'
import type {ReactNode} from 'react'

import {CodeBlock, Section} from '../ui'

const Example = ({children, read, title}: {children: ReactNode; read: string; title: string}) => (
  <Box bg="surface.primary" borderRadius="large" flex={1} gap="s12" p="s16">
    <RnText color="content.tertiary" variant="captionMedium">
      {title.toUpperCase()}
    </RnText>
    <Box align="center" gap="s6" row>
      {children}
    </Box>
    <RnText color="content.secondary" variant="footnote">
      {read}
    </RnText>
  </Box>
)

/** A label makes an icon an image element; without one it is decorative, and screen readers skip it. */
export const ScreenReadersSection = () => {
  const theme = useAppTheme()

  return (
    <Section
      caption="A labelled icon is an image element for VoiceOver and TalkBack, its hint read after the label. Without a label it is decorative and hidden from both, so the text next to it is read once instead of an unnamed image."
      title="Screen readers"
    >
      <Box gap="s12" row>
        <Example read="Read as “Verified, image” after the name." title="Labelled">
          <RnText variant="subheadlineMedium">Jan Blazej</RnText>
          <NativeIcon
            accessibilityLabel="Verified"
            color={theme.color('content.accent')}
            name="verified-filled"
            size={18}
          />
        </Example>
        <Example read="Read as “Inbox”: the icon is skipped." title="Decorative">
          <NativeIcon color={theme.color('content.secondary')} name="mail" size={18} />
          <RnText variant="subheadlineMedium">Inbox</RnText>
        </Example>
      </Box>
      <CodeBlock code={'<NativeIcon\n  accessibilityLabel="Verified"\n  name="verified-filled"\n/>'} />
    </Section>
  )
}
