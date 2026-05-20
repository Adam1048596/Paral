import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOnboarding } from '../../../context/OnboardingContext';

export default function GenderScreen() {
  const { setGender } = useOnboarding();

  const handleSelect = (gender: string) => {
    setGender(gender);
    router.push('/(auth)/onboarding/contact');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>What's your gender?</Text>
        <Text style={styles.subtitle}>
          This helps us make better product recommendations.
        </Text>

        <TouchableOpacity style={styles.option} onPress={() => handleSelect('female')}>
          <Text style={styles.optionText}>Female</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => handleSelect('male')}>
          <Text style={styles.optionText}>Male</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    marginBottom: 40,
    textAlign: 'center',
  },
  option: {
    width: '100%',
    backgroundColor: '#F7F9F9',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  optionText: { color: '#0F1419', fontSize: 18, fontWeight: '500' },
});