import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,           // we’ll use a custom header in each screen or common
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="index" />           {/* Main account screen */}
      <Stack.Screen name="favorites" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="order-detail" />    {/* optional order detail */}
      <Stack.Screen name="settings" />
      <Stack.Screen name="rewards-shop" />
      <Stack.Screen name="my-rewards" />
      <Stack.Screen name="loyalty-history" />
    </Stack>
  );
}