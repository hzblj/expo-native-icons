# Icons

The example's icons: one SVG per icon, the file name is the icon name. This package's own config plugin
(`['@hzblj/expo-native-icons', {source: './assets/icons'}]` in `app.config.ts`) turns each into a template image set
in the iOS asset catalog and a vector drawable on Android at prebuild, and writes their names into
`native-icons.d.ts`. kara's tab bar and components draw the same assets by the same names.

- `<name>.svg` and `<name>-filled.svg`: [Material Symbols](https://github.com/google/material-design-icons)
  (Outlined, 400, unfilled and filled), copyright Google LLC, Apache License 2.0. `src/gallery/symbols.ts` lists them
  by category. `search-off.svg`, the gallery's empty search, is one too.
- `share.ios.svg` and `share.android.svg`: one icon, `share`, with a glyph per platform (Material's `ios_share` and
  `share`). Neither platform ever sees the other's.
- `even-odd.svg` and `non-zero.svg`: the same three circles, with and without `fill-rule="evenodd"`, drawn for the
  Platforms tab.
