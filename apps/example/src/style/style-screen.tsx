import {Lead, Page} from '../ui'
import {ScreenReadersSection} from './screen-readers'
import {SizeSection} from './size'
import {TintSection} from './tint'
import {WithTextSection} from './with-text'

/** How an icon is drawn: its tint, its size, next to text, and what a screen reader makes of it. */
export const StyleScreen = () => (
  <Page>
    <Lead>
      Every icon is a single-colour template that the platform tints, and keeps its vector data, so one SVG serves every
      colour and every size.
    </Lead>
    <TintSection />
    <SizeSection />
    <WithTextSection />
    <ScreenReadersSection />
  </Page>
)
