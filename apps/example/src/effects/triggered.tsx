import type {NativeIconEffect, NativeIconName} from '@hzblj/expo-native-icons'
import {useState} from 'react'

import {CodeBlock, Grid, Section} from '../ui'
import {EffectCard} from './effect-card'

type Triggered = {effect: NativeIconEffect; label: string; name: NativeIconName}

const EFFECTS: Triggered[] = [
  {effect: {type: 'bounce'}, label: 'bounce', name: 'favorite-filled'},
  {effect: {direction: 'down', type: 'bounce'}, label: 'bounce down', name: 'thumb-up-filled'},
  {effect: {type: 'pulse'}, label: 'pulse', name: 'mic-filled'},
  {effect: {type: 'wiggle'}, label: 'wiggle', name: 'notifications-filled'},
  {effect: {direction: 'left', type: 'wiggle'}, label: 'wiggle left', name: 'send-filled'},
  {effect: {type: 'rotate'}, label: 'rotate', name: 'settings-filled'},
  {effect: {type: 'breathe'}, label: 'breathe', name: 'eco-filled'},
  {effect: {fill: 'iterative', type: 'variableColor'}, label: 'variableColor', name: 'signal-bars'},
  {effect: {scope: 'byLayer', type: 'bounce'}, label: 'bounce byLayer', name: 'bell-badge'},
]

const CODE = `const [taps, setTaps] = useState(0)

<NativeIcon
  effect={{type: 'bounce'}}
  effectTrigger={taps}
  name="favorite-filled"
/>`

const TriggeredCard = ({effect, label, name}: Triggered) => {
  const [taps, setTaps] = useState(0)

  return (
    <EffectCard effect={effect} effectTrigger={taps} label={label} name={name} onPress={() => setTaps(t => t + 1)} />
  )
}

/** Each tap changes the trigger, and a change plays the effect once. */
export const TriggeredSection = () => (
  <Section
    caption="A change of effectTrigger plays the effect once, never on mount. iOS plays UIKit’s own symbol effect (wiggle, rotate and breathe from iOS 18); Android draws the same curve. bounce byLayer moves the bell, its clapper and its badge one after another: each is a data-motion-group of the SVG."
    title="Tap to play"
  >
    <Grid columns={3} items={EFFECTS} keyOf={item => item.label} render={item => <TriggeredCard {...item} />} />
    <CodeBlock code={CODE} />
  </Section>
)
