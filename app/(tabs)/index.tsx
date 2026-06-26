import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

// ── Updated type with joined relations ──────────────────────────
type Product = {
  id: string;
  name: string;
  brand: { name: string } | null;
  department: { name: string } | null;   // normalized
  category: { name: string } | null;     // normalized
  area: { name: string } | null;         // normalized
  texture: { name: string } | null;      // normalized
  capacity: string;
  image_main: string | null;
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        capacity,
        image_main,
        brand:brands(name),
        department:departments(name),
        category:categories(name),
        area:areas(name),
        texture:textures(name)
      `)
      .limit(20);

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#73b504" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#73b504"
            colors={['#73b504']}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: '/product/[id]',
                params: { id: item.id },
              })
            }>
            <View style={styles.imageContainer}>
              {item.image_main ? (
                <Image
                  source={{ uri: item.image_main }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.noImage}>
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.brandName}>
                {item.brand?.name || 'Unknown brand'}
              </Text>
              <Text style={styles.details}>
                {item.category?.name || ''}
                {item.capacity ? ` · ${item.capacity}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 12 },
  columnWrapper: { justifyContent: 'space-between' },
  productCard: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: { aspectRatio: 1, backgroundColor: '#F7F9F9' },
  image: { width: '100%', height: '100%' },
  noImage: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0' },
  noImageText: { color: '#B0B8C1', fontSize: 14 },
  productInfo: { padding: 12 },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F1419',
    marginBottom: 4,
    lineHeight: 18,
  },
  brandName: { fontSize: 12, color: '#536471', marginBottom: 2 },
  details: { fontSize: 11, color: '#B0B8C1', marginTop: 2 },
  emptyText: { fontSize: 16, color: '#536471' },
});