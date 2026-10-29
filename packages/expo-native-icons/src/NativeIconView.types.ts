import type {ComponentType} from 'react'
import type {ColorValue, StyleProp, ViewProps, ViewStyle} from 'react-native'

/**
 * `effect` as the native views take it: one flat record for every effect type, its repeat split into a count and a
 * continuous flag.
 */
export type NativeIconEffectRecord = {
  angle?: number
  direction?: string
  fill?: string
  inactiveLayers?: string
  repeatContinuous?: boolean
  repeatCount?: number
  repeatDelay?: number
  reversing?: boolean
  scope?: string
  speed?: number
  style?: string
  type: string
}

/** What the native view takes on both platforms: the icon by native name and everything `NativeIcon` passes on. */
export type NativeIconViewProps = ViewProps & {
  effect?: NativeIconEffectRecord
  effectActive?: boolean
  /** The trigger as a string (`number:3`), so the native side compares it by value. */
  effectTrigger?: string
  gradient?: boolean
  iconColor?: ColorValue
  renderingMode?: string
  /** The asset (iOS) or drawable (Android) to draw, by its native name. */
  resourceName: string
  secondaryColor?: ColorValue
  style?: StyleProp<ViewStyle>
  tertiaryColor?: ColorValue
  transition?: string
  variableValue?: number
}

/** `NativeIconView` on either platform: each takes at least `NativeIconViewProps`. */
export type NativeIconViewComponent = ComponentType<NativeIconViewProps>
