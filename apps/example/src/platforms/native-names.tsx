import {NativeIcon} from '@hzblj/expo-native-icons'
import {Box, ContextMenu, Icon, Island, type MenuAction, RnText, useAppTheme, VStack} from '@hzblj/kara-ui'
import {type ReactNode, useMemo, useState} from 'react'
import {Platform} from 'react-native'

import {CodeBlock, Grid, InlineCode, Section} from '../ui'

const GLYPH_BOX = 48

type Renderer = {
  /** Draws the glyph its way. */
  glyph: ReactNode
  id: string
  title: string
  /** What draws it on this platform. */
  view: string
}

const RendererTile = ({glyph, title, view}: Omit<Renderer, 'id'>) => (
  <Box bg="surface.primary" borderRadius="large" flex={1} gap="s12" p="s12">
    <Box h={GLYPH_BOX} justify="center">
      {glyph}
    </Box>
    <Box gap="s2">
      <RnText numberOfLines={1} variant="footnoteMedium">
        {title}
      </RnText>
      <InlineCode>{view}</InlineCode>
    </Box>
  </Box>
)

/** The same image set by native name, drawn by three different views: the package's, SwiftUI's or Compose's, a menu's. */
export const NativeNamesSection = () => {
  const theme = useAppTheme()
  const [chosen, setChosen] = useState<string>()

  const actions = useMemo<MenuAction[]>(
    () => [
      {icon: 'share', label: 'Share', onPress: () => setChosen('Share')},
      {icon: 'bookmark', label: 'Save', onPress: () => setChosen('Save')},
      {destructive: true, icon: 'delete', label: 'Delete', onPress: () => setChosen('Delete')},
    ],
    []
  )

  const renderers: Renderer[] = [
    {
      glyph: <NativeIcon color={theme.color('content.accent')} name="bolt-filled" size={32} />,
      id: 'native-icon',
      title: 'NativeIcon',
      view: Platform.select({android: 'View', default: 'UIImageView'}),
    },
    {
      glyph: (
        <Island>
          <VStack align="start" wide>
            <Icon color="content.accent" name="bolt-filled" size="s32" />
          </VStack>
        </Island>
      ),
      id: 'icon',
      title: 'kara’s Icon',
      view: Platform.select({android: 'Compose Icon', default: 'SwiftUI Image'}),
    },
  ]

  return (
    <Section
      caption="kara’s Icon hands the name to SwiftUI’s Image(assetName) and Compose’s painterResource, its context menu to UIImage(named:) and Material’s menu, and its tab bar to the native tabs below. The plugin writes the asset once; anything that takes a native image by name can draw it."
      title="Native names"
    >
      <CodeBlock code={"iconResourceName('arrow-left')\n// 'native_icon_arrow_left'"} />
      <Grid
        items={renderers}
        keyOf={renderer => renderer.id}
        render={renderer => <RendererTile glyph={renderer.glyph} title={renderer.title} view={renderer.view} />}
      />
      <ContextMenu actions={actions} borderRadius="large">
        <Box align="center" bg="surface.primary" borderRadius="large" gap="s12" p="s16" row>
          <Box align="center" bg="fill.tertiary" borderRadius="medium" h={GLYPH_BOX} justify="center" w={GLYPH_BOX}>
            <NativeIcon color={theme.color('content.primary')} name="share" size={24} />
          </Box>
          <Box flex={1} gap="s2">
            <RnText variant="subheadlineMedium">Long-press for a menu</RnText>
            <RnText color="content.secondary" variant="footnote">
              {chosen
                ? `You chose ${chosen}.`
                : `Share, Save and Delete, each with its icon in a ${Platform.select({android: 'Material menu', default: 'UIMenu'})}.`}
            </RnText>
          </Box>
        </Box>
      </ContextMenu>
    </Section>
  )
}
