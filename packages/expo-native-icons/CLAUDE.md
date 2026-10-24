# @hzblj/expo-native-icons

The app's SVG icons as native assets: a config plugin (Node, `plugin/` → `plugin/build/`, CommonJS) that writes an iOS
image set and an Android vector drawable per SVG, the `native-icons` CLI, and `NativeIcon`, an Expo module view that
draws one (`src/` → `build/`, `ios/`, `android/`). Built for `@hzblj/kara-ui` (`../kara-ui`), which composes it: its
plugin hands `icons` over to `withNativeIcons`, its `Icon` atoms use `iconResourceName` and `NativeIconName`, and its
React Native tier icon is `NativeIcon`. Nothing here may know about kara.

| Path | What it is |
| --- | --- |
| `plugin/src/icons.ts` | The generator: `readIconFolder` (platform variants `x.ios.svg` / `x.android.svg`), `parseSvgIcon` (only `<path>`, fails on anything else), `iosImageset` (template SVG, vector kept), `androidVectorDrawable` (moves a non-zero viewBox origin into a group), `iconTypes`, `iconResourceName`. |
| `plugin/src/withNativeIcons.ts` | Image sets into the app's `Images.xcassets` and drawables into `res/drawable` at prebuild, stale ones removed; `native-icons.d.ts` rewritten whenever the config is read. |
| `plugin/src/cli.ts`, `bin/native-icons.js` | `native-icons <source> [--out]`: the same validation and declaration without Expo. `main(args, command)` takes the bin name, so a package can expose it under its own (`./cli` in `exports`). |
| `src/NativeIcon.tsx`, `ios/NativeIconView.swift`, `android/.../NativeIconView.kt` | A `UIImageView` / one Android view drawing the drawable, over the asset by native name, scaled to fit, tinted (unset: `UIColor.label` / `textColorPrimary`). |
| `plugin/test/` | `node:test` over the generator, the plugin's name against the runtime's, and the CLI (`yarn test`). |

**`iconResourceName` exists twice**: `plugin/src/icons.ts` for Node and `src/iconResourceName.ts` for the app, because
neither build can import the other. `plugin/test` asserts they agree; change both or neither.

**The plugin runs from `plugin/build`.** `app.plugin.js` requires the compiled plugin, and so does the CLI's bin, so an
edit under `plugin/src` reaches the example only after `yarn build` (the example's `yarn prebuild` runs it first). The
app half (`src/`) is the opposite: the example runs it from source.

**Icon types are written while the config is evaluated, not in a mod.** Mods run only at prebuild; `expo start` reads
the config too, so writing the declaration from the plugin's body keeps names current the moment an SVG is added. It
writes only when the content changed.

**It cleans up after itself, carefully.** iOS image sets carry `"author": "@hzblj/expo-native-icons"` and only stamped
sets with the `native_icon_` prefix are ever removed. Android drawables have no stamp, so the prefix alone decides:
never write a drawable with it from anywhere else.

**A view only, no module functions.** `requireNativeView('ExpoNativeIcons', 'NativeIconView')`; the view name is the
class name on both platforms.

**Tests.** `yarn test` (node:test over `plugin/test`). The native views have no unit tests: the example on the
simulator and the emulator is the check, and `yarn pack:check` runs the plugin and the CLI from the tarball.

Code style follows `@hzblj/biome-config` (`yarn lint`). Docs copy (README, JSDoc, changesets) has no em dashes.
