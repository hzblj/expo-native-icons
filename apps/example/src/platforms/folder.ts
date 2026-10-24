import type {NativeIconName} from '@hzblj/expo-native-icons'

import {SYMBOL_COUNT} from '../gallery/symbols'

/** The icons of the folder that are not the gallery's: the platform variant, the two fill rules, the empty search. */
export const OTHER_ICONS: NativeIconName[] = ['even-odd', 'non-zero', 'search-off', 'share']

/** Every name in assets/icons: each gallery symbol twice, outlined and filled, and the others. */
export const ICON_COUNT = SYMBOL_COUNT * 2 + OTHER_ICONS.length
