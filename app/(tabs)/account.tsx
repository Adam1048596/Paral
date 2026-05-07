import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

export default function AccountScreen() {
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

    // Profile
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

    // Glow Points (from user_points table)
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
    } catch {
      // Table may not exist yet – leave zeros
    }

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
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Profile Header */}
      <View
        style={{
          backgroundColor: '#fff',
          padding: 20,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderColor: '#eee',
        }}>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#007AFF',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>
                {profile?.full_name?.charAt(0) ||
                  profile?.email?.charAt(0).toUpperCase() ||
                  'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 12 }}>
          {profile?.full_name || 'User'}
        </Text>
        <Text style={{ color: '#666', marginTop: 4 }}>{profile?.email}</Text>
      </View>

      {/* Glow Points Card */}
      <View
        style={{
          backgroundColor: '#fff',
          margin: 16,
          padding: 16,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 2,
        }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Glow Points
        </Text>

        <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#007AFF', textAlign: 'center' }}>
          {availablePoints}
        </Text>
        <Text style={{ textAlign: 'center', color: '#666', marginTop: 4 }}>
          Points available
        </Text>

        {pendingPoints > 0 && (
          <Text
            style={{
              textAlign: 'center',
              color: '#FF9500',
              marginTop: 6,
              fontWeight: '500',
            }}>
            +{pendingPoints} incoming
          </Text>
        )}

        <TouchableOpacity
          style={{ marginTop: 16, alignItems: 'center' }}
          onPress={() => router.push('/loyalty-history')}>
          <Text style={{ color: '#007AFF' }}>View Points History →</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <View
        style={{
          backgroundColor: '#fff',
          marginHorizontal: 16,
          borderRadius: 12,
          overflow: 'hidden',
        }}>
        <MenuItem
          icon="heart-outline"
          label="Favorites"
          onPress={() => router.push('/favorites')}
        />
        <MenuItem
          icon="pricetag-outline"
          label="My Rewards"
          onPress={() => router.push('/my-rewards')}
        />
        <MenuItem
          icon="location-outline"
          label="Shipping Addresses"
          onPress={() => router.push('/addresses')}
        />
        <MenuItem
          icon="receipt-outline"
          label="Order History"
          onPress={() => router.push('/orders')}
        />
        <MenuItem
          icon="gift-outline"
          label="Rewards Shop"
          onPress={() => router.push('/rewards-shop')}
        />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => router.push('/settings')}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginHorizontal: 16,
          marginTop: 24,
          padding: 16,
          backgroundColor: '#fff',
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text
          style={{
            marginLeft: 12,
            color: '#FF3B30',
            fontSize: 16,
            fontWeight: '500',
          }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
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
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
      }}>
      <Ionicons name={icon as any} size={24} color="#333" style={{ width: 30 }} />
      <Text style={{ flex: 1, fontSize: 16, marginLeft: 12 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}