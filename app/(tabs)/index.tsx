import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

type Product = {
  id: string;
  name: string;
  brand: { name: string } | null;
  category: string;
  capacity: string;
  // Add image_url later when you have images
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        category,
        capacity,
        brand:brands(name)
      `)
      .limit(20);
    
    if (error) console.error(error);
    else setProducts(data || []);
    setLoading(false);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
          style={{ padding: 15, borderBottomWidth: 1, borderColor: '#eee' }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
          <Text>{item.brand?.name || 'Unknown brand'}</Text>
          <Text style={{ color: '#666' }}>{item.category} • {item.capacity}</Text>
        </TouchableOpacity>
      )}
    />
  );
}