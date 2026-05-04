import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useCart } from '../../context/CartContext';

export default function TabsLayout() {
  const { items } = useCart();
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
      }} />
      <Tabs.Screen name="search" options={{
        title: 'Search',
        tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />
      }} />
      <Tabs.Screen name="cart" options={{
        title: 'Cart',
        tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
        tabBarBadge: items.length > 0 ? items.length : undefined,
      }} />
      <Tabs.Screen name="account" options={{
        title: 'Account',
        tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />
      }} />
    </Tabs>
  );
}