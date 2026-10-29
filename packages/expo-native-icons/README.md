# @hzblj/expo-native-icons

[![npm](https://img.shields.io/npm/v/@hzblj/expo-native-icons.svg)](https://www.npmjs.com/package/@hzblj/expo-native-icons)
[![license](https://img.shields.io/npm/l/@hzblj/expo-native-icons.svg)](https://github.com/hzblj/expo-native-icons/blob/main/LICENSE)

Your own SVG icons as real native assets in Expo. A config plugin turns a folder of SVGs into iOS asset catalog images, custom SF Symbols and Android vector drawables at prebuild, types their names, and a native view draws them tinted at any size, with the SF Symbols effects, transitions and rendering modes on both platforms.

<p>
  <img alt="Material Symbols drawn as native icons, in the example on iOS" height="560" src="https://raw.githubusercontent.com/hzblj/expo-native-icons/main/media/ios-gallery.png" />
  <img alt="The same on Android" height="560" src="https://raw.githubusercontent.com/hzblj/expo-native-icons/main/media/android-gallery.png" />
</p>

- iOS: a template image set and a custom SF Symbol per icon, vector data kept, so it scales crisply and takes the tint
- SF Symbols features on your own icons: effects (bounce, pulse, wiggle, rotate, breathe, variable colour, scale, appear, disappear), replace transitions, hierarchical, palette and multicolor rendering, variable values. UIKit plays them on iOS; Android draws the same
- Android: a vector drawable per icon, the same resource `ImageView` and Compose's `painterResource` draw
- A platform variant per icon: `share.android.svg` replaces `share.svg` on Android
- Typed names: `<NativeIcon name="bolt" />` only type-checks for icons in the folder
- No icon font, no `react-native-svg` at runtime, no JavaScript drawing

## Install

```sh
npx expo install @hzblj/expo-native-icons
```

Requires Expo SDK 57 or newer and a [development build](https://docs.expo.dev/develop/development-builds/introduction/). Expo Go doesn't include this native module.

## Configure

Point the plugin at a folder of SVGs in `app.config.ts`. The path is relative to the project root.

```ts
plugins: [['@hzblj/expo-native-icons', {source: './assets/icons'}]]
```

| Option | Default | Meaning |
| --- | --- | --- |
| `source` | Required | Folder of SVGs, one icon per file. The file name is the icon name |
| `types` | `native-icons.d.ts` | Where the declaration of the icon names goes, or `false` to skip it |
| `iosSize` | `24` | Point size iOS system controls (bar items, menus) draw an icon at when nothing resizes it |

Run `npx expo prebuild` and rebuild the native app after adding or changing an SVG. The icons are bundled native resources, so an OTA update can't add or replace them.

### The SVGs

- Name files in lower kebab or snake case, starting with a letter: `arrow-left.svg` becomes `arrow-left`.
- Only `<path>` elements inside one `<svg>` with a numeric `viewBox`, optionally with `fill-rule="evenodd"`. Flatten groups, clips, masks and strokes before exporting. Anything else fails the prebuild with the file name, because a glyph that silently lost a mask is worse than none.
- Every icon is a template the platform tints. Each `<path>` is also a layer, and a few attributes on it only matter to the rendering modes, variable values and effects (see [Layers](#layers)).
- `<name>.ios.svg` and `<name>.android.svg` replace `<name>.svg` on their platform. A name with only one variant exists on that platform alone.
- `arrow-left.svg` and `arrow_left.svg` would land on one native resource, so the two together are refused.

## Usage

```tsx
import {NativeIcon} from '@hzblj/expo-native-icons'

<NativeIcon name="bolt" size={20} color="#ff5700" />
<NativeIcon name="share" accessibilityLabel="Share" />
```

| Prop | Default | Meaning |
| --- | --- | --- |
| `name` | Required | One of the icons in the folder |
| `size` | `24` | Width and height in points (dp on Android) |
| `color` | Primary text colour | The tint: `UIColor.label` on iOS, `textColorPrimary` on Android |
| `accessibilityLabel` | None | What a screen reader says. Without one the icon is decorative and hidden from it |
| `accessibilityHint` | None | Read after the label. Ignored without a label |
| `allowFontScaling` | `false` | Scales the icon with the user's text size (Dynamic Type, Android font scale), for an icon inline with text |
| `maxFontSizeMultiplier` | None | The largest text-size multiplier `allowFontScaling` follows |

A labelled icon is an image element for VoiceOver and TalkBack. An unlabelled one is decorative: hidden from both, so a screen reader reads the text next to it once instead of announcing an unnamed image.

## Effects, transitions and rendering modes

```tsx
const [likes, setLikes] = useState(0)

<NativeIcon name="favorite" effect={{type: 'bounce'}} effectTrigger={likes} />
<NativeIcon name="signal-bars" effect={{type: 'variableColor', fill: 'iterative'}} effectActive={searching} />
<NativeIcon name={liked ? 'favorite-filled' : 'favorite'} transition="replace" />
<NativeIcon name="weather" renderingMode="palette" color="#ff5700" secondaryColor="#34c759" />
<NativeIcon name="volume" variableValue={0.6} transition="automatic" />
```

| Prop | Default | Meaning |
| --- | --- | --- |
| `effect` | None | The effect to play: `{type, ...options}` (below) |
| `effectTrigger` | None | Plays `effect` once whenever this value changes. Never on mount |
| `effectActive` | `true` | Without a trigger, runs `effect` while true and stops it when false |
| `transition` | None | Animates a change of `name`: `replace`, `replaceUpUp`, `replaceOffUp`, `magicReplace`, `automatic`. With one set, a new `variableValue` eases in too |
| `renderingMode` | `monochrome` | `hierarchical`, `palette` or `multicolor` |
| `secondaryColor`, `tertiaryColor` | `color` | The palette mode's colours for secondary and tertiary layers |
| `variableValue` | None | 0 to 1: switches on the layers marked `data-variable` whose threshold it passes, the rest dimmed |
| `gradient` | `false` | Shades each layer's colour into a soft gradient (iOS 26 and Android) |

| Effect | Options | Plays |
| --- | --- | --- |
| `bounce` | `direction: 'up' \| 'down'` | Once per trigger, or on a cadence while active |
| `pulse` | | Fades and returns |
| `variableColor` | `fill: 'cumulative' \| 'iterative'`, `reversing`, `inactiveLayers: 'dim' \| 'hide'` | Lights the variable layers in turn |
| `wiggle` | `direction` (`left`, `right`, `up`, `down`, `forward`, `backward`, `clockwise`, `counterClockwise`) or `angle` | Swings and settles |
| `rotate` | `direction: 'clockwise' \| 'counterClockwise'` | One full turn |
| `breathe` | `style: 'plain' \| 'pulse'` | Swells gently |
| `scale` | `direction: 'up' \| 'down'` | Holds scaled while active |
| `appear`, `disappear` | `direction: 'up' \| 'down'` | Hold shown or gone while active |

Every effect also takes `scope` (`byLayer` moves the motion groups one after another, `wholeSymbol` moves the icon as one), `speed` and `repeat` (a count, or `continuous`) with `repeatDelay`. Wiggle, rotate, breathe and `continuous` need iOS 18. Draw On and Draw Off aren't offered: SF Symbols needs hand-placed guide points for them, which an SVG doesn't have.

iOS plays all of this through UIKit's own symbol machinery on the custom SF Symbol the plugin writes for each icon. Android has no equivalent, so the view reads the vector drawable's paths back as layers and draws the same effects, transitions and modes itself.

### Layers

Each `<path>` of an SVG is one layer, drawn in order. Four attributes describe it; plain icons need none of them.

| On a `<path>` | Means |
| --- | --- |
| `fill="#ffb300"` | Its own colour, kept by the multicolor mode. Black and `currentColor` mean the tint |
| `opacity` / `fill-opacity` | Its level: under 0.75 secondary, under 0.375 tertiary. Hierarchical draws those fainter, palette gives them `secondaryColor` / `tertiaryColor` |
| `data-variable=""` | Switched by `variableValue` and lit by `variableColor`. Empty spreads the layers evenly in drawing order; a number from 0 to 1 is its own threshold |
| `data-motion-group="1"` | Layers with the same number move together when an effect runs by layer. 0 by default |

```xml
<svg viewBox="0 0 24 24">
  <path d="…"/>                                    <!-- the speaker -->
  <path data-variable="" d="…"/>                   <!-- on above 0 -->
  <path data-variable="" d="…"/>                   <!-- on above 1/3 -->
  <path data-variable="" opacity="0.5" d="…"/>     <!-- on above 2/3, secondary -->
</svg>
```

### Performance

`NativeIcon` is a `UIImageView` on iOS and a single view drawing the vector drawable on Android, with no SwiftUI or Compose host per icon, so a long list of rows stays cheap. Both platforms look the asset up synchronously and cache it themselves (UIKit's named image cache, the drawable cache of `Resources`), and the name lookup is remembered on Android, so an icon is there in the first frame and a recycled row redraws it at once.

There is no image pipeline in between, on purpose: libraries like `expo-image` are built for downloaded and bitmap images (disk caches, decoding, transitions) and load asynchronously. A bundled vector glyph needs none of that, and would only arrive a frame late.

### Native names

Each icon is named `native_icon_<name>` natively, with `-` turned into `_`: the image set on iOS and the drawable on Android. `iconResourceName(name)` returns it, for anything that takes a native image by name, such as SwiftUI's `Image(assetName)` in `@expo/ui`, a UIKit menu or Compose's `painterResource`. Its custom SF Symbol on iOS is `native_symbol_<name>`, from `iconSymbolName(name)`, for anything that animates or colours a symbol, such as SwiftUI's `symbolEffect`.

```ts
import {iconResourceName, iconSymbolName} from '@hzblj/expo-native-icons'

iconResourceName('arrow-left') // 'native_icon_arrow_left'
iconSymbolName('arrow-left') // 'native_symbol_arrow_left'
```

### Typed names

The plugin writes `native-icons.d.ts` whenever the app config is read, so `expo start` alone keeps it current. It declares a global `NativeIcons` interface with one key per icon, and `NativeIconName` (the type of `name`) becomes those keys. Until the file exists, any string is accepted. Commit the file, or generate it in CI:

```sh
npx native-icons ./assets/icons
```

The CLI checks every SVG the way prebuild will and writes the declaration (`--out <file>` to choose where). It needs no Expo project.

The plugin's helpers (`readIconFolder`, `parseSvgIcon`, `iconLayers`, `iosImageset`, `iosSymbolset`, `nonZeroPath`, `androidVectorDrawable`, `iconTypes`) and `withNativeIcons` are exported from `@hzblj/expo-native-icons/plugin`, for a config plugin of your own that builds on them.

## Platform behavior

- iOS image sets go into the app's own `Images.xcassets`: `UIImage(named:)` and SwiftUI's `Image` look in the main bundle, and an asset catalog shipped by a pod would collide with the app's `Assets.car`.
- System controls (bar items, menus, swipe actions) draw the image, which keeps its point size; `NativeIcon` draws the symbol. A symbol is laid out in the same square box as the image, so the two are the same size.
- SF Symbols fill by the non-zero rule only, so the plugin redraws an even-odd path's holes against the contours around them. Nested contours come out exactly as in the SVG; where two side-by-side contours overlap, even-odd left the overlap empty and the symbol fills it.
- Every image set and symbol set the plugin writes is stamped with its author, and a run removes stamped sets whose SVG is gone. A set you added by hand is never touched.
- An app prebuilt with an earlier version has no symbols: `NativeIcon` then draws the image, tinted, without effects, until the next prebuild.
- On Android the `native_icon_` prefix belongs to the plugin: a drawable with it that the current folder doesn't produce is removed at prebuild.

## Example

The [example app](https://github.com/hzblj/expo-native-icons/tree/main/apps/example) draws a searchable gallery of Material Symbols, outlined and filled, with each icon's native names and the code that draws it; tints, sizes, icons beside text and for screen readers; every effect, transition, rendering mode and variable value; and a platform variant, the SVG rules, typed names and the CLI. Clone the repository and run it:

```sh
yarn && yarn prebuild && yarn ios
```

## More libraries

The other libraries from the same author are at **[libraries.janblazej.dev](https://www.libraries.janblazej.dev)**.

## License

MIT © Jan Blazej
