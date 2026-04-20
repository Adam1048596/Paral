import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

type LoyaltyAccount = {
  points_balance: number;
  current_streak_days: number;
};

export default function AccountScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/(auth)/sign-in');
      return;
    }

    // Fetch profile from public.profiles table
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profileData || { id: user.id, email: user.email || '', full_name: null, avatar_url: null });

    // Fetch loyalty account (if exists)
    const { data: loyaltyData } = await supabase
      .from('loyalty_accounts')
      .select('points_balance, current_streak_days')
      .eq('user_id', user.id)
      .single();

    setLoyalty(loyaltyData || { points_balance: 0, current_streak_days: 0 });
    setLoading(false);
  }

  async function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  }

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Profile Header */}
      <View style={{ backgroundColor: '#fff', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' }}>
        <TouchableOpacity onPress={() => {/* Navigate to edit profile */}}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={{ width: 80, height: 80, borderRadius: 40 }} />
          ) : (
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 12 }}>{profile?.full_name || 'User'}</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>{profile?.email}</Text>
      </View>

      {/* Loyalty Card */}
      <View style={{ backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Loyalty Program</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#007AFF' }}>{loyalty?.points_balance || 0}</Text>
            <Text style={{ color: '#666' }}>Points</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#eee' }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF9500' }}>{loyalty?.current_streak_days || 0}</Text>
            <Text style={{ color: '#666' }}>Day Streak</Text>
          </View>
        </View>
        <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: '#007AFF' }}>View Points History →</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <View style={{ backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' }}>
        <MenuItem
          icon="heart-outline"
          label="Favorites"
          onPress={() => {/* Navigate to favorites */}}
        />
        <MenuItem
          icon="location-outline"
          label="Shipping Addresses"
          onPress={() => {/* Navigate to addresses */}}
        />
        <MenuItem
          icon="receipt-outline"
          label="Order History"
          onPress={() => {/* Navigate to orders */}}
        />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => {/* Navigate to settings */}}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{ marginHorizontal: 16, marginTop: 24, padding: 16, backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
      >
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={{ marginLeft: 12, color: '#FF3B30', fontSize: 16, fontWeight: '500' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// Reusable menu item component
function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#f0f0f0' }}
    >
      <Ionicons name={icon as any} size={24} color="#333" style={{ width: 30 }} />
      <Text style={{ flex: 1, fontSize: 16, marginLeft: 12 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}