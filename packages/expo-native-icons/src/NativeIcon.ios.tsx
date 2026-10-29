import {iconSymbolName} from './iconResourceName'
import {NativeIconView} from './NativeIconView.ios'
import type {NativeIconComponent} from './types'
import {useNativeIconViewProps} from './useNativeIconViewProps'

/**
 * One of the app's icons as the custom SF Symbol the config plugin generated from its SVG, in a `UIImageView`: UIKit
 * plays its effects and transitions and draws its rendering modes and variable values, the way it does for Apple's
 * own symbols. A catalog prebuilt before symbols existed has only the template image, which is drawn tinted instead.
 * Synchronous, so it is there in the first frame.
 */
export const NativeIcon: NativeIconComponent = props => (
  <NativeIconView {...useNativeIconViewProps(props)} symbolName={iconSymbolName(props.name)} />
)
