import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
    setLoading(false);
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#007AFF';
      case 'shipped': return '#5856D6';
      case 'delivered': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return '#666';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', marginLeft: 16 }}>Order History</Text>
      </View>
      <FlatList
        data={orders}
        contentContainerStyle={{ padding: 16 }}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: '#888' }}>No orders yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' }}
            onPress={() => router.push(`/order/${item.id}`)}
          >
            <View>
              <Text style={{ fontWeight: '600' }}>{item.order_number}</Text>
              <Text style={{ color: '#666' }}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontWeight: '600' }}>MAD {item.total_amount}</Text>
              <Text style={{ color: statusColor(item.status), textTransform: 'capitalize' }}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}