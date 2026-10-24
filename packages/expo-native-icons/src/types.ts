import type {ColorValue, StyleProp, ViewStyle} from 'react-native'

declare global {
  /**
   * The app's icon names, one key per SVG in its icon folder. Written by the config plugin into `native-icons.d.ts`,
   * or by `npx native-icons`. Empty until then. Global, so the generated declaration reaches it without an import.
   */
  interface NativeIcons {}
}

type DeclaredNativeIconName = keyof NativeIcons & string

/**
 * One of the app's icons. Once the plugin has written `native-icons.d.ts`, only those names type-check: an icon removed
 * from the folder fails at every call site. Before that, any string, so a project can adopt icons gradually.
 */
export type NativeIconName = [DeclaredNativeIconName] extends [never] ? string : DeclaredNativeIconName

export type NativeIconProps = {
  /**
   * What a screen reader says: the icon becomes an image element with this label. Unset, the icon is decorative and
   * hidden from VoiceOver and TalkBack, which is right next to text that already says the same.
   */
  accessibilityLabel?: string
  /** Read after the label, for an icon whose meaning needs a word more. Ignored without a label. */
  accessibilityHint?: string
  /**
   * Scales the icon with the user's text size (Dynamic Type on iOS, font scale on Android), for an icon set inline with
   * text so the two grow together. Off by default: an icon inside a fixed-size control keeps its size.
   */
  allowFontScaling?: boolean
  /** The largest text-size multiplier `allowFontScaling` follows. Unset, no limit. */
  maxFontSizeMultiplier?: number
  /** The tint. Unset, the platform's primary text colour (`UIColor.label`, `textColorPrimary`). */
  color?: ColorValue
  /** Which of the app's icons: a key of `NativeIcons`. */
  name: NativeIconName
  /** Width and height in points (dp on Android), before any font scaling. 24 by default. */
  size?: number
  style?: StyleProp<ViewStyle>
  testID?: string
}
