import {KaraProvider, useAppTheme} from '@hzblj/kara-ui'
import {navigationTheme} from '@hzblj/kara-ui/router'
import {ThemeProvider} from 'expo-router'
import {StatusBar} from 'expo-status-bar'
import {type ReactNode, useMemo} from 'react'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {SafeAreaProvider} from 'react-native-safe-area-context'

const ROOT_STYLE = {flex: 1}

/** Inside `KaraProvider`, so the navigation chrome and the status bar follow the same resolved theme as the views. */
const NavigationTheme = ({children}: {children: ReactNode}) => {
  const resolved = useAppTheme()
  const value = useMemo(() => navigationTheme(resolved), [resolved])

  return (
    <ThemeProvider value={value}>
      <StatusBar style={resolved.dark ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  )
}

/** kara's own theme, untouched: the example shows the icons, not a brand. */
export const Providers = ({children}: {children: ReactNode}) => (
  <GestureHandlerRootView style={ROOT_STYLE}>
    <KaraProvider>
      <NavigationTheme>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </NavigationTheme>
    </KaraProvider>
  </GestureHandlerRootView>
)
