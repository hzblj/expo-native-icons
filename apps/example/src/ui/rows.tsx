import {Box, type SpaceSize} from '@hzblj/kara-ui'
import {Children, Fragment, isValidElement, type ReactNode} from 'react'

type RowsProps = {
  children: ReactNode
  /** Where the hairline between two rows starts: past an icon, say. `s16` by default. */
  inset?: SpaceSize
}

/** A card of rows in the style of a grouped list: one surface, a hairline between each row. */
export const Rows = ({children, inset = 's16'}: RowsProps) => (
  <Box bg="surface.primary" borderRadius="large">
    {Children.toArray(children).map((child, index) => (
      <Fragment key={isValidElement(child) ? child.key : index}>
        {index > 0 ? <Box bg="border.tertiary" h={1} ml={inset} /> : null}
        {child}
      </Fragment>
    ))}
  </Box>
)
