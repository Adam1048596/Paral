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
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

type Transaction = {
  id: string;
  amount: number;
  event_type: string;
  description: string;
  created_at: string;
};

export default function LoyaltyHistoryScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  async function fetchTransactions() {
    const { data } = await supabase
      .from('points_transactions')   // <-- new table
      .select('id, amount, event_type, description, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setTransactions(data);
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
          Points History
        </Text>
      </View>
      {transactions.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{ color: '#888' }}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: '#f0f0f0',
              }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>{item.description}</Text>
                <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                  {new Date(item.created_at).toLocaleDateString()} ·{' '}
                  {item.event_type}
                </Text>
              </View>
              <Text
                style={{
                  fontWeight: 'bold',
                  color: item.amount > 0 ? '#34C759' : '#FF3B30',
                }}>
                {item.amount > 0 ? '+' : ''}
                {item.amount}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}