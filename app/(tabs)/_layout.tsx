import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs, usePathname } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../../context/CartContext';

export default function TabsLayout() {
  const { items } = useCart();
  const pathname = usePathname();

  const getIcons = (route: string) => {
    switch (route) {
      case 'index':
        return { active: 'home', inactive: 'home-outline' };
      case 'cart':
        return { active: 'bag', inactive: 'bag-outline' };
      case 'account':
        return { active: 'person', inactive: 'person-outline' };
      default:
        return { active: 'ellipse', inactive: 'ellipse-outline' };
    }
  };

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <View style={styles.floatingContainer}>
          <BlurView intensity={0} tint="dark" style={styles.capsule}>
            {props.state.routes.map((route) => {
              const isActive =
                pathname === `/${route.name}` ||
                (route.name === 'index' && pathname === '/');
              const { active, inactive } = getIcons(route.name);

              return (
                <TouchableOpacity
                  key={route.key}
                  style={styles.tabItem}
                  onPress={() => props.navigation.navigate(route.name)}
                  activeOpacity={0.7}>
                  {/* Active tab: just the icon, no pill, no text */}
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={isActive ? active : inactive}
                      size={22}
                      color={isActive ? '#292d32' : '#888888'}
                    />
                    {route.name === 'cart' && items.length > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{items.length}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </BlurView>
        </View>
      )}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 15,
    left: 70,
    right: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsule: {
    flexDirection: 'row',
    backgroundColor: '#fcfbfc',
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fcfcfc',
    borderRadius: 999,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#1c7245',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});