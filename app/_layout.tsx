import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import ClerkProviderComponent from './utils/ClerkProvider';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(app)';
    const inAuthScreen = segments[0] === 'screens';

    if (isSignedIn && !inTabsGroup) {
      // Only redirect if not already in the app group and not in the process of signing in
      router.replace('/(app)/home');
    } else if (!isSignedIn && !inAuthScreen) {
      // Only redirect to home if not already there and not in an auth screen
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="screens/SignInScreen" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="screens/SignUpScreen" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="screens/ForgotPasswordScreen" 
        options={{ 
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerTintColor: '#000',
        }} 
      />
      <Stack.Screen 
        name="(app)" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProviderComponent>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <RootLayoutNav />
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </ThemeProvider>
    </ClerkProviderComponent>
  );
}
