import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs, usePathname } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../../context/CartContext';

export default function TabsLayout() {
  const { items } = useCart();
  const pathname = usePathname();

  // Map route names to icon pairs (filled / outline)
  const getIcons = (route: string) => {
    switch (route) {
      case 'index':
        return { active: 'home', inactive: 'home-outline' };
      case 'search':
        return { active: 'search', inactive: 'search-outline' };
      case 'cart':
        return { active: 'cart', inactive: 'cart-outline' };
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
        // Outer container that positions the capsule above the home indicator
        <View style={styles.floatingContainer}>
          {/* Frosted glass capsule */}
          <BlurView
            intensity={80}
            tint="dark"
            style={styles.capsule}
          >
            {props.state.routes.map((route, index) => {
              // Determine if this tab is currently active
              const isActive = pathname === `/${route.name}` ||
                (route.name === 'index' && pathname === '/');
              const { active, inactive } = getIcons(route.name);

              return (
                <TouchableOpacity
                  key={route.key}
                  style={styles.tabItem}
                  onPress={() => props.navigation.navigate(route.name)}
                  activeOpacity={0.7}
                >
                  {/* Active tab: pill with icon + label */}
                  {isActive ? (
                    <View style={styles.activePill}>
                      <Ionicons name={active} size={20} color="#FFFFFF" />
                      <Text style={styles.activeLabel}>
                        {route.name === 'index' ? 'Home' : route.name.charAt(0).toUpperCase() + route.name.slice(1)}
                      </Text>
                      {/* Cart badge shown on active cart tab */}
                      {route.name === 'cart' && items.length > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{items.length}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    /* Inactive tab: icon only */
                    <View style={styles.inactiveIcon}>
                      <Ionicons name={inactive} size={22} color="#B0B8C1" />
                      {/* Cart badge still shown on inactive cart tab */}
                      {route.name === 'cart' && items.length > 0 && (
                        <View style={[styles.badge, styles.inactiveBadge]}>
                          <Text style={styles.badgeText}>{items.length}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </BlurView>
        </View>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsule: {
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'android' ? '#fff' : 'transparent', // fallback for Android blur
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: '75%',
    maxWidth: '90%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#73b504',   // your PARAL green
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inactiveIcon: {
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
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  inactiveBadge: {
    top: -4,
    right: -8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});