/*---------------------------------------------------------------------------
| (App Entry / Auth Gate / Startup Screen)
|---------------------------------------------------------------------------
| This is the first screen that runs when the app starts.
|
| Purpose:
| - Acts as a startup gate for the entire app
| - Reads the user authentication state from the AuthContext (no direct API call)
| - Redirects the user to the correct area of the app:
|     → /(tabs) if authenticated (main app)
|     → /(auth)/sign-in if not authenticated
|
| While the auth context is loading, a custom loading UI (logo + spinner) is shown.
| The UI also adapts automatically to the device theme (dark/light mode).
|
| This screen is NOT a real feature screen — it only controls navigation flow.
---------------------------------------------------------------------------*/

import { router } from "expo-router"; // Programmatic navigation: replace route, go back, etc.
import { useEffect } from "react"; // Hook to run side effects (e.g., after render or state change)
import { ActivityIndicator, Image, useColorScheme, View } from "react-native"; // Core RN components + theme detection
import { useAuth } from "../context/AuthContext"; // Custom hook to access session and loading state from AuthProvider

// The default export – Expo Router treats `index.tsx` as the first screen of the app
export default function Index() {

  // --------------------------------------------------------------------------
  // 1. Get auth state from the shared context
  // --------------------------------------------------------------------------
  // `useAuth()` returns the current value provided by <AuthProvider> in _layout.tsx.
  // We pull out only what we need:
  //   - `session`  (Session | null) → whether the user is logged in
  //   - `isLoading` (boolean)        → whether the initial session check is still pending
  const { session, isLoading } = useAuth();

  // --------------------------------------------------------------------------
  // 2. Detect the device color scheme (dark / light mode)
  // --------------------------------------------------------------------------
  // `useColorScheme()` returns "dark", "light", or null.
  // We compare it to "dark" to get a boolean for easier styling.
  const isDark = useColorScheme() === "dark";

  // --------------------------------------------------------------------------
  // 3. Navigate once the auth state is resolved
  // --------------------------------------------------------------------------
  // This effect runs every time `isLoading` or `session` changes.
  // It waits until the initial session check is finished (isLoading === false),
  // then decides where to send the user based on the session.
  useEffect(() => {
    // Only navigate when the first session check is complete
    if (!isLoading) {
      if (session) {
        // A valid session exists → user is authenticated
        // `replace` removes this loading screen from the navigation stack,
        // so the user cannot "go back" to it.
        router.replace("/(tabs)");
      } else {
        // No session found → user needs to sign in
        router.replace("/(auth)/sign-in");
      }
    }
  }, [isLoading, session]);   // Dependencies: re‑run if loading state or session changes

  // --------------------------------------------------------------------------
  // 4. Render the loading UI
  // --------------------------------------------------------------------------
  // While the auth check is happening, show a full‑screen centered view with:
  // - A theme‑aware logo (dark or light version)
  // - A spinning activity indicator (spinner) that also adapts to the theme
  // The user sees this immediately after the native splash disappears.
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        // Swap background based on dark/light mode
        backgroundColor: isDark ? "#000" : "#fff",
      }}
    >
      <Image
        source={
          isDark
            ? require("../assets/logo/logo_icon&text_dark.png")
            : require("../assets/logo/logo_icon&text_white.png")
        }
        style={{ width: 130, marginBottom: 20 }}
        resizeMode="contain"   // Keep the image proportions
      />
      <ActivityIndicator
        size="large"
        color={isDark ? "#fff" : "#000"}   // Spinner color matches text/background contrast
      />
    </View>
  );
}