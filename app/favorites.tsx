import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View, } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type FavoriteProduct = {
  product_id: string;
  product: {
    id: string;
    name: string;
    image_main: string | null;
    brand: { name: string } | null;
    price: number | null;
  };
};

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  async function fetchFavorites() {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        product_id,
        product:products (
          id,
          name,
          image_main,
          brand:brands(name),
          price
        )
      `)
      .eq('user_id', user?.id);

    if (!error) setFavorites(data || []);
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
      <View style={{
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
          Favorites ({favorites.length})
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={{ color: '#888', marginTop: 16 }}>No favorites yet</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={{ marginTop: 20 }}>
            <Text style={{ color: '#007AFF' }}>Browse products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.product_id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.product.id } })}
              style={{
                flexDirection: 'row',
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#f9f9f9',
                borderRadius: 12,
                alignItems: 'center',
              }}>
              <Image
                source={{ uri: item.product.image_main || 'https://via.placeholder.com/60' }}
                style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>{item.product.name}</Text>
                <Text style={{ color: '#666' }}>{item.product.brand?.name || 'Unknown brand'}</Text>
                {item.product.price && (
                  <Text style={{ color: '#888' }}>MAD {item.product.price.toFixed(2)}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}