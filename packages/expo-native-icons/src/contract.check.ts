import {NativeIcon as AndroidIcon} from './NativeIcon.android'
import {NativeIcon as IosIcon} from './NativeIcon.ios'
import {NativeIconView as AndroidView} from './NativeIconView.android'
import {NativeIconView as IosView} from './NativeIconView.ios'
import type {NativeIconViewComponent} from './NativeIconView.types'
import type {NativeIconComponent} from './types'

export const _iosIcon: NativeIconComponent = IosIcon
export const _androidIcon: NativeIconComponent = AndroidIcon
export const _iosView: NativeIconViewComponent = IosView
export const _androidView: NativeIconViewComponent = AndroidView
