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

export default function ContactScreen() {
  const { setContact, contact } = useOnboarding();
  const [input, setInput] = useState(contact || '');

  const handleContinue = () => {
    const email = input.trim();
    if (!email) {
      Alert.alert('Required', 'Please enter your email.');
      return;
    }
    setContact(email);
    router.push('/(auth)/onboarding/password');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.container}>
          <Text style={styles.title}>What's your email?</Text>
          <Text style={styles.subtitle}>
            You'll use this to log in later.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#536471"
            keyboardType="email-address"
            autoCapitalize="none"
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Next</Text>
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
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  button: {
    width: '100%',
    backgroundColor: '#1d9bf0',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});