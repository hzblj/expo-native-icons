import {NativeIcon} from '@hzblj/expo-native-icons'
import {Box, HStack, Island, RnText, Slider, Spacer, Text, useAppTheme, VStack} from '@hzblj/kara-ui'
import {useState} from 'react'
import {Platform} from 'react-native'

import {CodeBlock, Section} from '../ui'

const MIN = 12
const MAX = 200
const LADDER = [16, 24, 32, 48, 64]
/** Room for the largest size, with a margin. */
const STAGE = MAX + 32
const UNIT = Platform.OS === 'ios' ? 'pt' : 'dp'

/** One glyph from 12 to 200: the vector is kept on both platforms, so nothing is scaled from a bitmap. */
export const SizeSection = () => {
  const theme = useAppTheme()
  const [size, setSize] = useState(96)

  return (
    <Section
      caption="The image set keeps the SVG’s vector data and the drawable is a path, so the edge is drawn at the size it is shown: as sharp at 200 as at 16."
      title="Size"
    >
      <Box bg="surface.primary" borderRadius="large">
        <Box align="center" h={STAGE} justify="center">
          <NativeIcon color={theme.color('content.primary')} name="rocket-launch" size={size} />
        </Box>
        <Box bg="border.tertiary" h={1} mx="s16" />
        <Box align="flex-end" justify="space-around" px="s16" py="s16" row>
          {LADDER.map(side => (
            <Box align="center" gap="s6" key={side}>
              <NativeIcon color={theme.color('content.secondary')} name="rocket-launch" size={side} />
              <RnText color="content.tertiary" variant="caption">
                {String(side)}
              </RnText>
            </Box>
          ))}
        </Box>
      </Box>
      <Island>
        <VStack bg="surface.primary" borderRadius="large" p="s16" spacing="s8" wide>
          <HStack wide>
            <Text variant="subheadlineMedium">Size</Text>
            <Spacer />
            <Text color="content.secondary" variant="subheadline">
              {`${size} ${UNIT}`}
            </Text>
          </HStack>
          <Slider max={MAX} min={MIN} onValueChange={value => setSize(Math.round(value))} value={size} />
        </VStack>
      </Island>
      <CodeBlock code={`<NativeIcon\n  name="rocket-launch"\n  size={${size}}\n/>`} />
    </Section>
  )
}
