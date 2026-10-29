import {Tabs} from '@hzblj/kara-ui/router'

// The tab bar's icons are the same generated assets: kara hands iconResourceName to the native tabs.
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen icon="grid-view" name="(gallery)" selectedIcon="grid-view-filled" title="Gallery" />
      <Tabs.Screen icon="palette" name="style" selectedIcon="palette-filled" title="Style" />
      <Tabs.Screen icon="bolt" name="effects" selectedIcon="bolt-filled" title="Effects" />
      <Tabs.Screen icon="devices" name="platforms" selectedIcon="devices-filled" title="Platforms" />
    </Tabs>
  )
}
