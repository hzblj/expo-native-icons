import {writeFileSync} from 'node:fs'
import path from 'node:path'

import {iconTypes, readIconFolder} from './icons'

const DEFAULT_OUT = 'native-icons.d.ts'

const usage = (command: string) => `Usage: ${command} <source> [--out <file>]

  Checks every SVG in <source> the way prebuild will, and writes the TypeScript declaration that makes
  their names valid for <NativeIcon name="…" />. The config plugin does the same whenever the app config
  is read; this is for CI and for projects that type-check without starting Expo.

  --out   where to write the declaration (default: ${DEFAULT_OUT} in the current directory)`

/**
 * `npx native-icons ./assets/icons`: the half of the icons that runs before prebuild. Validation, so a bad SVG fails
 * here rather than mid-prebuild, and the names, so the app type-checks against the icons it actually ships. `command`
 * names the bin in messages, for a package that exposes this under its own.
 */
export const main = (args: string[], command = 'native-icons'): number => {
  const outIndex = args.indexOf('--out')
  const outValueIndex = outIndex === -1 ? -1 : outIndex + 1
  const out = outIndex === -1 ? DEFAULT_OUT : args[outValueIndex]
  const source = args.find((arg, index) => !arg.startsWith('--') && index !== outValueIndex)

  if (!source || !out || args.includes('--help')) {
    console.log(usage(command))

    return source ? 0 : 1
  }

  try {
    const {android, ios, names} = readIconFolder(path.resolve(source))

    writeFileSync(path.resolve(out), iconTypes(names, source))
    console.log(`${command}: ${names.length} icons (${ios.length} iOS, ${android.length} Android) → ${out}`)

    return 0
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)

    return 1
  }
}
