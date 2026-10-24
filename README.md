# expo-native-icons

[![npm](https://img.shields.io/npm/v/@hzblj/expo-native-icons.svg)](https://www.npmjs.com/package/@hzblj/expo-native-icons)
[![license](https://img.shields.io/npm/l/@hzblj/expo-native-icons.svg)](./LICENSE)

Your own SVG icons as real native assets in Expo. A config plugin turns a folder of SVGs into iOS asset catalog images and Android vector drawables at prebuild and types their names, and a native view draws them tinted at any size. No icon font, no `react-native-svg` at runtime, no JavaScript drawing.

```sh
npx expo install @hzblj/expo-native-icons
```

```ts
// app.config.ts
plugins: [['@hzblj/expo-native-icons', {source: './assets/icons'}]]
```

```tsx
import {NativeIcon} from '@hzblj/expo-native-icons'

<NativeIcon name="bolt" size={20} color="#ff5700" />
```

**[Documentation](./packages/expo-native-icons/README.md)**: the SVG rules, platform variants, typed names, native names, the CLI and platform behavior.

## This repository

| Path | What lives there |
| --- | --- |
| `packages/expo-native-icons/` | `@hzblj/expo-native-icons`, the published package: the config plugin and the CLI, the JavaScript API and the iOS and Android view |
| `apps/example/` | The example app: a searchable gallery of Material Symbols with each icon's native names, tints and sizes, icons beside text, a platform variant, the SVG rules, typed names and the CLI |

```sh
yarn                 # install
yarn prebuild        # build the package, then a clean `expo prebuild` of the example
yarn ios             # run the example on iOS (dev client); `yarn android` for Android
yarn start           # Metro for the example
yarn test            # the config plugin and CLI tests
yarn lint            # Biome and TypeScript
yarn pack:check      # pack the package as npm gets it, run its plugin and type-check a consumer
yarn changeset       # describe a change for the next release
```

## More libraries

The other libraries from the same author are at **[libraries.janblazej.dev](https://www.libraries.janblazej.dev)**.

## License

MIT © Jan Blazej
