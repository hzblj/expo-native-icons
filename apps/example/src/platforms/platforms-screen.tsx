import {Lead, Page} from '../ui'
import {NativeNamesSection} from './native-names'
import {PrebuildSection} from './prebuild'
import {SvgRulesSection} from './svg-rules'
import {ToolingSection} from './tooling'
import {VariantsSection} from './variants'

/** One folder, two kinds of native asset: where they land, the platform variants, the rules, the types and the CLI. */
export const PlatformsScreen = () => (
  <Page>
    <Lead>
      One folder of SVGs becomes an image set in the iOS asset catalog and a vector drawable in Android’s resources, at
      prebuild. Nothing is drawn in JavaScript, and no icon font ships.
    </Lead>
    <PrebuildSection />
    <VariantsSection />
    <NativeNamesSection />
    <SvgRulesSection />
    <ToolingSection />
  </Page>
)
