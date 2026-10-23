# @hzblj/expo-native-icons

[![npm](https://img.shields.io/npm/v/@hzblj/expo-native-icons.svg)](https://www.npmjs.com/package/@hzblj/expo-native-icons)
[![license](https://img.shields.io/npm/l/@hzblj/expo-native-icons.svg)](https://github.com/hzblj/expo-native-icons/blob/main/LICENSE)

Your own SVG icons as real native assets in Expo. A config plugin turns a folder of SVGs into iOS asset catalog images and Android vector drawables at prebuild, types their names, and a native view draws them tinted at any size.

- iOS: a template image set per icon, vector data kept, so it scales crisply and takes the tint
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
- The colour in the file is ignored: every icon is a template the platform tints.
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

### Performance

`NativeIcon` is a `UIImageView` on iOS and a single view drawing the vector drawable on Android, with no SwiftUI or Compose host per icon, so a long list of rows stays cheap. Both platforms look the asset up synchronously and cache it themselves (UIKit's named image cache, the drawable cache of `Resources`), and the name lookup is remembered on Android, so an icon is there in the first frame and a recycled row redraws it at once.

There is no image pipeline in between, on purpose: libraries like `expo-image` are built for downloaded and bitmap images (disk caches, decoding, transitions) and load asynchronously. A bundled vector glyph needs none of that, and would only arrive a frame late.

### Native names

Each icon is named `native_icon_<name>` natively, with `-` turned into `_`: the image set on iOS and the drawable on Android. `iconResourceName(name)` returns it, for anything that takes a native image by name, such as SwiftUI's `Image(assetName)` in `@expo/ui`, a UIKit menu or Compose's `painterResource`.

```ts
import {iconResourceName} from '@hzblj/expo-native-icons'

iconResourceName('arrow-left') // 'native_icon_arrow_left'
```

### Typed names

The plugin writes `native-icons.d.ts` whenever the app config is read, so `expo start` alone keeps it current. It declares a global `NativeIcons` interface with one key per icon, and `NativeIconName` (the type of `name`) becomes those keys. Until the file exists, any string is accepted. Commit the file, or generate it in CI:

```sh
npx native-icons ./assets/icons
```

The CLI checks every SVG the way prebuild will and writes the declaration (`--out <file>` to choose where). It needs no Expo project.

The plugin's helpers (`readIconFolder`, `parseSvgIcon`, `iosImageset`, `androidVectorDrawable`, `iconTypes`) and `withNativeIcons` are exported from `@hzblj/expo-native-icons/plugin`, for a config plugin of your own that builds on them.

## Platform behavior

- iOS image sets go into the app's own `Images.xcassets`: `UIImage(named:)` and SwiftUI's `Image` look in the main bundle, and an asset catalog shipped by a pod would collide with the app's `Assets.car`.
- Every image set the plugin writes is stamped with its author, and a run removes stamped sets whose SVG is gone. An image set you added by hand is never touched.
- On Android the `native_icon_` prefix belongs to the plugin: a drawable with it that the current folder doesn't produce is removed at prebuild.

## License

MIT © Jan Blazej
