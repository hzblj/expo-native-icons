import type {ReactNode} from 'react'
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

/**
 * Whether an effect moves the icon as one piece or its layers one after another. A layer is a path of the SVG, and
 * paths with the same `data-motion-group` move together. Unset, the platform decides.
 */
export type NativeIconEffectScope = 'byLayer' | 'wholeSymbol'

/** How often an effect plays: a number of times, or `continuous` for a smooth loop with no pause. */
export type NativeIconEffectRepeat = number | 'continuous'

type EffectTiming = {
  /** Playback speed, 1 by default. */
  speed?: number
  /**
   * How many times it plays: by default once per trigger, and in the effect's own cadence while active. `continuous`
   * needs iOS 18.
   */
  repeat?: NativeIconEffectRepeat
  /** Seconds between repetitions. */
  repeatDelay?: number
}

/**
 * An SF Symbols effect, played by the platform on iOS and drawn the same way on Android. `bounce`, `pulse`,
 * `variableColor`, `wiggle`, `rotate` and `breathe` play once per `effectTrigger` change, or run while `effectActive`.
 * `scale`, `appear` and `disappear` are states: they hold while `effectActive` and animate back when it turns off.
 * Wiggle, rotate and breathe need iOS 18; on iOS 17 they do nothing, and below 17 no effect plays.
 */
export type NativeIconEffect = EffectTiming &
  (
    | {type: 'bounce'; direction?: 'down' | 'up'; scope?: NativeIconEffectScope}
    | {type: 'pulse'; scope?: NativeIconEffectScope}
    | {
        type: 'variableColor'
        /** `cumulative` lights layers one by one and keeps them on, `iterative` lights one at a time. */
        fill?: 'cumulative' | 'iterative'
        /** Plays back the other way once all layers are lit. */
        reversing?: boolean
        /** What the layers not lit yet do: dimmed (the default) or hidden. */
        inactiveLayers?: 'dim' | 'hide'
      }
    | {type: 'scale'; direction?: 'down' | 'up'; scope?: NativeIconEffectScope}
    | {
        type: 'wiggle'
        direction?: 'backward' | 'clockwise' | 'counterClockwise' | 'down' | 'forward' | 'left' | 'right' | 'up'
        /** A direction of its own in degrees, in place of `direction`. */
        angle?: number
        scope?: NativeIconEffectScope
      }
    | {type: 'rotate'; direction?: 'clockwise' | 'counterClockwise'; scope?: NativeIconEffectScope}
    | {type: 'breathe'; style?: 'plain' | 'pulse'; scope?: NativeIconEffectScope}
    | {type: 'appear'; direction?: 'down' | 'up'; scope?: NativeIconEffectScope}
    | {type: 'disappear'; direction?: 'down' | 'up'; scope?: NativeIconEffectScope}
  )

/**
 * How the icon is coloured. `monochrome` tints every layer with `color`; `hierarchical` draws secondary and tertiary
 * layers (paths with a lower opacity in the SVG) as fainter shades of it; `palette` gives them `secondaryColor` and
 * `tertiaryColor`; `multicolor` keeps the colours the SVG gives its paths and tints the rest.
 */
export type NativeIconRenderingMode = 'hierarchical' | 'monochrome' | 'multicolor' | 'palette'

/**
 * How the icon changes into another when `name` changes. `replace` scales the old one down and the new one up,
 * `replaceUpUp` scales both up, `replaceOffUp` drops the old one at once, `magicReplace` morphs the layers the two
 * icons share (iOS 18; elsewhere a replace), `automatic` lets the platform choose. A change of `variableValue` animates
 * too once a transition is set. Unset, the icon swaps without animating.
 */
export type NativeIconTransition = 'automatic' | 'magicReplace' | 'replace' | 'replaceOffUp' | 'replaceUpUp'

/** A value whose change plays a triggered effect once: compared by value, so a new object every render would replay. */
export type NativeIconEffectTrigger = boolean | number | string

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
  /** The tint, and the primary colour of the other rendering modes. Unset, the platform's primary text colour. */
  color?: ColorValue
  /** The `palette` mode's colour for secondary layers. Unset, `color`. */
  secondaryColor?: ColorValue
  /** The `palette` mode's colour for tertiary layers. Unset, `secondaryColor`. */
  tertiaryColor?: ColorValue
  /** How the layers are coloured. `monochrome` by default. */
  renderingMode?: NativeIconRenderingMode
  /**
   * From 0 to 1: switches on the layers marked `data-variable` whose threshold it passes (a signal meter, a volume
   * level), the rest dimmed. Unset, every layer is on.
   */
  variableValue?: number
  /** Shades each colour into a soft gradient, as SF Symbols does on iOS 26. iOS 26 and Android; ignored below. */
  gradient?: boolean
  /** Animates a change of `name` (and of `variableValue`). */
  transition?: NativeIconTransition
  /** The effect to play: once per change of `effectTrigger`, or for as long as `effectActive`. */
  effect?: NativeIconEffect
  /** Plays `effect` once whenever this value changes, never on mount. */
  effectTrigger?: NativeIconEffectTrigger
  /** Runs `effect` while true; without an `effectTrigger`, true by default. */
  effectActive?: boolean
  /** Which of the app's icons: a key of `NativeIcons`. */
  name: NativeIconName
  /** Width and height in points (dp on Android), before any font scaling. 24 by default. */
  size?: number
  style?: StyleProp<ViewStyle>
  testID?: string
}

/** `NativeIcon` on either platform: `contract.check.ts` holds the iOS and the Android half to it. */
export type NativeIconComponent = (props: NativeIconProps) => ReactNode
