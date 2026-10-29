import type {NativeIconEffectRecord} from './NativeIconView.types'
import type {NativeIconEffect, NativeIconEffectTrigger} from './types'

/**
 * `effect` as the native views take it: one flat record, its `repeat` split into a count and a continuous flag. For a
 * view of your own that plays the same effects (kara's `Icon` hands it to its SwiftUI modifier and Compose view).
 */
export const nativeIconEffectRecord = (effect: NativeIconEffect): NativeIconEffectRecord => {
  const {repeat, ...rest} = effect

  return {
    ...rest,
    repeatContinuous: repeat === 'continuous' ? true : undefined,
    repeatCount: typeof repeat === 'number' ? repeat : undefined,
  }
}

/**
 * `effectTrigger` as a string the native side compares by value: `number:3` and `string:3` differ, so a trigger that
 * changes type still plays.
 */
export const nativeIconTriggerKey = (trigger: NativeIconEffectTrigger | undefined): string | undefined =>
  trigger === undefined ? undefined : `${typeof trigger}:${String(trigger)}`
