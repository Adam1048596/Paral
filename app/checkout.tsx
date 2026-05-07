import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

type Address = {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  is_default: boolean;
};

type MyReward = {
  id: string;                 // redemption id
  reward_id: string;
  reward: {
    type: string;
    name: string;
    discount_amount: number | null;
    discount_percent: number | null;
    max_discount_cap: number | null;
  };
};

export default function CheckoutScreen() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [submitting, setSubmitting] = useState(false);

  // --- Rewards state (only catalog rewards – no mystery box) ---
  const [myRewards, setMyRewards] = useState<MyReward[]>([]);
  const [selectedRewardIds, setSelectedRewardIds] = useState<string[]>([]);
  const [discount, setDiscount] = useState(0);

  // --- Shipping state ---
  const [shippingCost, setShippingCost] = useState(30);   // fallback default
  const [isFreeShipping, setIsFreeShipping] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddresses();
      fetchMyRewards();
      fetchShippingCost();
    }
  }, [user]);

  // Recalculate discount whenever selected rewards, myRewards, or items change
  useEffect(() => {
    if (!selectedRewardIds.length || !myRewards.length) {
      setDiscount(0);
      setIsFreeShipping(false);
      return;
    }

    // Subtotal from paid items only (exclude free items)
    const subtotal = items
      .filter(item => !item.is_free)
      .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

    let totalDiscount = 0;
    let remainingAfterFixed = subtotal;
    let hasFreeShipping = false;

    const selected = myRewards.filter(r => selectedRewardIds.includes(r.id));

    // 1. Fixed discounts (can stack multiple)
    for (const r of selected) {
      if (r.reward?.type === 'fixed_discount' && r.reward.discount_amount) {
        const d = Math.min(r.reward.discount_amount, remainingAfterFixed);
        totalDiscount += d;
        remainingAfterFixed -= d;
      }
      if (r.reward?.type === 'free_shipping') {
        hasFreeShipping = true;
      }
    }

    // 2. Percentage discounts (from original subtotal, capped)
    for (const r of selected) {
      if (r.reward?.type === 'percentage_discount' && r.reward.discount_percent) {
        const pct = r.reward.discount_percent / 100;
        const maxCap = r.reward.max_discount_cap || 0;
        const calculated = subtotal * pct;
        const capped = Math.min(calculated, maxCap);
        const effective = Math.min(capped, subtotal - totalDiscount);
        totalDiscount += effective;
      }
    }

    totalDiscount = Math.min(totalDiscount, subtotal);
    setDiscount(totalDiscount);
    setIsFreeShipping(hasFreeShipping);
  }, [selectedRewardIds, myRewards, items]);

  async function fetchAddresses() {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });
    if (data) {
      setAddresses(data);
      if (data.length > 0) setSelectedAddress(data[0].id);
    }
  }

  // Fetch shipping cost from points_config
  async function fetchShippingCost() {
    const { data } = await supabase
      .from('points_config')
      .select('config_value')
      .eq('config_key', 'shipping_cost_dhs')
      .single();
    if (data) {
      setShippingCost(Number(data.config_value));
    }
  }

  // Fetch discount/ free shipping redemptions only (not mystery box)
  async function fetchMyRewards() {
    const { data: redemptions, error } = await supabase
      .from('reward_redemptions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('used', false)
      .not('reward_id', 'is', null);   // only catalog items

    if (error || !redemptions) {
      console.error('Error fetching redemptions:', error);
      return;
    }

    // Enrich with catalog info
    const enriched = await Promise.all(
      redemptions.map(async (r: any) => {
        const { data: catalog } = await supabase
          .from('reward_catalog')
          .select('type, name, discount_amount, discount_percent, max_discount_cap')
          .eq('id', r.reward_id)
          .single();
        return { ...r, reward: catalog };
      })
    );

    setMyRewards(enriched);
  }

  const toggleReward = (rewardId: string) => {
    setSelectedRewardIds(prev =>
      prev.includes(rewardId)
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    );
  };

  // Subtotal only from paid items
  const subtotal = items
    .filter(item => !item.is_free)
    .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const effectiveShipping = isFreeShipping ? 0 : shippingCost;
  const finalTotal = Math.max(subtotal - discount + effectiveShipping, 0);

  const placeOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Please select a shipping address');
      return;
    }
    const address = addresses.find(a => a.id === selectedAddress);
    if (!address) return;

    setSubmitting(true);
    const orderNumber = `PARAL-${Date.now()}`;

    // Snapshot of applied rewards (include shipping notice)
    const appliedRewards = myRewards
      .filter(r => selectedRewardIds.includes(r.id))
      .map(r => ({
        redemption_id: r.id,
        reward_id: r.reward_id,
        name: r.reward?.name || 'Unknown',
        type: r.reward?.type || 'unknown',
      }));

    // Create order (store shipping cost applied)
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id,
        order_number: orderNumber,
        total_amount: finalTotal,
        shipping_address: address,
        payment_method: paymentMethod,
        status: 'pending',
        discount_applied: discount,
        shipping_cost: effectiveShipping,
        applied_rewards: appliedRewards,
      })
      .select('id')
      .single();

    if (error) {
      Alert.alert('Error', error.message);
      setSubmitting(false);
      return;
    }

    // Build order items – free items get price 0
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.is_free ? 0 : (item.product?.price || 0),
      total_price: item.is_free ? 0 : (item.product?.price || 0) * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      Alert.alert('Error', itemsError.message);
      setSubmitting(false);
      return;
    }

    // Mark any free item's reward redemption as used (if any still exist)
    const freeRedemptionIds = items
      .filter(item => item.is_free && item.reward_redemption_id)
      .map(item => item.reward_redemption_id);

    if (freeRedemptionIds.length > 0) {
      await supabase
        .from('reward_redemptions')
        .update({ used: true })
        .in('id', freeRedemptionIds);
    }

    // Mark selected discount / free shipping rewards as used
    if (selectedRewardIds.length > 0) {
      const { error: updateError } = await supabase
        .from('reward_redemptions')
        .update({ used: true })
        .in('id', selectedRewardIds);
      if (updateError) {
        console.error('Error marking rewards as used:', updateError);
      }
    }

    await clearCart();

    setSubmitting(false);
    Alert.alert(
      'Order Placed',
      `Order ${orderNumber} created. Payment: ${paymentMethod}`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/account') }]
    );
  };

  // Separate free items for display
  const paidItems = items.filter(item => !item.is_free);
  const freeItems = items.filter(item => item.is_free);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>Checkout</Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Address Selection */}
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Shipping Address</Text>
        {addresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            onPress={() => setSelectedAddress(addr.id)}
            style={{
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: selectedAddress === addr.id ? '#007AFF' : '#ddd',
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: '500' }}>{addr.full_name}, {addr.phone}</Text>
            <Text style={{ color: '#666' }}>{addr.address_line1}, {addr.city}</Text>
            {addr.is_default && <Text style={{ color: '#007AFF', fontSize: 12 }}>Default</Text>}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => router.push('/add-address')}
          style={{ marginBottom: 20 }}
        >
          <Text style={{ color: '#007AFF' }}>+ Add New Address</Text>
        </TouchableOpacity>

        {/* My Rewards (includes Free Shipping now) */}
        {myRewards.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Apply Rewards</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {myRewards.map(reward => (
                <TouchableOpacity
                  key={reward.id}
                  onPress={() => toggleReward(reward.id)}
                  style={{
                    backgroundColor: selectedRewardIds.includes(reward.id) ? '#007AFF' : '#f0f0f0',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: selectedRewardIds.includes(reward.id) ? '#fff' : '#333',
                      fontWeight: '500',
                    }}
                  >
                    {reward.reward?.name || 'Reward'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedRewardIds.length > 0 && (
              <TouchableOpacity onPress={() => setSelectedRewardIds([])}>
                <Text style={{ color: '#FF3B30', fontSize: 12 }}>Clear all rewards</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Payment Method */}
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Payment Method</Text>
        <TouchableOpacity
          onPress={() => setPaymentMethod('cod')}
          style={[paymentBox, paymentMethod === 'cod' && selectedBox]}
        >
          <Ionicons name="cash-outline" size={20} />
          <Text style={{ marginLeft: 8 }}>Cash on Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPaymentMethod('bank_transfer')}
          style={[paymentBox, paymentMethod === 'bank_transfer' && selectedBox]}
        >
          <Ionicons name="card-outline" size={20} />
          <Text style={{ marginLeft: 8 }}>Bank Transfer</Text>
        </TouchableOpacity>

        {/* Order Summary */}
        <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: '600', marginBottom: 8 }}>Order Summary</Text>

          {/* Paid items */}
          {paidItems.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>{item.product?.name} x{item.quantity}</Text>
              <Text>MAD {((item.product?.price || 0) * item.quantity).toFixed(2)}</Text>
            </View>
          ))}

          {/* Free items (from mystery boxes) – still shown if any */}
          {freeItems.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontWeight: '500', color: 'green' }}>Free Items</Text>
              {freeItems.map((item) => (
                <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'green' }}>{item.product?.name} x{item.quantity}</Text>
                  <Text style={{ color: 'green' }}>FREE</Text>
                </View>
              ))}
            </View>
          )}

          {/* Shipping cost */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text>Shipping</Text>
            {isFreeShipping ? (
              <Text style={{ color: 'green' }}>FREE (reward applied)</Text>
            ) : (
              <Text>MAD {shippingCost.toFixed(2)}</Text>
            )}
          </View>

          {discount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: 'green' }}>Discount</Text>
              <Text style={{ color: 'green' }}>- MAD {discount.toFixed(2)}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Total</Text>
            <Text style={{ fontWeight: 'bold' }}>MAD {finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          onPress={placeOrder}
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#a0c4ff' : '#007AFF',
            padding: 16,
            borderRadius: 8,
            marginTop: 24,
            marginBottom: 40,
            alignItems: 'center',
          }}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600' }}>Place Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const paymentBox = {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 14,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ddd',
  marginBottom: 8,
};
const selectedBox = { borderColor: '#007AFF', backgroundColor: '#f0f8ff' };