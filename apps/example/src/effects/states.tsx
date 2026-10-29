import type {NativeIconEffect} from '@hzblj/expo-native-icons'
import {Box, Pressable, RnText} from '@hzblj/kara-ui'
import {useState} from 'react'

import {CodeBlock, Grid, Section} from '../ui'
import {EffectCard} from './effect-card'

const STATES: {effect: NativeIconEffect; label: string}[] = [
  {effect: {type: 'scale'}, label: 'scale up'},
  {effect: {direction: 'down', type: 'scale'}, label: 'scale down'},
  {effect: {type: 'disappear'}, label: 'disappear'},
  {effect: {direction: 'up', type: 'disappear'}, label: 'disappear up'},
  {effect: {type: 'appear'}, label: 'appear'},
  {effect: {scope: 'byLayer', type: 'disappear'}, label: 'byLayer'},
]

const CODE = `<NativeIcon
  effect={{type: 'disappear'}}
  effectActive={hidden}
  name="bell-badge"
/>`

/** Scale, appear and disappear hold their state while active and animate back when it turns off. */
export const StatesSection = () => {
  const [on, setOn] = useState(false)

  return (
    <Section
      caption="scale, appear and disappear are states, not one-off moves: the icon stays scaled or gone while effectActive is true and animates back when it turns false. appear plays the icon in each time it turns on."
      title="States"
    >
      <Grid
        columns={3}
        items={STATES}
        keyOf={item => item.label}
        render={item => <EffectCard effect={item.effect} effectActive={on} label={item.label} name="bell-badge" />}
      />
      <Pressable
        accessibilityLabel={on ? 'Turn off' : 'Turn on'}
        align="center"
        bg="fill.accent.base"
        borderRadius="full"
        haptic
        onPress={() => setOn(value => !value)}
        py="s12"
      >
        <Box>
          <RnText color="content.accent" variant="subheadlineMedium">
            {on ? 'effectActive: true' : 'effectActive: false'}
          </RnText>
        </Box>
      </Pressable>
      <CodeBlock code={CODE} />
    </Section>
  )
}
