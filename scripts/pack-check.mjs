/**
 * Checks what npm would receive, the way a consumer meets it. Packs every published package (each `prepack` builds it
 * through turbo's cache), asserts what must and must not ship in each tarball, then installs it into a throwaway app
 * and type-checks real usage with a consumer's TypeScript: no `source` condition, no workspace links, only what the
 * tarball declares. The config plugin is loaded from the tarball too, the way prebuild loads it, and run over a small
 * icon folder, and so is the CLI.
 *
 * The negative cases matter as much as the positive ones: if a declaration failed to resolve, its imports would
 * quietly become `any` and everything would compile, so each `@ts-expect-error` is there to prove the types are real.
 */
import {execFileSync} from 'node:child_process'
import {existsSync} from 'node:fs'
import {mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises'
import {createRequire} from 'node:module'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const WORK = path.join(ROOT, '.pack-check')

const run = (command, args, cwd = ROOT) => execFileSync(command, args, {cwd, encoding: 'utf8'})

const fail = message => {
  console.error(`pack-check: ${message}`)
  process.exit(1)
}

const REQUIRED = {
  '@hzblj/expo-native-icons': [
    'package.json',
    'README.md',
    'LICENSE',
    'app.plugin.js',
    'bin/native-icons.js',
    'build/index.js',
    'build/index.d.ts',
    'plugin/build/index.js',
    'plugin/build/index.d.ts',
    'plugin/build/cli.js',
    'plugin/build/cli.d.ts',
    'expo-module.config.json',
    'ios/ExpoNativeIcons.podspec',
    'ios/ExpoNativeIconsModule.swift',
    'ios/NativeIconView.swift',
    'android/build.gradle',
    'android/src/main/java/com/hzblj/exponativeicons/ExpoNativeIconsModule.kt',
    'android/src/main/java/com/hzblj/exponativeicons/NativeIconView.kt',
  ],
}

// The tests, the TypeScript sources of both halves and the build output of the native projects stay home.
const FORBIDDEN = [/^src\//, /^plugin\/(src|test)\//, /tsconfig/, /\/build\/intermediates\//, /\.DS_Store$/]

const packages = []

for (const directory of await readdir(path.join(ROOT, 'packages'))) {
  const manifestPath = path.join(ROOT, 'packages', directory, 'package.json')

  if (!existsSync(manifestPath)) {
    continue
  }

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

  if (!manifest.private) {
    packages.push({directory, name: manifest.name})
  }
}

await rm(WORK, {force: true, recursive: true})
await mkdir(path.join(WORK, 'tarballs'), {recursive: true})

let fileCount = 0

for (const {directory, name} of packages) {
  const tarball = path.join(WORK, 'tarballs', `${directory}.tgz`)

  run('yarn', ['pack', '--out', tarball], path.join(ROOT, 'packages', directory))

  const files = run('tar', ['-tzf', tarball])
    .split('\n')
    .filter(Boolean)
    .map(file => file.replace(/^package\//, ''))

  const missing = (REQUIRED[name] ?? ['package.json', 'README.md']).filter(file => !files.includes(file))
  const leaked = files.filter(file => FORBIDDEN.some(pattern => pattern.test(file)))

  if (missing.length > 0) {
    fail(`${name} is missing:\n  ${missing.join('\n  ')}`)
  }

  if (leaked.length > 0) {
    fail(`${name} must not ship:\n  ${leaked.join('\n  ')}`)
  }

  const packed = JSON.parse(run('tar', ['-xzOf', tarball, 'package/package.json']))

  if (JSON.stringify(packed.dependencies ?? {}).includes('workspace:')) {
    fail(`${name} still declares a workspace: range: it would not install outside this repo`)
  }

  const installed = path.join(WORK, 'node_modules', name)

  await mkdir(installed, {recursive: true})
  run('tar', ['-xzf', tarball, '-C', installed, '--strip-components', '1'])
  fileCount += files.length
}

// An app with three icons, one of them a platform variant, and just enough of an iOS project for the plugin to find
// the app's sources (its AppDelegate).
const APP = path.join(WORK, 'app')
const BOLT =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M300-80l40-280H160l360-520h80l-40 320h200L400-80z"/></svg>'

await mkdir(path.join(APP, 'icons'), {recursive: true})
await mkdir(path.join(APP, 'ios', 'Consumer'), {recursive: true})
await writeFile(path.join(APP, 'ios', 'Consumer', 'AppDelegate.swift'), '')

for (const file of ['bolt.svg', 'arrow-left.svg', 'share.ios.svg', 'share.android.svg']) {
  await writeFile(path.join(APP, 'icons', file), BOLT)
}

// The config plugin, as prebuild requires it: `app.plugin.js` from the tarball. Evaluating it writes the declaration;
// its mods write the native assets.
const requireFromWork = createRequire(path.join(WORK, 'package.json'))
const plugin = requireFromWork('@hzblj/expo-native-icons/app.plugin.js')
const withNativeIcons = plugin.default ?? plugin

if (typeof withNativeIcons !== 'function') {
  fail('app.plugin.js does not export a config plugin')
}

if (typeof requireFromWork('@hzblj/expo-native-icons/plugin').withNativeIcons !== 'function') {
  fail('@hzblj/expo-native-icons/plugin does not export withNativeIcons')
}

const config = withNativeIcons({_internal: {projectRoot: APP}, name: 'Consumer', slug: 'consumer'}, {source: './icons'})

for (const platform of ['ios', 'android']) {
  await config.mods[platform].dangerous({
    ...config,
    modRequest: {
      introspect: false,
      modName: 'dangerous',
      platform,
      platformProjectRoot: path.join(APP, platform),
      projectRoot: APP,
    },
  })
}

const WRITTEN = [
  'native-icons.d.ts',
  'ios/Consumer/Images.xcassets/native_icon_arrow_left.imageset/Contents.json',
  'ios/Consumer/Images.xcassets/native_icon_bolt.imageset/native_icon_bolt.svg',
  'ios/Consumer/Images.xcassets/native_icon_share.imageset/Contents.json',
  'android/app/src/main/res/drawable/native_icon_arrow_left.xml',
  'android/app/src/main/res/drawable/native_icon_bolt.xml',
  'android/app/src/main/res/drawable/native_icon_share.xml',
]

const absent = WRITTEN.filter(file => !existsSync(path.join(APP, file)))

if (absent.length > 0) {
  fail(`the plugin did not write:\n  ${absent.join('\n  ')}`)
}

// The CLI, as `npx native-icons` runs it: the bin from the tarball, the same declaration without Expo.
try {
  run(
    'node',
    [path.join(WORK, 'node_modules/@hzblj/expo-native-icons/bin/native-icons.js'), './icons', '--out', 'cli.d.ts'],
    APP
  )
} catch (error) {
  fail(`the CLI failed:\n${error.stdout}${error.stderr}`)
}

if (
  (await readFile(path.join(APP, 'cli.d.ts'), 'utf8')) !== (await readFile(path.join(APP, 'native-icons.d.ts'), 'utf8'))
) {
  fail('the CLI and the plugin declare different names')
}

const consumer = `import {main} from '@hzblj/expo-native-icons/cli'
import {iconResourceName, NativeIcon, type NativeIconName, NativeIconView} from '@hzblj/expo-native-icons'
import {
  androidVectorDrawable,
  iconTypes,
  type NativeIconsPluginOptions,
  readIconFolder,
  withNativeIcons,
} from '@hzblj/expo-native-icons/plugin'

declare global {
  interface NativeIcons {
    'arrow-left': true
    bolt: true
  }
}

export const back: NativeIconName = 'arrow-left'
export const resource: string = iconResourceName(back)

export const Icons = () => (
  <>
    <NativeIcon name="bolt" />
    <NativeIcon
      accessibilityHint="Goes back"
      accessibilityLabel="Back"
      allowFontScaling
      color="#ff5700"
      maxFontSizeMultiplier={1.5}
      name="arrow-left"
      size={20}
    />
    <NativeIconView iconColor="#ff5700" resourceName={resource} />
  </>
)

export const options: NativeIconsPluginOptions = {iosSize: 28, source: './assets/icons', types: false}
export const plugin = withNativeIcons
export const check = (): number => main(['./assets/icons', '--out', 'icons.d.ts'], 'my-icons')

export const generate = (folder: string): string[] => {
  const {android, names} = readIconFolder(folder)

  return [iconTypes(names, folder), ...android.map(icon => androidVectorDrawable(icon, 24))]
}

// @ts-expect-error: not one of the declared icons
export const Missing = () => <NativeIcon name="lightning" />

// @ts-expect-error: the size is a number
export const Sized = () => <NativeIcon name="bolt" size="large" />

// @ts-expect-error: source is required
export const noSource: NativeIconsPluginOptions = {types: false}
`

await writeFile(path.join(WORK, 'consumer.tsx'), consumer)
await writeFile(
  path.join(WORK, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {noEmit: true, skipLibCheck: true, strict: true},
      extends: 'expo/tsconfig.base',
      include: ['consumer.tsx'],
    },
    null,
    2
  )
)

try {
  run('yarn', ['run', '-T', 'tsc', '-p', WORK])
} catch (error) {
  fail(`a consumer's type check failed:\n${error.stdout}`)
}

await rm(WORK, {force: true, recursive: true})

console.log(
  `pack-check: ${packages.length} package, ${fileCount} files, the plugin and the CLI run, and a consumer type-checks`
)
