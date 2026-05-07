import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type MyRewardItem = {
  id: string;               // redemption row id
  reward_id: string;
  reward: {
    type: string;
    name: string;
    discount_amount: number | null;
    discount_percent: number | null;
    max_discount_cap: number | null;
  } | null;
  points_spent: number;
  used: boolean;
  created_at: string;
};

export default function MyRewardsScreen() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<MyRewardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMyRewards();
  }, [user]);

  async function fetchMyRewards() {
    // 1. Get all unused redemptions
    const { data: redemptions, error } = await supabase
      .from('reward_redemptions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('used', false)
      .order('created_at', { ascending: false });

    if (error || !redemptions) {
      console.error('Error fetching redemptions:', error);
      setLoading(false);
      return;
    }

    // 2. For each redemption, fetch the corresponding catalog item
    const enriched: MyRewardItem[] = await Promise.all(
      redemptions.map(async (r: any) => {
        const { data: catalog } = await supabase
          .from('reward_catalog')
          .select('type, name, discount_amount, discount_percent, max_discount_cap')
          .eq('id', r.reward_id)
          .single();

        return {
          id: r.id,
          reward_id: r.reward_id,
          reward: catalog || null,
          points_spent: r.points_spent,
          used: r.used,
          created_at: r.created_at,
        };
      })
    );

    setRewards(enriched);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderColor: '#eee',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', marginLeft: 16 }}>
          My Rewards
        </Text>
      </View>

      {rewards.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#888' }}>No available rewards yet.</Text>
        </View>
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: '#f9f9f9',
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
              }}>
              <Text style={{ fontWeight: '600' }}>
                {item.reward?.name || 'Unknown reward'}
              </Text>
              {item.reward?.type === 'fixed_discount' && item.reward.discount_amount && (
                <Text>{item.reward.discount_amount} Dhs off</Text>
              )}
              {item.reward?.type === 'percentage_discount' && item.reward.discount_percent && (
                <Text>
                  {item.reward.discount_percent}% off
                  {item.reward.max_discount_cap
                    ? ` (max ${item.reward.max_discount_cap} Dhs)`
                    : ''}
                </Text>
              )}
              <Text style={{ color: '#888', marginTop: 4 }}>
                Redeemed on {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}