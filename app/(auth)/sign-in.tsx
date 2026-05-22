import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      router.replace('/(tabs)');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* ---- Top Section: branding (centred) ---- */}
        <View style={styles.topSection}>
          <Image
            source={require('../../assets/logo/paral-logo-black.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
        </View>

        {/* ---- Bottom Section: inputs + button + link ---- */}
        <View style={styles.bottomSection}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#536471"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#536471"
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={signInWithEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/onboarding/welcome')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF', },
  keyboardView: { flex: 1, justifyContent: 'center', },
  topSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, },
  bottomSection: { paddingHorizontal: 32, paddingBottom: 32, },
  logo: { width: 70, height: 70, marginBottom: 20, },
  title: { fontSize: 28, fontWeight: '700', color: '#0F1419', textAlign: 'center', marginBottom: 12, },
  input: { backgroundColor: '#F7F9F9', borderRadius: 12, padding: 16, fontSize: 16, color: '#0F1419',
    marginBottom: 16, borderWidth: 1, borderColor: '#E1E8ED', },
  button: { backgroundColor: '#1c7245', paddingVertical: 19, borderRadius: 30, alignItems: 'center', marginTop: 8, },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', },
  linkButton: { alignItems: 'center', marginTop: 20, },
  linkText: { color: '#536471', fontSize: 14, },
  linkBold: { fontWeight: '600', color: '#1c7245', },
});