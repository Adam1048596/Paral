import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

export default function AccountScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/(auth)/sign-in');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(
      profileData || {
        id: user.id,
        email: user.email || '',
        full_name: null,
        avatar_url: null,
        phone: null,
      }
    );

    try {
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('available_points, pending_points')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pointsData) {
        setAvailablePoints(pointsData.available_points || 0);
        setPendingPoints(pointsData.pending_points || 0);
      }
    } catch {}

    setLoading(false);
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#73b504" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header – always visible */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => router.push('/(tabs)/account/settings')}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.charAt(0) ||
                  profile?.email?.charAt(0).toUpperCase() ||
                  'U'}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.full_name || 'User'}
            </Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#B0B8C1" />
        </TouchableOpacity>

        {/* Glow Points Card */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsTitle}>Glow Points</Text>
          <Text style={styles.pointsValue}>{availablePoints}</Text>
          <Text style={styles.pointsLabel}>Points available</Text>
          {pendingPoints > 0 && (
            <Text style={styles.pendingText}>+{pendingPoints} incoming</Text>
          )}
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => router.push('/(tabs)/account/loyalty-history')}>
            <Text style={styles.historyButtonText}>View Points History →</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <MenuItem
            icon="heart-outline"
            label="Favorites"
            onPress={() => router.push('/(tabs)/account/favorites')}
          />
          <MenuItem
            icon="pricetag-outline"
            label="My Rewards"
            onPress={() => router.push('/(tabs)/account/my-rewards')}
          />
          <MenuItem
            icon="location-outline"
            label="Shipping Addresses"
            onPress={() => router.push('/(tabs)/account/addresses')}
          />
          <MenuItem
            icon="receipt-outline"
            label="Order History"
            onPress={() => router.push('/(tabs)/account/orders')}
          />
          <MenuItem
            icon="gift-outline"
            label="Rewards Shop"
            onPress={() => router.push('/(tabs)/account/rewards-shop')}
          />
          <MenuItem
            icon="settings-outline"
            label="Settings"
            onPress={() => router.push('/(tabs)/account/settings')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={icon as any}
        size={22}
        color="#0F1419"
        style={{ width: 28 }}
      />
      <Text style={styles.menuItemText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#B0B8C1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },

  // Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 20,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#73b504',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '600', color: '#0F1419' },
  profileEmail: { fontSize: 14, color: '#536471', marginTop: 2 },

  // Points
  pointsCard: {
    backgroundColor: '#F7F9F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  pointsTitle: { fontSize: 16, fontWeight: '600', color: '#0F1419', marginBottom: 8 },
  pointsValue: { fontSize: 36, fontWeight: '700', color: '#73b504' },
  pointsLabel: { fontSize: 14, color: '#536471', marginTop: 4 },
  pendingText: { fontSize: 14, color: '#F59E0B', fontWeight: '500', marginTop: 4 },
  historyButton: { marginTop: 12 },
  historyButtonText: { color: '#1d9bf0', fontSize: 14 },

  // Menu
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#0F1419',
    marginLeft: 12,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginBottom: 16,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});