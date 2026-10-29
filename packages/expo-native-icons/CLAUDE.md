# @hzblj/expo-native-icons

The app's SVG icons as native assets: a config plugin (Node, `plugin/` → `plugin/build/`, CommonJS) that writes an iOS
image set, a custom SF Symbol and an Android vector drawable per SVG, the `native-icons` CLI, and `NativeIcon`, an Expo module view that
draws one (`src/` → `build/`, `ios/`, `android/`). Built for `@hzblj/kara-ui` (`../kara-ui`), which composes it: its
plugin hands `icons` over to `withNativeIcons`, its `Icon` atoms use `iconResourceName` and `NativeIconName`, and its
React Native tier icon is `NativeIcon`. Nothing here may know about kara.

| Path | What it is |
| --- | --- |
| `plugin/src/icons.ts` | The generator: `readIconFolder` (platform variants `x.ios.svg` / `x.android.svg`), `parseSvgIcon` (only `<path>`, fails on anything else; each path's layer attributes: `fill` colour, `opacity` level, `data-variable`, `data-motion-group`), `iconLayers` (settles even variable thresholds), `iosImageset` (template SVG, vector kept), `androidVectorDrawable` (moves a non-zero viewBox origin into a group; a layer's level, threshold and group go into its path's `android:name`, its colour into `android:fillColor`), `iconTypes`, `iconResourceName`. |
| `plugin/src/symbols.ts` | `iosSymbolset`: an SF Symbols 7 template (Ultralight, Regular and Black small sources, all one glyph) with an invisible first layer over the square box, so the symbol is as big as the image; `nonZeroPath` reverses an even-odd path's holes, since symbols fill non-zero only (`actool` ignores `fill-rule` in every form); `iconSymbolName`. Checked against `actool` and rendered on macOS when it was written: every Footshop and example icon matched its image to a pixel. |
| `plugin/src/withNativeIcons.ts` | Image sets into the app's `Images.xcassets` and drawables into `res/drawable` at prebuild, stale ones removed; `native-icons.d.ts` rewritten whenever the config is read. |
| `plugin/src/cli.ts`, `bin/native-icons.js` | `native-icons <source> [--out]`: the same validation and declaration without Expo. `main(args, command)` takes the bin name, so a package can expose it under its own (`./cli` in `exports`). |
| `src/NativeIcon.{ios,android}.tsx`, `src/NativeIconView.{ios,android}.ts` | Platform-split: the iOS view takes `symbolName` too. Shared props in `types.ts` / `NativeIconView.types.ts`, both halves held to one type by `contract.check.ts`, the common native props in `useNativeIconViewProps`. The build writes a plain declaration per split module (`scripts/fallback-declarations.mjs`). |
| `ios/NativeIconView.swift`, `ios/NativeIconEffect.swift` | A `UIImageView` over the symbol at point size = the view's shorter side, `.small` scale, `.center` (the box fills the view); effects through `addSymbolEffect` (discrete or indefinite overload picked by generic helpers: bounce is both on iOS 18), transitions through `setSymbolImage(_:contentTransition:)`, modes through the symbol configuration. No symbol in the catalog (older prebuild): the template image, scaled to fit. Props applied together in `OnViewDidUpdateProps`. |
| `android/.../NativeIconView.kt`, `IconLayers.kt`, `IconEffects.kt` | One view drawing the drawable's paths, read back once per resource with `obtainAttributes` + `PathParser` (a drawable with strokes, clip paths or anything else is drawn whole). Effects, the replace transition, variable value easing and state effects run on `postInvalidateOnAnimation` while moving; the curves in `IconEffects` were matched to UIKit's on the simulator (bounce: 4 % dip, 122 % swell, 7 % undershoot, 0.9 s). |
| `plugin/test/` | `node:test` over the generator, the plugin's name against the runtime's, and the CLI (`yarn test`). |

**`iconResourceName` and `iconSymbolName` exist twice**: `plugin/src` for Node and `src/iconResourceName.ts` for the
app, because neither build can import the other. `plugin/test` asserts they agree; change both or neither.

**The plugin runs from `plugin/build`.** `app.plugin.js` requires the compiled plugin, and so does the CLI's bin, so an
edit under `plugin/src` reaches the example only after `yarn build` (the example's `yarn prebuild` runs it first). The
app half (`src/`) is the opposite: the example runs it from source.

**Icon types are written while the config is evaluated, not in a mod.** Mods run only at prebuild; `expo start` reads
the config too, so writing the declaration from the plugin's body keeps names current the moment an SVG is added. It
writes only when the content changed.

**It cleans up after itself, carefully.** iOS image and symbol sets carry `"author": "@hzblj/expo-native-icons"` and
only stamped sets with the `native_icon_` / `native_symbol_` prefix are ever removed. Android drawables have no stamp, so the prefix alone decides:
never write a drawable with it from anywhere else.

**A view only, no module functions.** `requireNativeView('ExpoNativeIcons', 'NativeIconView')`; the view name is the
class name on both platforms.

**Tests.** `yarn test` (node:test over `plugin/test`). The native views have no unit tests: the example on the
simulator and the emulator is the check, and `yarn pack:check` runs the plugin and the CLI from the tarball.

Code style follows `@hzblj/biome-config` (`yarn lint`). Docs copy (README, JSDoc, changesets) has no em dashes.
