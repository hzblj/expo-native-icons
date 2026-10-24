import type {NativeIconName} from '@hzblj/expo-native-icons'
import {Box, EmptyState, Island, RnText, SearchBar, SegmentedControl} from '@hzblj/kara-ui'
import {useCallback, useMemo, useState} from 'react'

import {Grid, Lead, Page, Section} from '../ui'
import {SymbolCell} from './symbol-cell'
import {SymbolSheet} from './symbol-sheet'
import {
  CATEGORIES,
  type GallerySymbol,
  STYLE_LABELS,
  STYLES,
  SYMBOL_COUNT,
  type SymbolStyle,
  searchSymbols,
} from './symbols'

const COLUMNS = 3

const FIRST = CATEGORIES[0]?.symbols[0] as GallerySymbol

type Shown = {style: SymbolStyle; symbol: GallerySymbol}

/** The symbol an icon belongs to, and which of its two icons it is. */
const BY_NAME = new Map<NativeIconName, Shown>(
  CATEGORIES.flatMap(category =>
    category.symbols.flatMap(symbol => STYLES.map((style): [NativeIconName, Shown] => [symbol[style], {style, symbol}]))
  )
)

/** The Material Symbols of the example's folder, searchable, one style at a time; a tap shows one up close. */
export const GalleryScreen = () => {
  const [query, setQuery] = useState('')
  const [style, setStyle] = useState<SymbolStyle>('outlined')
  const [open, setOpen] = useState(false)
  // The sheet keeps the last icon while it slides away, so its content does not empty out on the way down.
  const [shown, setShown] = useState<Shown>({style: 'outlined', symbol: FIRST})
  const categories = useMemo(() => searchSymbols(query), [query])
  const found = categories.reduce((count, category) => count + category.symbols.length, 0)

  const show = useCallback((name: NativeIconName) => {
    const entry = BY_NAME.get(name)

    if (entry) {
      setShown(entry)
      setOpen(true)
    }
  }, [])

  const close = useCallback(() => setOpen(false), [])

  return (
    <Page>
      <Lead>
        {`${SYMBOL_COUNT} Material Symbols, outlined and filled: ${SYMBOL_COUNT * 2} SVGs the config plugin turned into native assets. Each cell is one native view that draws its icon in the first frame.`}
      </Lead>
      <Box gap="s12">
        <SearchBar onChangeText={setQuery} placeholder="Search by name or meaning" value={query} />
        <SegmentedControl
          onChange={index => setStyle(STYLES[index] ?? 'outlined')}
          selectedIndex={STYLES.indexOf(style)}
          values={STYLES.map(entry => STYLE_LABELS[entry])}
        />
      </Box>
      {found === 0 ? (
        <Island>
          <EmptyState
            description="Try a meaning instead of a name: heart, clock, moon."
            icon="search-off"
            title={`Nothing for “${query.trim()}”`}
          />
        </Island>
      ) : (
        categories.map(category => (
          <Section key={category.title} title={category.title}>
            <Grid
              columns={COLUMNS}
              items={category.symbols}
              keyOf={symbol => symbol.outlined}
              render={symbol => <SymbolCell name={symbol[style]} onPress={show} />}
            />
          </Section>
        ))
      )}
      {query && found > 0 ? (
        <RnText align="center" color="content.tertiary" variant="footnote">
          {found === 1 ? '1 symbol' : `${found} symbols`}
        </RnText>
      ) : null}
      <SymbolSheet
        onClose={close}
        onStyleChange={next => setShown(current => ({...current, style: next}))}
        style={shown.style}
        symbol={shown.symbol}
        visible={open}
      />
    </Page>
  )
}
