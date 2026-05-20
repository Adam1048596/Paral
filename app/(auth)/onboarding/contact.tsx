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

export default function ContactScreen() {
  const { setContactType, setContact, contactType, contact } = useOnboarding();
  const [input, setInput] = useState(contact || '');
  const [loading, setLoading] = useState(false);

  const toggleType = () => {
    const newType = contactType === 'email' ? 'phone' : 'email';
    setContactType(newType);
    setInput('');
  };

  const handleContinue = async () => {
    if (!input.trim()) {
      Alert.alert('Required', 'Please enter your contact.');
      return;
    }

    setContact(input.trim());

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      ...(contactType === 'email'
        ? { email: input.trim() }
        : { phone: input.trim() }),
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
          <Text style={styles.title}>
            What's your {contactType === 'email' ? 'email' : 'phone number'}?
          </Text>
          <Text style={styles.subtitle}>
            We'll send you a verification code.
          </Text>

          <TextInput
            style={styles.input}
            placeholder={contactType === 'email' ? 'Email' : 'Phone'}
            placeholderTextColor="#536471"
            keyboardType={contactType === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity onPress={toggleType} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              Use {contactType === 'email' ? 'phone' : 'email'} instead
            </Text>
          </TouchableOpacity>

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
  toggleButton: { marginBottom: 32 },
  toggleText: { color: '#1d9bf0', fontSize: 14 },
  button: {
    width: '100%',
    backgroundColor: '#1d9bf0',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});