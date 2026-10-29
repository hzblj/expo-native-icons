# expo-native-icons

Turborepo + Yarn 4 workspaces for **`@hzblj/expo-native-icons`**: the app's own SVG icons as native assets for Expo, a
config plugin and a CLI that write an iOS image set and an Android vector drawable per SVG and type their names, and a
native view that draws them tinted. React Native and Expo only, no web.

Every package has its own `CLAUDE.md`: read that one before touching it.

| Path | Package | What lives there |
| --- | --- | --- |
| `packages/expo-native-icons/` | `@hzblj/expo-native-icons` | The config plugin and the CLI (`plugin/`, `bin/`), the JavaScript API (`src/`), the `ExpoNativeIcons` view (`ios/`, `android/`) and the plugin's tests. |
| `apps/example/` | `expo-native-icons-example` (private) | Expo Router app built with `@hzblj/kara-ui`: a searchable gallery of Material Symbols (outlined and filled) with each icon's native names, tint and size, icons beside text and for screen readers, an Effects tab (every effect, transition, rendering mode and variable value on the layered `signal-bars`, `volume`, `weather` and `bell-badge`), a platform variant, the SVG rules, typed names and the CLI. Runs the package's `src/` from **source**, its plugin from `plugin/build`. |
| `scripts/` | | `pack-check.mjs`: the tarball as npm gets it, its plugin and CLI run from it, a consumer type-checked against it. |
| `.changeset/`, `.github/workflows/` | | Release notes (`yarn changeset`), CI (Biome, typecheck, tests, pack check, the Android module compiled) and the changesets → npm release. |

`@hzblj/kara-ui` depends on this package (kara's config plugin hands its `icons` option to `withNativeIcons`, and its
`Icon`, `RnIcon` and `Tabs` draw through `iconResourceName`, `NativeIcon` and `NativeIconName`). In the example, Yarn
links kara's range to the workspace (transparent workspaces), so there is one copy of the module, the one being edited
(`find node_modules -path '*@hzblj/expo-native-icons'` lists one). A version bump here that leaves kara's range
(`^0.1.0`) puts a second, published copy under kara: bump kara after releasing, or kara's icons and tab bar draw
through the old one.

## Commands

```bash
yarn ios / yarn android      # run the example (dev client)
yarn prebuild                # build the package, then a clean `expo prebuild` of the example
yarn test                    # the generator, the plugin and the CLI (node:test)
yarn typecheck / yarn lint   # tsc, Biome
yarn pack:check              # what npm receives, its plugin and CLI run, and a consumer type-check
yarn changeset               # describe a change for the next release
```

## Conventions that bite

**The example runs the package's source; the world runs `build/`.** The package's `exports` names a `source` entry,
which the example's `metro.config.js` maps and its `tsconfig.json` mirrors with `paths`, so nothing waits for a build.
Not a global `source` condition: published packages ship one too, and kara-ui's points at platform-split sources. The
config plugin is the exception: Expo loads `app.plugin.js` → `plugin/build` whenever it reads the app config
(`expo start` too), which is why `yarn prebuild` builds the package first. After an edit under `plugin/src`, run
`yarn build`.

**The example configures this package's own plugin**, `['@hzblj/expo-native-icons', {source: './assets/icons'}]`,
not kara's `icons` option: it shows the package the way an app without kara uses it. kara draws the same generated
assets by name. A new or changed SVG in `apps/example/assets/icons` needs `yarn prebuild` and a native build; its type
in `native-icons.d.ts` (committed) is rewritten by any `expo start`.

**Publish through Yarn, tag through changesets.** `yarn release` runs `yarn npm publish` in every public workspace and
then `changeset tag`. Never `changeset publish`: its npm call would ship `workspace:` ranges verbatim.

**Docs copy has no em dashes.** Not in the READMEs, the JSDoc in `src/` and `plugin/src/` (it is the API reference),
changesets or the example's captions. Rewrite with a comma, a colon, parentheses or a second sentence. Code comments
are exempt.

**Commits are Jan's alone.** Author `Jan Blazej <hello@janblazej.dev>` (set locally in this repo), no co-author or
generated-by lines.

Code style is Biome-enforced (`@hzblj/biome-config`): 2 spaces, 120 cols, single quotes, no semicolons, sorted imports
and object keys. Named exports and `const` arrow functions; `type` over `interface`.
