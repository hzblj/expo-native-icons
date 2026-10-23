import {createRunOncePlugin} from 'expo/config-plugins'

import {withNativeIcons} from './withNativeIcons'

export * from './icons'
export type {NativeIconsPluginOptions} from './withNativeIcons'
export {withNativeIcons}

const pkg: {name: string; version: string} = require('../../package.json')

export default createRunOncePlugin(withNativeIcons, pkg.name, pkg.version)
