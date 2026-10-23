/** `arrow-left` → `arrow_left`: Android resource names allow neither `-` nor capitals, so neither platform uses them. */
const snakeCase = (name: string): string => name.replace(/-/g, '_').toLowerCase()

/**
 * An icon's native name, the same on both platforms: the iOS asset and the Android drawable the config plugin writes
 * for `<name>.svg`. Hand it to anything that takes a native image by name: SwiftUI's `Image(assetName)`, a UIKit menu,
 * Compose's `painterResource`.
 */
export const iconResourceName = (name: string): string => `native_icon_${snakeCase(name)}`
