import type {NativeIconName} from '@hzblj/expo-native-icons'

/** Material Symbols ship each glyph twice: outlined, and filled under `<name>-filled`. */
export type SymbolStyle = 'filled' | 'outlined'

export const STYLES: SymbolStyle[] = ['outlined', 'filled']

export const STYLE_LABELS: Record<SymbolStyle, string> = {filled: 'Filled', outlined: 'Outlined'}

export type GallerySymbol = {
  filled: NativeIconName
  /** Other words someone might search for it by. */
  keywords: string[]
  outlined: NativeIconName
}

export type SymbolCategory = {
  symbols: GallerySymbol[]
  title: string
}

/**
 * Both icons of a glyph by its outlined name. Typed by the names the plugin declared in `native-icons.d.ts`, so a
 * symbol listed here and missing from the folder fails the type check.
 */
const symbol = (outlined: NativeIconName, filled: NativeIconName, keywords: string[] = []): GallerySymbol => ({
  filled,
  keywords,
  outlined,
})

/** Every icon of the gallery, nine to a category: a 3 × 3 block each. */
export const CATEGORIES: SymbolCategory[] = [
  {
    symbols: [
      symbol('mail', 'mail-filled', ['email', 'envelope', 'inbox']),
      symbol('chat', 'chat-filled', ['message', 'bubble']),
      symbol('call', 'call-filled', ['phone']),
      symbol('notifications', 'notifications-filled', ['bell', 'alert']),
      symbol('person', 'person-filled', ['user', 'account', 'profile']),
      symbol('group', 'group-filled', ['people', 'team', 'users']),
      symbol('campaign', 'campaign-filled', ['megaphone', 'announce']),
      symbol('send', 'send-filled', ['paper plane']),
      symbol('forum', 'forum-filled', ['conversation', 'messages']),
    ],
    title: 'Communication',
  },
  {
    symbols: [
      symbol('home', 'home-filled', ['house']),
      symbol('settings', 'settings-filled', ['gear', 'preferences']),
      symbol('grid-view', 'grid-view-filled', ['tiles', 'apps']),
      symbol('lock', 'lock-filled', ['padlock', 'secure']),
      symbol('shield', 'shield-filled', ['security', 'protect']),
      symbol('delete', 'delete-filled', ['trash', 'bin', 'remove']),
      symbol('push-pin', 'push-pin-filled', ['pin']),
      symbol('label', 'label-filled', ['tag']),
      symbol('bookmark', 'bookmark-filled', ['save']),
    ],
    title: 'Interface',
  },
  {
    symbols: [
      symbol('photo-camera', 'photo-camera-filled', ['camera', 'photo']),
      symbol('image', 'image-filled', ['picture', 'photo']),
      symbol('videocam', 'videocam-filled', ['video', 'camera']),
      symbol('mic', 'mic-filled', ['microphone', 'record']),
      symbol('library-music', 'library-music-filled', ['music', 'album', 'song']),
      symbol('movie', 'movie-filled', ['film', 'clapper']),
      symbol('play-circle', 'play-circle-filled', ['play', 'start']),
      symbol('palette', 'palette-filled', ['colour', 'color', 'paint']),
      symbol('devices', 'devices-filled', ['phone', 'laptop', 'computer']),
    ],
    title: 'Media',
  },
  {
    symbols: [
      symbol('lightbulb', 'lightbulb-filled', ['idea', 'light']),
      symbol('shopping-bag', 'shopping-bag-filled', ['shop', 'store', 'buy']),
      symbol('local-cafe', 'local-cafe-filled', ['coffee', 'cup', 'tea']),
      symbol('local-pizza', 'local-pizza-filled', ['pizza', 'food']),
      symbol('folder', 'folder-filled', ['directory', 'files']),
      symbol('description', 'description-filled', ['document', 'file', 'page']),
      symbol('calendar-month', 'calendar-month-filled', ['date', 'event']),
      symbol('schedule', 'schedule-filled', ['clock', 'time']),
      symbol('work', 'work-filled', ['briefcase', 'job']),
    ],
    title: 'Everyday',
  },
  {
    symbols: [
      symbol('favorite', 'favorite-filled', ['heart', 'like', 'love']),
      symbol('star', 'star-filled', ['rating']),
      symbol('info', 'info-filled', ['about', 'details']),
      symbol('help', 'help-filled', ['question']),
      symbol('warning', 'warning-filled', ['alert', 'caution']),
      symbol('check-circle', 'check-circle-filled', ['done', 'success', 'tick']),
      symbol('cancel', 'cancel-filled', ['close', 'error']),
      symbol('verified', 'verified-filled', ['badge', 'check']),
      symbol('thumb-up', 'thumb-up-filled', ['like', 'approve']),
    ],
    title: 'Status',
  },
  {
    symbols: [
      symbol('bolt', 'bolt-filled', ['lightning', 'flash', 'energy']),
      symbol('cloud', 'cloud-filled', ['weather']),
      symbol('light-mode', 'light-mode-filled', ['sun', 'day']),
      symbol('dark-mode', 'dark-mode-filled', ['moon', 'night']),
      symbol('water-drop', 'water-drop-filled', ['rain', 'drop', 'water']),
      symbol('eco', 'eco-filled', ['leaf', 'nature', 'green']),
      symbol('location-on', 'location-on-filled', ['map', 'pin', 'place']),
      symbol('explore', 'explore-filled', ['compass', 'discover']),
      symbol('rocket-launch', 'rocket-launch-filled', ['rocket', 'launch', 'space']),
    ],
    title: 'Nature and travel',
  },
]

export const SYMBOL_COUNT = CATEGORIES.reduce((count, category) => count + category.symbols.length, 0)

const normalise = (text: string) => text.trim().toLowerCase().replace(/[-_]/g, ' ')

/** The categories with only the symbols whose name or keywords hold the query, empty ones dropped. */
export const searchSymbols = (query: string): SymbolCategory[] => {
  const needle = normalise(query)

  if (!needle) {
    return CATEGORIES
  }

  return CATEGORIES.map(category => ({
    ...category,
    symbols: category.symbols.filter(entry =>
      [entry.outlined, ...entry.keywords].some(word => normalise(word).includes(needle))
    ),
  })).filter(category => category.symbols.length > 0)
}
