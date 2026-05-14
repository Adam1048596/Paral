import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // to react to session changes
import { supabase } from '../../lib/supabase';

export default function SignUp() {
  // ----- Form state -----------------------------------------------------------
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);       // for email sign‑up
  const [guestLoading, setGuestLoading] = useState(false); // for anonymous sign‑in

  // ----- Auth context – auto‑navigate when a session appears -----------------
  const { session } = useAuth();

  useEffect(() => {
    // If any sign‑in succeeds (email, social, anonymous), go to the main app
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session]);

  // ----- Email / password sign‑up ---------------------------------------------
  async function signUpWithEmail() {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert(
        'Check your email',
        'We’ve sent you a confirmation link. Please verify your account before signing in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
      );
    }
    setLoading(false);
  }

  // ----- Anonymous sign‑in ----------------------------------------------------
  async function signInAnonymously() {
    setGuestLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      Alert.alert('Could not continue as guest', error.message);
      setGuestLoading(false);
    }
    // On success, AuthProvider updates the session → useEffect above navigates to /(tabs).
    // No need to manually navigate or set loading false – component unmounts.
  }

  // ----- Placeholder social handlers ------------------------------------------
  const showComingSoon = (provider: string) => {
    Alert.alert('Coming soon', `${provider} sign‑up will be available soon.`);
  };

  // ----- UI --------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          {/* Header */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start earning rewards</Text>

          {/* Form card */}
          <View style={styles.card}>
            <TextInput
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity
              onPress={signUpWithEmail}
              disabled={loading}
              style={[styles.button, styles.primaryButton]}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons – placeholder */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              onPress={() => showComingSoon('Google')}
              style={[styles.socialButton, styles.googleButton]}
            >
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => showComingSoon('Facebook')}
              style={[styles.socialButton, styles.facebookButton]}
            >
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => showComingSoon('Apple')}
              style={[styles.socialButton, styles.appleButton]}
            >
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* ---- NEW: Anonymous sign‑in button --------------------------------- */}
          <TouchableOpacity
            onPress={signInAnonymously}
            disabled={guestLoading}
            style={styles.guestButton}
          >
            <Text style={styles.guestButtonText}>
              {guestLoading ? 'Loading...' : 'Continue as Guest'}
            </Text>
          </TouchableOpacity>

          {/* Bottom link */}
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ----- Styles (same as before + new guest button) ---------------------------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  keyboardView: { flex: 1, justifyContent: 'center' },
  container: { paddingHorizontal: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: { backgroundColor: '#007AFF', marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#D0D0D0' },
  dividerText: { marginHorizontal: 12, color: '#888', fontSize: 14 },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  socialButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  googleButton: { backgroundColor: '#DB4437' },
  facebookButton: { backgroundColor: '#4267B2' },
  appleButton: { backgroundColor: '#000000' },
  // ----- Guest button ----------------------------------------------------------
  guestButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 24,
  },
  guestButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Bottom link
  linkText: { color: '#555', fontSize: 14, marginTop: 8 },
  linkBold: { fontWeight: 'bold', color: '#007AFF' },
});