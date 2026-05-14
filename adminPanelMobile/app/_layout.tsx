/**
 * Root layout — app entry point and global provider tree.
 *
 * Wraps the whole app with:
 *   - GestureHandlerRootView  (required by gesture-based components)
 *   - SafeAreaProvider        (insets for notch / home-bar areas)
 *   - AuthProvider            (session state available everywhere via useAuth())
 *   - AppAlert                (global toast overlay, callable from any screen)
 *   - NoConnectionScreen      (full-screen overlay when device is offline)
 *
 * Route structure:
 *   /           → app/index.tsx  (redirects based on login state)
 *   /(auth)/    → login screen
 *   /(admin)/   → drawer-navigated admin screens
 */

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppAlert } from '@/components/AppAlert';
import { LoadingScreen } from '@/components/LoadingScreen';
import { NoConnectionScreen } from '@/components/NoConnectionScreen';
import { AuthProvider } from '@/lib/auth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isConnected, isChecking } = useNetworkStatus();

  if (isChecking) {
    return <LoadingScreen message="Starting up…" />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
      </Stack>
      <StatusBar style="light" />

      {!isConnected && <NoConnectionScreen />}
      <AppAlert />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    // Hide the native splash screen immediately so we can see the custom LoadingScreen
    SplashScreen.hideAsync();
  }, []);

  if (!loaded) {
    return (
      <SafeAreaProvider>
        <LoadingScreen message="Loading resources…" />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
