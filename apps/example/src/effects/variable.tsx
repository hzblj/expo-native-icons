import {NativeIcon} from '@hzblj/expo-native-icons'
import {Box, HStack, Island, Slider, Spacer, Text, useAppTheme, VStack} from '@hzblj/kara-ui'
import {useState} from 'react'

import {CodeBlock, Section} from '../ui'

const CODE = (value: number) => `<NativeIcon
  name="signal-bars"
  transition="automatic"
  variableValue={${value.toFixed(2)}}
/>`

const SVG = `<path data-variable="" d="…"/>  <!-- on above 0 -->
<path data-variable="" d="…"/>  <!-- above 1/4 -->
<path data-variable="0.9" d="…"/>  <!-- or a threshold of its own -->`

/** A value from 0 to 1 switches the layers marked data-variable on in order, the rest dimmed. */
export const VariableSection = () => {
  const theme = useAppTheme()
  const [value, setValue] = useState(0.6)

  return (
    <Section
      caption="Paths marked data-variable switch on once the value passes their threshold: an even step each in the order they are drawn, or the number the attribute gives. The rest are dimmed to 30 %, as SF Symbols does. With a transition set, a new value eases in."
      title="Variable value"
    >
      <Box align="center" bg="surface.primary" borderRadius="large" gap="s32" justify="center" py="s24" row>
        {(['signal-bars', 'volume'] as const).map(name => (
          <NativeIcon
            color={theme.color('content.primary')}
            key={name}
            name={name}
            size={64}
            transition="automatic"
            variableValue={value}
          />
        ))}
      </Box>
      <Island>
        <VStack bg="surface.primary" borderRadius="large" p="s16" spacing="s8" wide>
          <HStack wide>
            <Text variant="subheadlineMedium">variableValue</Text>
            <Spacer />
            <Text color="content.secondary" monospacedDigit variant="subheadline">
              {value.toFixed(2)}
            </Text>
          </HStack>
          <Slider max={1} min={0} onValueChange={setValue} value={value} />
        </VStack>
      </Island>
      <CodeBlock code={SVG} />
      <CodeBlock code={CODE(value)} />
    </Section>
  )
}
