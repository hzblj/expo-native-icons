import {requireNativeView} from 'expo'

import type {NativeIconViewProps} from './NativeIconView.types'

export type NativeIconViewIosProps = NativeIconViewProps & {
  /**
   * The custom SF Symbol to draw, by its native name (`iconSymbolName`): effects, transitions, rendering modes and
   * variable values work on it. Without one, or when the catalog has none, the `resourceName` image, tinted only.
   */
  symbolName?: string
}

/**
 * A `UIImageView` drawing the icon's SF Symbol (or its template image) at the view's size, tinted, through UIKit's own
 * symbol effects and transitions. No SwiftUI host per icon, so a list of rows stays cheap.
 */
export const NativeIconView = requireNativeView<NativeIconViewIosProps>('ExpoNativeIcons', 'NativeIconView')
