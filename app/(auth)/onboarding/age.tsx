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

export default function AgeScreen() {
  const { setAge } = useOnboarding();
  const [ageInput, setAgeInput] = useState('');

  const handleContinue = () => {
    const age = parseInt(ageInput, 10);
    if (!isNaN(age) && age > 0 && age < 120) {
      setAge(age);
      router.push('/(auth)/onboarding/gender');
    } else {
      Alert.alert('Invalid age', 'Please enter a valid age.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.container}>
          <Text style={styles.title}>How old are you?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your experience.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Your age"
            placeholderTextColor="#536471"
            keyboardType="numeric"
            value={ageInput}
            onChangeText={setAgeInput}
            maxLength={3}
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
    fontSize: 28,
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
    fontSize: 18,
    color: '#0F1419',
    textAlign: 'center',
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