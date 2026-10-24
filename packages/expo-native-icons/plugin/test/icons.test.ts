import assert from 'node:assert/strict'
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {after, test} from 'node:test'

import {iconResourceName as runtimeResourceName} from '../../src/iconResourceName'
import {main} from '../src/cli'
import {
  androidVectorDrawable,
  iconResourceName,
  iconTypes,
  iosImageset,
  parseSvgIcon,
  readIconFolder,
} from '../src/icons'

const BOLT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>'

const folders: string[] = []

after(async () => {
  await Promise.all(folders.map(folder => rm(folder, {force: true, recursive: true})))
})

const iconFolder = async (files: Record<string, string>): Promise<string> => {
  const folder = await mkdtemp(path.join(os.tmpdir(), 'native-icons-'))
  folders.push(folder)
  await Promise.all(Object.entries(files).map(([name, svg]) => writeFile(path.join(folder, name), svg)))
  return folder
}

test('the plugin and the runtime name an icon the same way', () => {
  for (const name of ['bolt', 'arrow-left', 'arrow_left', 'chevron-up-2']) {
    assert.equal(iconResourceName(name), runtimeResourceName(name))
  }
  assert.equal(iconResourceName('arrow-left'), 'native_icon_arrow_left')
})

test('reads paths, the viewBox and even-odd fills', async () => {
  const folder = await iconFolder({
    'ring.svg':
      '<svg viewBox="0 -960 960 960"><title>Ring</title><path fill-rule="evenodd" d="M0 0h960v960H0z"/><path d="M1 1"/></svg>',
  })
  const icon = parseSvgIcon(path.join(folder, 'ring.svg'))

  assert.deepEqual(icon, {
    height: 960,
    minX: 0,
    minY: -960,
    name: 'ring',
    paths: [
      {d: 'M0 0h960v960H0z', evenOdd: true},
      {d: 'M1 1', evenOdd: false},
    ],
    width: 960,
  })
})

test('refuses anything but paths', async () => {
  const folder = await iconFolder({
    'masked.svg': '<svg viewBox="0 0 24 24"><mask id="m"><path d="M0 0"/></mask><path d="M0 0"/></svg>',
  })

  assert.throws(() => parseSvgIcon(path.join(folder, 'masked.svg')), /found <mask>/)
})

test('refuses a file name that is not an icon name', async () => {
  const folder = await iconFolder({'Bolt Icon.svg': BOLT})

  assert.throws(() => readIconFolder(folder), /lower kebab or snake case/)
})

test('a platform variant replaces the shared file on its platform only', async () => {
  const folder = await iconFolder({
    'bolt.svg': BOLT,
    'share.android.svg': BOLT.replace('M13', 'M14'),
    'share.svg': BOLT,
    'wifi.ios.svg': BOLT,
  })
  const {android, ios, names} = readIconFolder(folder)

  assert.deepEqual(names, ['bolt', 'share', 'wifi'])
  assert.deepEqual(
    ios.map(icon => icon.name),
    ['bolt', 'share', 'wifi']
  )
  assert.deepEqual(
    android.map(icon => icon.name),
    ['bolt', 'share']
  )
  assert.match(android[1]?.paths[0]?.d ?? '', /^M14/)
  assert.match(ios[1]?.paths[0]?.d ?? '', /^M13/)
})

test('refuses two names that land on one resource', async () => {
  const folder = await iconFolder({'arrow_left.svg': BOLT, 'arrow-left.svg': BOLT})

  assert.throws(() => readIconFolder(folder), /would both become the resource "arrow_left"/)
})

test('a vector drawable moves an offset viewBox into a group', async () => {
  const folder = await iconFolder({'home.svg': BOLT.replace('0 0 24 24', '0 -960 960 960')})
  const drawable = androidVectorDrawable(parseSvgIcon(path.join(folder, 'home.svg')))

  assert.match(drawable, /android:viewportWidth="960"/)
  assert.match(drawable, /<group android:translateX="0" android:translateY="960">/)
  assert.match(drawable, /android:fillColor="@android:color\/white"/)
})

test('a vector drawable keeps a wide glyph wide', async () => {
  const folder = await iconFolder({'wide.svg': BOLT.replace('0 0 24 24', '0 0 32 16')})
  const drawable = androidVectorDrawable(parseSvgIcon(path.join(folder, 'wide.svg')))

  assert.match(drawable, /android:width="24dp"\n {4}android:height="12dp"/)
  assert.match(drawable, /android:viewportWidth="32"\n {4}android:viewportHeight="16"/)
})

test('an image set is a template that keeps its vector data', async () => {
  const folder = await iconFolder({'bolt.svg': BOLT})
  const {contents, svg} = iosImageset(parseSvgIcon(path.join(folder, 'bolt.svg')), 'native_icon_bolt', 24, 'test')
  const json = JSON.parse(contents)

  assert.deepEqual(json.properties, {'preserves-vector-representation': true, 'template-rendering-intent': 'template'})
  assert.equal(json.info.author, 'test')
  assert.match(svg, /width="24" height="24" viewBox="0 0 24 24"/)
})

test('declares every name on the global NativeIcons', () => {
  const types = iconTypes(['arrow-left', 'bolt'], './assets/icons')

  assert.match(types, /interface NativeIcons \{\n {4}'arrow-left': true\n {4}bolt: true\n {2}\}/)
})

test('the CLI writes the declaration and fails on a bad folder', async () => {
  const folder = await iconFolder({'bolt.svg': BOLT})
  const out = path.join(folder, 'icons.d.ts')
  const log = console.log
  const error = console.error

  console.log = () => undefined
  console.error = () => undefined

  try {
    assert.equal(main([folder, '--out', out]), 0)
    assert.match(await readFile(out, 'utf8'), /bolt: true/)
    assert.equal(main([path.join(folder, 'missing')]), 1)
    assert.equal(main([]), 1)
  } finally {
    console.log = log
    console.error = error
  }
})
