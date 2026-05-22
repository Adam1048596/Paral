import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

type RewardItem = {
  id: string;
  type: 'fixed_discount' | 'percentage_discount' | 'free_shipping' | 'double_cashback';
  name: string;
  description: string | null;
  point_cost: number;
  discount_amount: number | null;
  discount_percent: number | null;
  max_discount_cap: number | null;
  expiration_days: number | null;
};

type MysteryBox = {
  id: string;
  name: string;
  tier: 'basic' | 'standard' | 'premium';
  point_cost: number;
  min_value: number;
  max_value: number;
};

export default function RewardsShopScreen() {
  const { user } = useAuth();
  const [availablePoints, setAvailablePoints] = useState(0);
  const [catalog, setCatalog] = useState<RewardItem[]>([]);
  const [boxes, setBoxes] = useState<MysteryBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null); // tracks which item/box is being redeemed

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    // 1. Get points
    const { data: points } = await supabase
      .from('user_points')
      .select('available_points')
      .eq('user_id', user?.id)
      .single();
    setAvailablePoints(points?.available_points ?? 0);

    // 2. Fetch catalog
    const { data: rewards } = await supabase
      .from('reward_catalog')
      .select('*')
      .eq('is_active', true)
      .order('point_cost', { ascending: true });
    setCatalog(rewards || []);

    // 3. Fetch mystery boxes
    const { data: boxesData } = await supabase
      .from('mystery_boxes')
      .select('*')
      .eq('is_active', true)
      .order('point_cost', { ascending: true });
    setBoxes(boxesData || []);

    setLoading(false);
  }

  // Generic redeem: reward catalog items
  async function redeemReward(item: RewardItem) {
    if (!user) return;
    if (availablePoints < item.point_cost) {
      Alert.alert('Not enough points', `You need ${item.point_cost} GP to redeem this reward.`);
      return;
    }

    setRedeeming(item.id);
    const { error } = await supabase.rpc('redeem_reward', {
      p_user_id: user.id,
      p_reward_item_id: item.id,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', `You have redeemed: ${item.name}`, [
        { text: 'OK', onPress: () => fetchData() } // refresh points
      ]);
    }
    setRedeeming(null);
  }

  // Open a mystery box
  async function openBox(box: MysteryBox) {
    if (!user) return;
    if (availablePoints < box.point_cost) {
      Alert.alert('Not enough points', `You need ${box.point_cost} GP to open this box.`);
      return;
    }

    setRedeeming(box.id);
    const { data, error } = await supabase.rpc('open_mystery_box', {
      p_user_id: user.id,
      p_box_id: box.id,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // data is the JSON outcome
      const outcome = data as any;
      let summary = `You received: ${outcome.type}`;
      if (outcome.value) summary += ` worth ${outcome.value} MAD`;
      if (outcome.extra) summary += ` + ${outcome.extra}`;
      Alert.alert('Mystery Box Opened!', summary, [
        { text: 'Awesome!', onPress: () => fetchData() }
      ]);
    }
    setRedeeming(null);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 8,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderColor: '#eee',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', marginLeft: 16 }}>
          Rewards Shop
        </Text>
      </View>

      {/* Points balance */}
      <View style={{ backgroundColor: '#fff', padding: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 16, color: '#666' }}>Your Glow Points</Text>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#007AFF' }}>
          {availablePoints}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Discounts & Freebies Section */}
        <Text style={{ paddingHorizontal: 16, paddingTop: 16, fontSize: 18, fontWeight: '600' }}>
          Discounts & Freebies
        </Text>
        {catalog.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 16,
              marginTop: 12,
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
                {item.description ? (
                  <Text style={{ color: '#666', marginTop: 4 }}>{item.description}</Text>
                ) : null}
                {item.type === 'percentage_discount' && item.discount_percent && (
                  <Text style={{ color: '#888', marginTop: 2 }}>
                    {item.discount_percent}% off (max {item.max_discount_cap} MAD)
                  </Text>
                )}
                {item.type === 'fixed_discount' && item.discount_amount && (
                  <Text style={{ color: '#888', marginTop: 2 }}>
                    {item.discount_amount} MAD off
                  </Text>
                )}
                {item.type === 'free_shipping' && (
                  <Text style={{ color: '#888', marginTop: 2 }}>Free delivery</Text>
                )}
                {item.type === 'double_cashback' && (
                  <Text style={{ color: '#888', marginTop: 2 }}>
                    Double cashback next order
                    {item.expiration_days && ` (expires in ${item.expiration_days}d)`}
                  </Text>
                )}
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', minWidth: 80 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#007AFF' }}>
                  {item.point_cost}
                </Text>
                <Text style={{ color: '#888', fontSize: 12 }}>GP</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => redeemReward(item)}
              disabled={redeeming === item.id || availablePoints < item.point_cost}
              style={{
                marginTop: 12,
                backgroundColor:
                  redeeming === item.id
                    ? '#a0c4ff'
                    : availablePoints >= item.point_cost
                    ? '#007AFF'
                    : '#cccccc',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}>
              {redeeming === item.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {availablePoints >= item.point_cost ? 'Redeem' : 'Not enough points'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {/* Mystery Boxes Section */}
        <Text style={{ paddingHorizontal: 16, paddingTop: 24, fontSize: 18, fontWeight: '600' }}>
          Mystery Boxes
        </Text>
        {boxes.map((box) => (
          <View
            key={box.id}
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 16,
              marginTop: 12,
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 2,
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 16 }}>{box.name}</Text>
                <Text style={{ color: '#666', marginTop: 4 }}>
                  {box.tier.charAt(0).toUpperCase() + box.tier.slice(1)} tier
                </Text>
                <Text style={{ color: '#888', marginTop: 2 }}>
                  Value: {box.min_value} – {box.max_value} MAD
                </Text>
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', minWidth: 80 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#FF9500' }}>
                  {box.point_cost}
                </Text>
                <Text style={{ color: '#888', fontSize: 12 }}>GP</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => openBox(box)}
              disabled={redeeming === box.id || availablePoints < box.point_cost}
              style={{
                marginTop: 12,
                backgroundColor:
                  redeeming === box.id
                    ? '#ffc966'
                    : availablePoints >= box.point_cost
                    ? '#FF9500'
                    : '#cccccc',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}>
              {redeeming === box.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {availablePoints >= box.point_cost ? 'Open Box' : 'Not enough points'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}