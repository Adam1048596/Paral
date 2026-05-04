import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
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

export default function CheckoutScreen() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });
    if (data) {
      setAddresses(data);
      if (data.length > 0) setSelectedAddress(data[0].id);
    }
  };

  const total = items.reduce((sum, item) => {
    if (item.product?.price) return sum + item.product.price * item.quantity;
    return sum;
  }, 0);

  const placeOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Please select a shipping address');
      return;
    }
    const address = addresses.find((a) => a.id === selectedAddress);
    if (!address) return;

    setSubmitting(true);
    // Generate order number (simple date-based, you can improve)
    const orderNumber = `PARAL-${Date.now()}`;

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id,
        order_number: orderNumber,
        total_amount: total,
        shipping_address: address,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      Alert.alert('Error', error.message);
      setSubmitting(false);
      return;
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.product?.price || 0,
      total_price: (item.product?.price || 0) * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      Alert.alert('Error', itemsError.message);
      setSubmitting(false);
      return;
    }

    // Clear cart
    await clearCart();

    setSubmitting(false);
    Alert.alert('Order Placed', `Order ${orderNumber} created. Payment method: ${paymentMethod}`, [
      { text: 'OK', onPress: () => router.replace('/(tabs)/account') },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>Checkout</Text>

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
          }}>
          <Text style={{ fontWeight: '500' }}>{addr.full_name}, {addr.phone}</Text>
          <Text style={{ color: '#666' }}>{addr.address_line1}, {addr.city}</Text>
          {addr.is_default && <Text style={{ color: '#007AFF', fontSize: 12 }}>Default</Text>}
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => router.push('/add-address')} style={{ marginBottom: 20 }}>
        <Text style={{ color: '#007AFF' }}>+ Add New Address</Text>
      </TouchableOpacity>

      {/* Payment Method */}
      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Payment Method</Text>
      <TouchableOpacity
        onPress={() => setPaymentMethod('cod')}
        style={[paymentBox, paymentMethod === 'cod' && selectedBox]}>
        <Ionicons name="cash-outline" size={20} />
        <Text style={{ marginLeft: 8 }}>Cash on Delivery</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setPaymentMethod('bank_transfer')}
        style={[paymentBox, paymentMethod === 'bank_transfer' && selectedBox]}>
        <Ionicons name="card-outline" size={20} />
        <Text style={{ marginLeft: 8 }}>Bank Transfer</Text>
      </TouchableOpacity>

      {/* Order Summary */}
      <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Order Summary</Text>
        {items.map((item) => (
          <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{item.product?.name} x{item.quantity}</Text>
            <Text>MAD {((item.product?.price || 0) * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Total</Text>
          <Text style={{ fontWeight: 'bold' }}>MAD {total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={placeOrder}
        disabled={submitting}
        style={{
          backgroundColor: submitting ? '#a0c4ff' : '#007AFF',
          padding: 16,
          borderRadius: 8,
          marginTop: 20,
          alignItems: 'center',
        }}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '600' }}>Place Order</Text>
        )}
      </TouchableOpacity>
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