import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export default function WelcomeScreen() {
  const { session } = useAuth();
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    if (session) router.replace('/(tabs)');
  }, [session]);

  async function signInAnonymously() {
    setGuestLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) Alert.alert('Could not continue as guest', error.message);
    setGuestLoading(false);
  }

  const showComingSoon = (provider: string) => {
    Alert.alert('Coming soon', `${provider} sign‑up will be available soon.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ---- Top Section: Branding (centred) ---- */}
      <View style={styles.topSection}>
        <Image
          source={require('../../../assets/logo/paral-logo-black.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          See what’s happening{'\n'}in your skin world right now
        </Text>
        <Text style={styles.description}>
          Your personalized wellness & skin improvement platform.
        </Text>
      </View>

      {/* ---- Bottom Section: Action buttons ---- */}
      <View style={styles.bottomSection}>
        {/* Inline social buttons – icons only */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={() => showComingSoon('Google')}>
            <Ionicons name="logo-google" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={() => showComingSoon('Facebook')}>
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={() => showComingSoon('Apple')}>
            <Ionicons name="logo-apple" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Create account / Phone & Email */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/(auth)/onboarding/age')}>
          <Text style={styles.primaryButtonText}>Continue with Phone</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By signing up, you agree to the Terms, Privacy Policy and Cookie Use.
        </Text>
        
        {/* Guest */}
        <TouchableOpacity
          onPress={signInAnonymously}
          disabled={guestLoading}
          style={styles.guestButton}>
          <Text style={styles.guestButtonText}>
            {guestLoading ? 'Loading...' : 'Continue as Guest'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  topSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  bottomSection: { paddingHorizontal: 32, paddingBottom: 32 },
  logo: { width: 80, height: 80, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#0F1419', textAlign: 'center', marginBottom: 12, lineHeight: 36 },
  description: { fontSize: 15, color: '#536471', textAlign: 'center', lineHeight: 20 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  socialIconButton: { width: 50, height: 50, borderRadius: 100, borderWidth: 1, borderColor: '#e2e2e2', justifyContent: 'center',
    alignItems: 'center', marginHorizontal: 10, backgroundColor: '#FFFFFF', },
  button: { width: '100%', paddingVertical: 19, borderRadius: 30, alignItems: 'center', marginBottom: 12 },
  primaryButton: { backgroundColor: '#73b504' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 16, },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 8, color: '#536471', fontSize: 13 },
  terms: { fontSize: 12, color: '#536471', textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 16 },
  guestButton: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 30, borderWidth: 1, borderColor: '#D1D5DB', alignSelf: 'center' },
  guestButtonText: { color: '#0F1419', fontWeight: '500', fontSize: 14 },
});