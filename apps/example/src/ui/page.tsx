import {Box, RnScrollView, RnText} from '@hzblj/kara-ui'
import type {ReactNode} from 'react'

/** Every screen of the example: one React Native scroll view under the native large title, with room for the tab bar. */
export const Page = ({children}: {children: ReactNode}) => (
  <RnScrollView
    bg="surface.base"
    content={{gap: 's32', pb: 's80', pt: 's8', px: 's20'}}
    contentInsetAdjustmentBehavior="automatic"
    flex={1}
    keyboardDismissMode="on-drag"
    keyboardShouldPersistTaps="handled"
  >
    {children}
  </RnScrollView>
)

/** The sentence under a page's title that says what the page is about. */
export const Lead = ({children}: {children: ReactNode}) => (
  <RnText color="content.secondary" variant="body">
    {children}
  </RnText>
)

type SectionProps = {
  /** A line under the content: what to notice, or where the platforms differ. */
  caption?: string
  children: ReactNode
  title?: string
}

/** A titled block of a page, in the style of a grouped list's header and footer. */
export const Section = ({caption, children, title}: SectionProps) => (
  <Box gap="s8">
    {title ? (
      <RnText color="content.secondary" variant="footnoteMedium">
        {title.toUpperCase()}
      </RnText>
    ) : null}
    {children}
    {caption ? (
      <RnText color="content.tertiary" variant="footnote">
        {caption}
      </RnText>
    ) : null}
  </Box>
)

type GridProps<T> = {
  /** How many to a row. Two by default. */
  columns?: number
  items: readonly T[]
  keyOf: (item: T) => string
  render: (item: T) => ReactNode
}

/** Rows of equal columns, the last one padded so its items keep their width. */
export const Grid = <T,>({columns = 2, items, keyOf, render}: GridProps<T>) => {
  const rows: T[][] = []

  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns))
  }

  return (
    <Box gap="s12">
      {rows.map(row => (
        <Box gap="s12" key={row.map(keyOf).join()} row>
          {row.map(item => (
            <Box basis={0} grow key={keyOf(item)}>
              {render(item)}
            </Box>
          ))}
          {Array.from({length: columns - row.length}, (_, index) => (
            <Box basis={0} grow key={`pad-${index}`} />
          ))}
        </Box>
      ))}
    </Box>
  )
}
