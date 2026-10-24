import {requireNativeView} from 'expo'
import type {ColorValue, StyleProp, ViewProps, ViewStyle} from 'react-native'

export type NativeIconViewProps = ViewProps & {
  iconColor?: ColorValue
  /** The asset (iOS) or drawable (Android) to draw, by its native name. */
  resourceName: string
  style?: StyleProp<ViewStyle>
}

/**
 * `UIImageView` on iOS, `ImageView` on Android: a template image or vector drawable by native name, scaled to fit and
 * tinted. No SwiftUI or Compose host per icon, so a list of rows stays cheap.
 */
export const NativeIconView = requireNativeView<NativeIconViewProps>('ExpoNativeIcons', 'NativeIconView')
