import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useOnboarding } from '../../../context/OnboardingContext';
import { supabase } from '../../../lib/supabase';

export default function VerificationScreen() {
  const { contact, age, gender, password } = useOnboarding();
  const { session } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Fallback: if session appears later, save demographics & password, then navigate
  useEffect(() => {
    if (session) {
      (async () => {
        if (password) {
          await supabase.auth.updateUser({ password });
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveDemographics(user.id);
        }
      })();
      router.replace('/(tabs)');
    }
  }, [session]);

  async function saveDemographics(userId: string) {
    const updates: Record<string, any> = {};
    if (age !== null && age !== undefined) updates.age = age;
    if (gender) updates.gender = gender;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates });

      if (error) {
        console.error('Failed to save demographics:', error.message);
      }
    }
  }

  const handleVerify = async () => {
    const token = code.trim();
    if (!token) {
      Alert.alert('Required', 'Please enter the verification code.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: contact,
      token,
      type: 'email',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Verification failed', error.message);
      return;
    }

    // Verification succeeded → set password and save demographics
    try {
      if (password) {
        await supabase.auth.updateUser({ password });
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await saveDemographics(user.id);
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not complete setup.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.container}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We sent a 6‑digit code to{'\n'}
            <Text style={{ fontWeight: '600' }}>{contact}</Text>
          </Text>

          <TextInput
            style={styles.codeInput}
            placeholder="123456"
            placeholderTextColor="#536471"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleVerify}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              supabase.auth.signInWithOtp({
                email: contact,
                options: { shouldCreateUser: true },
              });
              Alert.alert('Code resent', 'Check your email for a new code.');
            }}>
            <Text style={styles.resendText}>Resend code</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1, justifyContent: 'center' },
  container: { paddingHorizontal: 32, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#0F1419', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#536471', marginBottom: 32, textAlign: 'center', lineHeight: 22 },
  codeInput: {
    width: '100%',
    backgroundColor: '#F7F9F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: '#0F1419',
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  button: { width: '100%', backgroundColor: '#1d9bf0', borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resendButton: { marginTop: 20 },
  resendText: { color: '#1d9bf0', fontSize: 15 },
});