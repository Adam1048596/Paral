import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../../context/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="age" />
        <Stack.Screen name="gender" />
        <Stack.Screen name="contact" />
        <Stack.Screen name="password" />
        <Stack.Screen name="verification" />
      </Stack>
    </OnboardingProvider>
  );
}