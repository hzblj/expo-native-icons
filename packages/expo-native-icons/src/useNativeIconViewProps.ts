import {useMemo} from 'react'
import {useWindowDimensions} from 'react-native'

import {iconResourceName} from './iconResourceName'
import type {NativeIconViewProps} from './NativeIconView.types'
import {nativeIconEffectRecord, nativeIconTriggerKey} from './nativeIconEffect'
import type {NativeIconProps} from './types'

const DEFAULT_SIZE = 24

/**
 * `NativeIcon`'s props as both platforms' native view takes them: the frame from `size` and font scaling, the
 * accessibility of a labelled or a decorative icon, the effect flattened into one record. Each platform adds its own.
 */
export const useNativeIconViewProps = ({
  accessibilityHint,
  accessibilityLabel,
  allowFontScaling = false,
  color,
  effect,
  effectActive,
  effectTrigger,
  gradient,
  maxFontSizeMultiplier,
  name,
  renderingMode,
  secondaryColor,
  size = DEFAULT_SIZE,
  style,
  tertiaryColor,
  testID,
  transition,
  variableValue,
}: NativeIconProps): NativeIconViewProps => {
  const {fontScale} = useWindowDimensions()
  const scale = allowFontScaling ? Math.min(fontScale, maxFontSizeMultiplier || fontScale) : 1
  const side = Math.round(size * scale)
  const frame = useMemo(() => ({height: side, width: side}), [side])
  const effectKey = effect ? JSON.stringify(effect) : undefined
  // Keyed by content, so an effect object written inline neither restarts nor re-sends the effect every render.
  const record = useMemo(() => (effectKey ? nativeIconEffectRecord(JSON.parse(effectKey)) : undefined), [effectKey])
  const isLabelled = !!accessibilityLabel

  return {
    accessibilityElementsHidden: !isLabelled,
    accessibilityHint: isLabelled ? accessibilityHint : undefined,
    accessibilityLabel,
    accessibilityRole: isLabelled ? 'image' : undefined,
    accessible: isLabelled,
    effect: record,
    effectActive,
    effectTrigger: nativeIconTriggerKey(effectTrigger),
    gradient,
    iconColor: color,
    importantForAccessibility: isLabelled ? 'yes' : 'no-hide-descendants',
    renderingMode,
    resourceName: iconResourceName(name),
    secondaryColor,
    style: [frame, style],
    tertiaryColor,
    testID,
    transition,
    variableValue,
  }
}
