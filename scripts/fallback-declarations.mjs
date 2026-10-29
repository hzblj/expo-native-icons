/**
 * Gives every platform-split declaration a plain one. The build emits declarations from the iOS resolution, so a split
 * module arrives as `NativeIcon.ios.d.ts` (and its Android sibling), and a consumer's TypeScript, which has no
 * `moduleSuffixes`, resolves `./NativeIcon` to nothing. A `NativeIcon.d.ts` that re-exports the iOS half fixes that,
 * and is sound because `contract.check.ts` holds both halves to one type. Ported from kara-ui.
 *
 * Fails the build when a `.ios` source has no `.android` sibling (or the reverse): the fallback would then describe a
 * module one platform cannot load.
 */
import {readdir, stat, writeFile} from 'node:fs/promises'
import path from 'node:path'

/** Run from the package's directory: its `build` script calls this after `tsc -p tsconfig.build.json`. */
const PACKAGE_ROOT = process.cwd()
const SOURCE = path.join(PACKAGE_ROOT, 'src')
const DECLARATIONS = path.join(PACKAGE_ROOT, 'build')
const SPLIT = /\.(ios|android)\.tsx?$/

const walk = async dir => {
  const entries = await readdir(dir, {withFileTypes: true})
  const nested = await Promise.all(
    entries.map(entry => (entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))
  )

  return nested.flat()
}

const exists = file =>
  stat(file).then(
    () => true,
    () => false
  )

const sources = await walk(SOURCE)
const sourceSet = new Set(sources)
const unpaired = sources.filter(file => {
  const match = file.match(SPLIT)

  if (!match) {
    return false
  }

  const other = match[1] === 'ios' ? 'android' : 'ios'
  const stem = file.slice(0, -match[0].length)

  return !['ts', 'tsx'].some(extension => sourceSet.has(`${stem}.${other}.${extension}`))
})

if (unpaired.length > 0) {
  console.error(`Split modules without their other half:\n${unpaired.map(file => `  ${file}`).join('\n')}`)
  process.exit(1)
}

const iosDeclarations = (await walk(DECLARATIONS)).filter(file => file.endsWith('.ios.d.ts'))
let written = 0

for (const declaration of iosDeclarations) {
  const fallback = declaration.replace(/\.ios\.d\.ts$/, '.d.ts')

  if (await exists(fallback)) {
    continue
  }

  const base = path.basename(declaration, '.d.ts')

  await writeFile(fallback, `export * from './${base}';\n`)
  written++
}

console.log(`fallback-declarations: ${written} written for ${iosDeclarations.length} split modules`)
