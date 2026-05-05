import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      supabase.from('orders').select('*').eq('id', id).single().then(({ data }) => setOrder(data));
      supabase.from('order_items').select('product_id, quantity, unit_price, product:products(name)').eq('order_id', id).then(({ data }) => setItems(data || []));
    }
  }, [id]);

  if (!order) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', marginLeft: 16 }}>Order {order.order_number}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontWeight: '600' }}>Status: {order.status}</Text>
        <Text style={{ marginTop: 8 }}>Total: MAD {order.total_amount}</Text>
        <Text style={{ marginTop: 8 }}>Payment: {order.payment_method}</Text>
        <Text style={{ marginTop: 16, fontWeight: '600' }}>Items</Text>
        {items.map((item: any) => (
          <View key={item.product_id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text>{item.product?.name}</Text>
            <Text>x{item.quantity}</Text>
          </View>
        ))}
        <Text style={{ marginTop: 16, fontWeight: '600' }}>Shipping Address</Text>
        <Text>{order.shipping_address?.address_line1}, {order.shipping_address?.city}</Text>
      </ScrollView>
    </View>
  );
}