import {existsSync, readFileSync, writeFileSync} from 'node:fs'
import {mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {type ConfigPlugin, IOSConfig, withDangerousMod} from 'expo/config-plugins'

import {androidVectorDrawable, iconResourceName, iconTypes, iosImageset, readIconFolder} from './icons'
import {iconSymbolName, iosSymbolset} from './symbols'

export type NativeIconsPluginOptions = {
  /**
   * A folder of SVGs, one glyph per file, relative to the project root. The file name is the icon name
   * (`bolt.svg` → `<NativeIcon name="bolt" />`); `share.android.svg` replaces `share.svg` on Android. Only
   * single-colour `<path>`s are accepted: the platform tints every icon.
   */
  source: string
  /**
   * Where the declaration of the icon names goes, relative to the project root, or `false` to skip it. Rewritten
   * whenever the app config is read, so `expo start` alone keeps it current. `native-icons.d.ts` by default.
   */
  types?: string | false
  /**
   * The point size iOS system controls (bar items, menus, swipe actions) draw an icon at when nothing resizes it.
   * `NativeIcon` sizes the icon itself. 24 by default.
   */
  iosSize?: number
}

/** Stamped into every image set this writes, so a later run can tell ours from one added by hand. */
const AUTHOR = '@hzblj/expo-native-icons'

const IMAGESET_SUFFIX = '.imageset'

const SYMBOLSET_SUFFIX = '.symbolset'

const RESOURCE_PREFIX = iconResourceName('')

const SYMBOL_PREFIX = iconSymbolName('')

const DEFAULT_IOS_SIZE = 24

const DEFAULT_TYPES = 'native-icons.d.ts'

/**
 * Removes what an earlier run wrote for icons no longer in the folder: a deleted SVG must stop existing natively. Only
 * sets with this plugin's prefix and its stamp go, so an image or symbol the app added by hand stays.
 */
const removeStaleSets = async (catalog: string, suffix: string, prefix: string, keep: Set<string>): Promise<void> => {
  const dirents = await readdir(catalog, {withFileTypes: true}).catch(() => [])

  for (const dirent of dirents) {
    const name = dirent.name.slice(0, -suffix.length)

    if (!dirent.isDirectory() || !dirent.name.endsWith(suffix) || keep.has(name)) {
      continue
    }

    const setPath = path.join(catalog, dirent.name)
    const contents = await readFile(path.join(setPath, 'Contents.json'), 'utf8').catch(() => '')

    if (name.startsWith(prefix) && contents.includes(`"author": "${AUTHOR}"`)) {
      await rm(setPath, {force: true, recursive: true})
    }
  }
}

const withIosIcons: ConfigPlugin<NativeIconsPluginOptions> = (config, {iosSize = DEFAULT_IOS_SIZE, source}) =>
  withDangerousMod(config, [
    'ios',
    async config => {
      const {projectRoot} = config.modRequest
      const {ios} = readIconFolder(path.resolve(projectRoot, source))
      const catalog = path.join(IOSConfig.Paths.getSourceRoot(projectRoot), 'Images.xcassets')
      const images = new Set<string>()
      const symbols = new Set<string>()

      for (const icon of ios) {
        const assetName = iconResourceName(icon.name)
        const symbolName = iconSymbolName(icon.name)
        const imageset = iosImageset(icon, assetName, iosSize, AUTHOR)
        const symbolset = iosSymbolset(icon, AUTHOR)
        const imagePath = path.join(catalog, `${assetName}${IMAGESET_SUFFIX}`)
        const symbolPath = path.join(catalog, `${symbolName}${SYMBOLSET_SUFFIX}`)

        images.add(assetName)
        symbols.add(symbolName)
        await mkdir(imagePath, {recursive: true})
        await mkdir(symbolPath, {recursive: true})
        await writeFile(path.join(imagePath, 'Contents.json'), imageset.contents, 'utf8')
        await writeFile(path.join(imagePath, `${assetName}.svg`), imageset.svg, 'utf8')
        await writeFile(path.join(symbolPath, 'Contents.json'), symbolset.contents, 'utf8')
        await writeFile(path.join(symbolPath, `${symbolName}.svg`), symbolset.svg, 'utf8')
      }

      await removeStaleSets(catalog, IMAGESET_SUFFIX, RESOURCE_PREFIX, images)
      await removeStaleSets(catalog, SYMBOLSET_SUFFIX, SYMBOL_PREFIX, symbols)

      return config
    },
  ])

const withAndroidIcons: ConfigPlugin<NativeIconsPluginOptions> = (config, {source}) =>
  withDangerousMod(config, [
    'android',
    async config => {
      const {platformProjectRoot, projectRoot} = config.modRequest
      const {android} = readIconFolder(path.resolve(projectRoot, source))
      const drawables = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'drawable')
      const written = new Set(android.map(icon => `${iconResourceName(icon.name)}.xml`))

      await mkdir(drawables, {recursive: true})

      for (const icon of android) {
        await writeFile(path.join(drawables, `${iconResourceName(icon.name)}.xml`), androidVectorDrawable(icon), 'utf8')
      }

      // The `native_icon_` prefix is this plugin's alone, so any such drawable not written now was written before.
      for (const file of await readdir(drawables)) {
        if (file.startsWith(RESOURCE_PREFIX) && file.endsWith('.xml') && !written.has(file)) {
          await rm(path.join(drawables, file), {force: true})
        }
      }

      return config
    },
  ])

/**
 * Keeps the declaration of icon names in step with the folder. Done while the config is evaluated rather than in a mod
 * on purpose: mods run only at prebuild, while `expo start` reads the config too, so adding an SVG and starting Metro
 * is all it takes for its name to type-check. Written only when the content changed.
 */
const writeTypes = (projectRoot: string, {source, types = DEFAULT_TYPES}: NativeIconsPluginOptions): void => {
  if (types === false) {
    return
  }

  const {names} = readIconFolder(path.resolve(projectRoot, source))
  const file = path.resolve(projectRoot, types)
  const contents = iconTypes(names, source)

  if (!existsSync(file) || readFileSync(file, 'utf8') !== contents) {
    writeFileSync(file, contents)
  }
}

/**
 * The app's icons as native assets on both platforms, generated from SVGs at prebuild: a template image set and a
 * custom SF Symbol per icon in the iOS asset catalog (vector data kept), a vector drawable per icon in Android's
 * `res/drawable`. System controls draw the image, which keeps its point size; `NativeIcon` draws the symbol, which
 * brings effects, transitions and rendering modes. They have to live
 * in the app's own catalog and resources: `Image("…")` and `UIImage(named:)` look in the main bundle, and an asset
 * catalog shipped by a pod collides with the app's `Assets.car`. A new or changed SVG needs a prebuild.
 */
export const withNativeIcons: ConfigPlugin<NativeIconsPluginOptions> = (config, options) => {
  if (!options?.source) {
    throw new Error(
      "[native-icons] Set `source`, the folder of SVGs: ['@hzblj/expo-native-icons', {source: './assets/icons'}]"
    )
  }

  writeTypes(config._internal?.projectRoot ?? process.cwd(), options)

  return withAndroidIcons(withIosIcons(config, options), options)
}
