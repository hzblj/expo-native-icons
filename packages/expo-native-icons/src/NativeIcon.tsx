import {useMemo} from 'react'
import {useWindowDimensions} from 'react-native'

import {iconResourceName} from './iconResourceName'
import {NativeIconView} from './NativeIconView'
import type {NativeIconProps} from './types'

const DEFAULT_SIZE = 24

/**
 * One of the app's icons, drawn natively from the asset the config plugin generated: a template image from the asset
 * catalog on iOS, a vector drawable on Android, scaled to `size` and tinted with `color`. Synchronous on both
 * platforms, so it is there in the first frame.
 */
export const NativeIcon = ({
  accessibilityHint,
  accessibilityLabel,
  allowFontScaling = false,
  color,
  maxFontSizeMultiplier,
  name,
  size = DEFAULT_SIZE,
  style,
  testID,
}: NativeIconProps) => {
  const {fontScale} = useWindowDimensions()
  const scale = allowFontScaling ? Math.min(fontScale, maxFontSizeMultiplier || fontScale) : 1
  const side = Math.round(size * scale)
  const frame = useMemo(() => ({height: side, width: side}), [side])
  const isLabelled = !!accessibilityLabel

  return (
    <NativeIconView
      accessibilityElementsHidden={!isLabelled}
      accessibilityHint={isLabelled ? accessibilityHint : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={isLabelled ? 'image' : undefined}
      accessible={isLabelled}
      iconColor={color}
      importantForAccessibility={isLabelled ? 'yes' : 'no-hide-descendants'}
      resourceName={iconResourceName(name)}
      style={[frame, style]}
      testID={testID}
    />
  )
}
