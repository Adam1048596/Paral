import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Address = {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  region?: string;
  postal_code?: string;
  is_default: boolean;
};

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  async function fetchAddresses() {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });
    if (!error) setAddresses(data || []);
    setLoading(false);
  }

  async function deleteAddress(id: string) {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('addresses').delete().eq('id', id);
          fetchAddresses();
        }
      }
    ]);
  }

  async function setDefault(id: string) {
    // Reset all to false, then set this one to true
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user?.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    fetchAddresses();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', marginLeft: 16 }}>My Addresses</Text>
      </View>
      <FlatList
        data={addresses}
        contentContainerStyle={{ padding: 16 }}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: '#888' }}>No addresses saved.</Text>}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderWidth: 1, borderColor: item.is_default ? '#007AFF' : '#ddd', borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ fontWeight: '600' }}>{item.full_name}</Text>
            <Text>{item.phone}</Text>
            <Text>{item.address_line1}{item.address_line2 ? ', ' + item.address_line2 : ''}</Text>
            <Text>{item.city}{item.region ? ', ' + item.region : ''} {item.postal_code}</Text>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              {!item.is_default && (
                <TouchableOpacity onPress={() => setDefault(item.id)} style={{ marginRight: 16 }}>
                  <Text style={{ color: '#007AFF' }}>Set as default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => deleteAddress(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={{ margin: 16, backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' }}
        onPress={() => router.push('/add-address')}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
}