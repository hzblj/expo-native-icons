import type {NativeIconName, NativeIconTransition} from '@hzblj/expo-native-icons'
import {Island, SegmentedControl} from '@hzblj/kara-ui'
import {useState} from 'react'

import {CodeBlock, Grid, Section} from '../ui'
import {EffectCard} from './effect-card'

const TRANSITIONS: NativeIconTransition[] = ['replace', 'replaceUpUp', 'replaceOffUp', 'magicReplace']

/** The segments' labels: the full names do not fit four to a row. */
const LABELS = ['replace', 'upUp', 'offUp', 'magic']

const PAIRS: [NativeIconName, NativeIconName][] = [
  ['favorite', 'favorite-filled'],
  ['light-mode-filled', 'dark-mode-filled'],
  ['mic', 'mic-filled'],
]

const CODE = (transition: NativeIconTransition) => `<NativeIcon
  name={liked ? 'favorite-filled' : 'favorite'}
  transition="${transition}"
/>`

const SwapCard = ({pair, transition}: {pair: [NativeIconName, NativeIconName]; transition: NativeIconTransition}) => {
  const [second, setSecond] = useState(false)

  return (
    <EffectCard
      label={second ? pair[1] : pair[0]}
      name={second ? pair[1] : pair[0]}
      onPress={() => setSecond(value => !value)}
      transition={transition}
    />
  )
}

/** A new name animates in with the transition: tap a card to swap its icon. */
export const TransitionsSection = () => {
  const [index, setIndex] = useState(0)
  const transition = TRANSITIONS[index] ?? 'replace'

  return (
    <Section
      caption="With a transition a change of name animates: replace scales the old icon down and the new one up, replaceUpUp scales both up, replaceOffUp drops the old one at once. magicReplace morphs the layers two symbols share on iOS 18 and falls back to a replace elsewhere."
      title="Transitions"
    >
      <Island>
        <SegmentedControl onChange={setIndex} selectedIndex={index} values={LABELS} />
      </Island>
      <Grid
        columns={3}
        items={PAIRS}
        keyOf={pair => pair.join()}
        render={pair => <SwapCard pair={pair} transition={transition} />}
      />
      <CodeBlock code={CODE(transition)} />
    </Section>
  )
}
