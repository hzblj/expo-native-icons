import {NativeIconView} from './NativeIconView.android'
import type {NativeIconComponent} from './types'
import {useNativeIconViewProps} from './useNativeIconViewProps'

/**
 * One of the app's icons as the vector drawable the config plugin generated from its SVG, drawn by one view. Android
 * has no symbol machinery, so the view redraws the SF Symbols effects and transitions itself and colours the
 * drawable's paths as layers for the rendering modes and variable values. Synchronous, so it is there in the first
 * frame.
 */
export const NativeIcon: NativeIconComponent = props => <NativeIconView {...useNativeIconViewProps(props)} />
