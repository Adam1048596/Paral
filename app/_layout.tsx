/**
 * RootLayout – Top-level wrapper for the entire app.
 *
 * Responsibilities:
 *  - Prevent the native splash from hiding automatically
 *  - Hide the native splash as soon as this component mounts
 *  - Provide Auth and Cart contexts to all screens
 *  - Render the current route via <Slot />
 */
import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';


// Prevent the native splash from hiding before we have a chance to control it.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'AirbnbCereal_W_Bd': require('../assets/font/AirbnbCereal_W_Bd.otf'),
    'AirbnbCereal_W_Bk': require('../assets/font/AirbnbCereal_W_Bk.otf'),
    'AirbnbCereal_W_Blk': require('../assets/font/AirbnbCereal_W_Blk.otf'),
    'AirbnbCereal_W_Lt': require('../assets/font/AirbnbCereal_W_Lt.otf'),
    'AirbnbCereal_W_Md': require('../assets/font/AirbnbCereal_W_Md.otf'),
    'AirbnbCereal_W_XBd': require('../assets/font/AirbnbCereal_W_XBd.otf'),

  });
  // ---------------------------------------------------------------
  // 1. Hide the native splash immediately after mount
  // ---------------------------------------------------------------
  useEffect(() => {
    // This effect runs right after the component appears on screen.
    // At this point JavaScript is fully loaded and React is ready.
    // Hide the native splash so the user can see our custom loading screen (index.tsx).
    SplashScreen.hideAsync();
  }, []);

  // ---------------------------------------------------------------
  // 2. Provide context and render the current route
  // ---------------------------------------------------------------
  return (
    <AuthProvider>
      <CartProvider>
        <Slot />
      </CartProvider>
    </AuthProvider>
  );
}