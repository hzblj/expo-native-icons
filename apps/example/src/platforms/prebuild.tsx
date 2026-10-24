import {Box, RnText} from '@hzblj/kara-ui'
import {Platform} from 'react-native'

import {CodeBlock, Grid, InlineCode, Rows, Section} from '../ui'

const CONFIG =
  "// app.config.ts\nplugins: [\n  [\n    '@hzblj/expo-native-icons',\n    {source: './assets/icons'},\n  ],\n]"

const OPTIONS = [
  {description: 'The folder of SVGs, one icon per file.', fallback: 'required', name: 'source'},
  {description: 'Where the names are declared, or false to skip it.', fallback: 'native-icons.d.ts', name: 'types'},
  {description: 'The size a tab bar or a menu draws an icon at.', fallback: '24', name: 'iosSize'},
]

type Destination = {
  description: string
  folder: string
  kind: string
  platform: 'android' | 'ios'
  title: string
}

const DESTINATIONS: Destination[] = [
  {
    description: 'A template SVG with its vector data kept, in the app’s own asset catalog.',
    folder: 'Images.xcassets',
    kind: 'Image set',
    platform: 'ios',
    title: 'iOS',
  },
  {
    description: 'Its paths filled white, compiled like any resource and tinted where it is drawn.',
    folder: 'res/drawable',
    kind: 'Vector drawable',
    platform: 'android',
    title: 'Android',
  },
]

const DestinationCard = ({destination}: {destination: Destination}) => (
  <Box bg="surface.primary" borderRadius="large" flex={1} gap="s8" p="s16">
    <Box align="center" justify="space-between" row>
      <RnText variant="subheadlineMedium">{destination.title}</RnText>
      {destination.platform === Platform.OS ? (
        <Box bg="fill.accent.base" borderRadius="full" px="s8" py="s2">
          <RnText color="content.accent" variant="captionMedium">
            This phone
          </RnText>
        </Box>
      ) : null}
    </Box>
    <Box gap="s2">
      <RnText color="content.secondary" variant="footnoteMedium">
        {destination.kind}
      </RnText>
      <InlineCode>{destination.folder}</InlineCode>
    </Box>
    <RnText color="content.secondary" variant="footnote">
      {destination.description}
    </RnText>
  </Box>
)

/** What the config plugin is given, and what it writes where. */
export const PrebuildSection = () => (
  <Section
    caption="A new or changed SVG needs a prebuild and a native build: the icons are bundled resources, so an update over the air can’t add one."
    title="At prebuild"
  >
    <CodeBlock code={CONFIG} />
    <Rows>
      {OPTIONS.map(option => (
        <Box gap="s2" key={option.name} px="s16" py="s12">
          <Box gap="s12" justify="space-between" row>
            <InlineCode color="content.primary">{option.name}</InlineCode>
            <InlineCode color="content.tertiary">{option.fallback}</InlineCode>
          </Box>
          <RnText color="content.secondary" variant="footnote">
            {option.description}
          </RnText>
        </Box>
      ))}
    </Rows>
    <Grid
      items={DESTINATIONS}
      keyOf={destination => destination.platform}
      render={destination => <DestinationCard destination={destination} />}
    />
  </Section>
)
