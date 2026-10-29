import {Lead, Page} from '../ui'
import {RenderingSection} from './rendering'
import {RunningSection} from './running'
import {StatesSection} from './states'
import {TransitionsSection} from './transitions'
import {TriggeredSection} from './triggered'
import {VariableSection} from './variable'

/** What SF Symbols does with a symbol, done with the app's own icons: effects, transitions, colours and values. */
export const EffectsScreen = () => (
  <Page>
    <Lead>
      Every icon is also a custom SF Symbol on iOS, so UIKit animates and colours it like Apple’s own; Android redraws
      the same effects from the vector drawable’s paths. One API, one SVG, both platforms.
    </Lead>
    <TriggeredSection />
    <RunningSection />
    <StatesSection />
    <TransitionsSection />
    <RenderingSection />
    <VariableSection />
  </Page>
)
