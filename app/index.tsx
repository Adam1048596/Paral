/*--------------------------------------------------------------------------
| (Startup / Splash Screen)
|--------------------------------------------------------------------------
| This screen is the app entry/loading screen.
| What it does:
| 1. App opens
| 2. This screen loads first
| 3. useEffect runs automatically
| 4. checkSession() checks Supabase auth session
| 5. If user is logged in:
|       → Redirect to /(tabs)
| 6. If user is NOT logged in:
|       → Redirect to /(auth)/sign-in
| While checking the session, a loading UI is shown.
|--------------------------------------------------------------------------*/
// import { router } from "expo-router"; // router lets us switch screens programmatically
// import { useEffect } from "react"; // useEffect is a React Hook that runs code after the screen first shows
import { ActivityIndicator, Image, View, useColorScheme } from "react-native"; // useColorScheme() to detect system dark/light mode
// import { supabase } from "../lib/supabase"; // supabase client – used to check if user is logged in




// This is the main component for this screen.
// "export default" means other files can import it.
// "Index" is the name – Expo Router uses index.tsx as the first screen.
export default function Index() {

  // useEffect(() => { checkSession(); }, []);

  // // Go to a new screen and REMOVE the current screen from history depends  on the user's authentication status.
  // async function checkSession() {
  //   // Reads the current authentication session from local device storage.
  //   // Supabase first checks if a session (access token + user data) is stored locally.
  //   // It tries local first. It only talks to the backend if it needs to renew or fix the session.
  //   // The result is returned in `data.session` (null if no user is logged in).
  //   const{ data } = await supabase.auth.getSession();

  //   // If a valid session exists (user is logged in),
  //   // redirect them to the main app area (tabs layout).
  //   if (data.session) {
  //     router.replace("/(tabs)");
  //   } else {
  //     // If there is no session (user is not logged in),
  //     // redirect them to the authentication flow (sign-in screen).
  //     router.replace("/(auth)/sign-in");
  //   }
  // }
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
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
    <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} /> {/* spinner that shows the app is loading while we check the user's session */}
  </View>
  );
}