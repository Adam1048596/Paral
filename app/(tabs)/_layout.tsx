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
      case 'search':
        return { active: 'search', inactive: 'search-outline' };
      case 'cart':
        return { active: 'bag-handle', inactive: 'bag-handle-outline' };
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
          <BlurView intensity={0} tint="dark" style={styles.capsule} >

            {props.state.routes.map((route, index) => {
              // Determine if this tab is currently active
              const isActive = pathname === `/${route.name}` || (route.name === 'index' && pathname === '/');
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
                      <Ionicons name={active} size={20} color="#1c7245" />
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
                      <Ionicons name={inactive} size={22} color="#000" />
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
  floatingContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', },
  capsule: {
    flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, 
    paddingHorizontal: 8, minWidth: '100%', maxWidth: '100%',
    overflow: 'hidden', borderWidth: 1, borderColor: '#efefef',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, },
  activePill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#d8fdd2',
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, gap: 6,
  },
  activeLabel: { color: '#1c7245', fontSize: 14, fontWeight: '600', },
  inactiveIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', },
  badge: {
    position: 'absolute', top: -2, right: -6, backgroundColor: '#1c7245', borderRadius: 10, minWidth: 18,
    height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, 
  },
  inactiveBadge: { top: -4, right: -8, },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', },
});

