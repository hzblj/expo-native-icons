import {requireNativeView} from 'expo'

import type {NativeIconViewProps} from './NativeIconView.types'

/**
 * One view drawing the icon's vector drawable at the view's size, tinted: path by path when a rendering mode, a
 * variable value or an effect needs its layers, and with the SF Symbols effects and transitions redrawn on Android.
 * No Compose host per icon, so a list of rows stays cheap.
 */
export const NativeIconView = requireNativeView<NativeIconViewProps>('ExpoNativeIcons', 'NativeIconView')
