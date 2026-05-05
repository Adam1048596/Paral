import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('full_name, phone').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      phone,
    });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Saved', 'Profile updated successfully');
      router.back();
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '600', marginLeft: 16 }}>Edit Profile</Text>
      </View>
      <View style={{ padding: 20 }}>
        <Text style={{ marginBottom: 8 }}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 20 }}
        />
        <Text style={{ marginBottom: 8 }}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 30 }}
        />
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={{ backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}