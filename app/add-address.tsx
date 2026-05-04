import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AddAddressScreen() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = async () => {
    if (!fullName || !phone || !addressLine1 || !city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const { error } = await supabase.from('addresses').insert({
      user_id: user?.id,
      full_name: fullName,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      region,
      postal_code: postalCode,
      is_default: isDefault,
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.back();
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#fff', flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20 }}>Add New Address</Text>
      <TextInput placeholder="Full Name" value={fullName} onChangeText={setFullName} style={inputStyle} />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={inputStyle} keyboardType="phone-pad" />
      <TextInput placeholder="Address Line 1" value={addressLine1} onChangeText={setAddressLine1} style={inputStyle} />
      <TextInput placeholder="Address Line 2" value={addressLine2} onChangeText={setAddressLine2} style={inputStyle} />
      <TextInput placeholder="City" value={city} onChangeText={setCity} style={inputStyle} />
      <TextInput placeholder="Region" value={region} onChangeText={setRegion} style={inputStyle} />
      <TextInput placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} style={inputStyle} />
      {/* isDefault toggle can be a switch */}
      <TouchableOpacity style={buttonStyle} onPress={handleSave}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Save Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
  fontSize: 16,
};
const buttonStyle = {
  backgroundColor: '#007AFF',
  padding: 16,
  borderRadius: 8,
  alignItems: 'center',
};