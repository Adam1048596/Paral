import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../../context/CartContext';

export default function CartScreen() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();

  const total = items.reduce((sum, item) => {
    if (item.product?.price) return sum + item.product.price * item.quantity;
    return sum;
  }, 0);

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="cart-outline" size={64} color="#ccc" />
        <Text style={{ fontSize: 18, color: '#888', marginTop: 16 }}>Your cart is empty</Text>
        <TouchableOpacity onPress={() => router.push('/')} style={{ marginTop: 20 }}>
          <Text style={{ color: '#007AFF' }}>Continue shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
            <Image
              source={{ uri: item.product?.image_main || 'https://via.placeholder.com/80' }}
              style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0' }}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: '600' }}>{item.product?.name}</Text>
              <Text style={{ color: '#888' }}>MAD {item.product?.price?.toFixed(2) || '0.00'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Ionicons name="remove-circle-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 16, fontSize: 16 }}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      <View style={{ padding: 16, borderTopWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Total: MAD {total.toFixed(2)}</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 16,
            borderRadius: 8,
            marginTop: 12,
            alignItems: 'center',
          }}
          onPress={() => router.push('/checkout')}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}