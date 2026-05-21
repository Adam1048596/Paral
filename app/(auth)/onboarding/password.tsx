import { router } from 'expo-router';
import { useState } from 'react';
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
import { useOnboarding } from '../../../context/OnboardingContext';
import { supabase } from '../../../lib/supabase';

export default function PasswordScreen() {
  const { setPassword, setConfirmPassword, password, confirmPassword, contact } = useOnboarding();
  const [pass, setPass] = useState(password || '');
  const [confirm, setConfirm] = useState(confirmPassword || '');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!pass || pass.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters.');
      return;
    }
    if (pass !== confirm) {
      Alert.alert('Passwords do not match', 'Please make sure both passwords match.');
      return;
    }

    setPassword(pass);
    setConfirmPassword(confirm);

    // Now send the OTP to the email
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: contact,
      options: { shouldCreateUser: true },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.push('/(auth)/onboarding/verification');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.container}>
          <Text style={styles.title}>Create a password</Text>
          <Text style={styles.subtitle}>
            You'll use your email and this password to log in.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#536471"
            secureTextEntry
            value={pass}
            onChangeText={setPass}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#536471"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleContinue}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Sending code...' : 'Next'}
            </Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F1419',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#536471',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#F7F9F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F1419',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  button: {
    width: '100%',
    backgroundColor: '#1d9bf0',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});