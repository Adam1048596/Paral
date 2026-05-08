/*---------------------------------------------------------------------------
| (App Entry / Auth Gate / Startup Screen)
|---------------------------------------------------------------------------
| This is the first screen that runs when the app starts.
|
| Purpose:
| - Acts as a startup gate for the entire app
| - Checks if the user is already logged in using Supabase
| - Redirects user to the correct area of the app:
|     → /(tabs) if authenticated (main app)
|     → /(auth)/sign-in if not authenticated
|
| While this check is happening, a loading UI (logo + spinner) is shown.
| The UI also adapts automatically to the device theme (dark/light mode).
|
| This screen is NOT a real feature screen — it only controls navigation flow.
---------------------------------------------------------------------------*/

import { router } from "expo-router"; // router lets us switch screens programmatically
import { useEffect } from "react"; // useEffect is a React Hook that runs code after the screen first shows
import { ActivityIndicator, Image, useColorScheme, View } from "react-native"; // useColorScheme() to detect system dark/light mode
import { supabase } from "../lib/supabase"; // supabase client – used to check if user is logged in


// This is the main component for this screen.
// "export default" means other files can import it.
// "Index" is the name – Expo Router uses index.tsx as the first screen.
export default function Index() {

  useEffect(() => { checkSession(); }, []); // Run checkSession() once when this component first mounts. (the empty array [] means "run once on mount")

  const isDark = useColorScheme() === "dark"; // stor the result of the color scheme check in a variable (true if dark mode, false if light mode)
  
  // Go to a new screen and REMOVE the current screen from history depends  on the user's authentication status.
  async function checkSession() {
    await new Promise(resolve => setTimeout(resolve, 3000) ); // artificial delay to show the splash screen for 5 seconds (3000 milliseconds) remove after testing
    // Reads the current authentication session from local device storage.
    // Supabase first checks if a session (access token + user data) is stored locally.
    // It tries local first. It only talks to the backend if it needs to renew or fix the session.
    // The result is returned in `data.session` (null if no user is logged in).
    const{ data } = await supabase.auth.getSession();
    // If a valid session exists (user is logged in),
    // redirect them to the main app area (tabs layout).
    if (data.session) {
      router.replace("/(tabs)");
    } else {
      // If there is no session (user is not logged in),
      // redirect them to the authentication flow (sign-in screen).
      router.replace("/(auth)/sign-in");
    }
  }
  return (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDark ? "#000" : "#fff", }} >
    <Image
      source={
        isDark
          ? require("../assets/logo/logo_icon&text_dark.png")
          : require("../assets/logo/logo_icon&text_white.png")
      }
      style={{ width: 130, marginBottom: 20 }}
      resizeMode="contain"
    />
    <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
  </View>
  );
}