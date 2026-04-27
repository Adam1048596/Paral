import { Session } from '@supabase/supabase-js';
import { Slot, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Keep SplashScreen visible until we manually hide it
// app is frozen on loading screen. Wait, I need to check login first
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Stores the current logged-in user (or null if not logged in)
  const [session, setSession] = useState<Session | null>(null);

  // Tracks if we are still checking login status
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (saved session)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);       // save user (or null)
      setIsLoading(false);       // stop loading
    });

    // Listen for login/logout changes in real time
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);       // update session when auth changes
    });

    // Cleanup listener when component unmounts
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🎬 When loading is done → hide splash screen
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

    useEffect(() => {
    console.log("SESSION:", session);
  }, [session]);

  // ⚠️ Right now: no protection (anyone can access app)
  // You will later use `session` here to block users

  return <Slot />; // Render current screen (home, login, etc.)
}