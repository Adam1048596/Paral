import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useOnboarding } from '../../../context/OnboardingContext';
import { supabase } from '../../../lib/supabase';

export default function WelcomeScreen() {
  const { session } = useAuth();
  const { setContactType } = useOnboarding();
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

  // Navigate to Age screen – always use email
  const goToAge = () => {
    setContactType('email');
    router.push('/(auth)/onboarding/age');
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
        {/* Inline social buttons + email sign‑up icon */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={() => showComingSoon('Facebook')}>
            <Image
              source={require('../../../assets/icons/facebook-logo.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={() => showComingSoon('Google')}>
            <Image
              source={require('../../../assets/icons/google-logo.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={() => showComingSoon('Apple')}>
            <Image
              source={require('../../../assets/icons/apple-logo.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {/* Email sign‑up icon – starts the email onboarding */}
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={goToAge}>
            <Image
              source={require('../../../assets/icons/mail-inbox.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Continue as Guest – main action */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={signInAnonymously}
          disabled={guestLoading}>
          <Text style={styles.primaryButtonText}>
            {guestLoading ? 'Loading...' : 'Continue as Guest'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By signing up, you agree to the Terms, Privacy Policy and Cookie Use.
        </Text>

        {/* Already have an account? Sign in */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          style={styles.signInButton}>
          <Text style={styles.signInText}>
            Already have an account?{' '}
            <Text style={{ fontWeight: '600', color: '#1c7245' }}>Sign in</Text>
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
  logo: { width: 70, height: 70, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#0F1419', textAlign: 'center', marginBottom: 12, lineHeight: 36 },
  description: { fontSize: 15, color: '#536471', textAlign: 'center', lineHeight: 20 },
  button: { width: '100%', paddingVertical: 19, borderRadius: 30, alignItems: 'center', marginBottom: 12 },
  primaryButton: { backgroundColor: '#1c7245' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  terms: { fontSize: 12, color: '#536471', textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 16 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  socialIconButton: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#eaeaea',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 10, },
  socialIcon: { width: 20, height: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { marginHorizontal: 8, color: '#536471', fontSize: 13 },
  signInButton: { alignItems: 'center', marginTop: 4 },
  signInText: { color: '#536471', fontSize: 14 },
});