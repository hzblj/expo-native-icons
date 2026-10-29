import type {NativeIconEffect, NativeIconName} from '@hzblj/expo-native-icons'
import {Box, Pressable, RnText} from '@hzblj/kara-ui'
import {useState} from 'react'

import {CodeBlock, Grid, Section} from '../ui'
import {EffectCard} from './effect-card'

type Running = {effect: NativeIconEffect; label: string; name: NativeIconName}

const EFFECTS: Running[] = [
  {effect: {type: 'pulse'}, label: 'pulse', name: 'mic-filled'},
  {effect: {type: 'variableColor'}, label: 'cumulative', name: 'volume'},
  {effect: {fill: 'iterative', reversing: true, type: 'variableColor'}, label: 'iterative', name: 'signal-bars'},
  {effect: {repeat: 'continuous', type: 'rotate'}, label: 'rotate', name: 'settings'},
  {effect: {style: 'pulse', type: 'breathe'}, label: 'breathe pulse', name: 'favorite-filled'},
  {effect: {type: 'wiggle'}, label: 'wiggle', name: 'notifications'},
]

const CODE = `<NativeIcon
  effect={{type: 'variableColor', fill: 'iterative', reversing: true}}
  effectActive={listening}
  name="signal-bars"
/>`

/** Effects that keep going while effectActive is true, on their own cadence. */
export const RunningSection = () => {
  const [active, setActive] = useState(true)

  return (
    <Section
      caption="Without a trigger an effect runs for as long as effectActive is true (the default) and stops gracefully when it turns false. variableColor lights the layers marked data-variable: cumulative keeps them on, iterative lights one at a time."
      title="While active"
    >
      <Grid
        columns={3}
        items={EFFECTS}
        keyOf={item => item.label}
        render={item => <EffectCard effect={item.effect} effectActive={active} label={item.label} name={item.name} />}
      />
      <Pressable
        accessibilityLabel={active ? 'Stop' : 'Run'}
        align="center"
        bg="fill.accent.base"
        borderRadius="full"
        haptic
        onPress={() => setActive(value => !value)}
        py="s12"
      >
        <Box>
          <RnText color="content.accent" variant="subheadlineMedium">
            {active ? 'Stop' : 'Run'}
          </RnText>
        </Box>
      </Pressable>
      <CodeBlock code={CODE} />
    </Section>
  )
}
