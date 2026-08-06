import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Dimensions, FlatList, Image,
  RefreshControl, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { SearchBar } from '../../components/SearchBar';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

// ── Updated type – exactly what the new schema returns ──
type Product = {
  id: string;
  name: string;
  price: number;
  image_main: string | null;
  brand: { name: string } | null;
  department: { name_en: string } | null;
};

const OFFERS = [ /* … your offer data stays the same … */ ];

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carousel state (unchanged)
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  useEffect(() => { /* … auto‑scroll unchanged … */ }, []);

  // Fetch products – only columns that exist now
const fetchProducts = useCallback(async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`id, name, price, image_main, brand:brands(name), department:departments(name_en)`)
    .limit(100);

  console.log('data:', data, 'error:', error);   // <-- add this line

  if (!error && data) setProducts(data);
  else console.error('Error fetching products:', error);
  setLoading(false);
  setRefreshing(false);
}, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1c7245" />
        }>
        <SearchBar
          onSearch={(query) => router.push(`/search-results?query=${encodeURIComponent(query)}`)}
          onProductPress={(id) => router.push(`/product/${id}`)}
        />

        {/* Carousel unchanged … */}

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {products.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/product/${item.id}`)}>
              <View style={styles.imageContainer}>
                {item.image_main ? (
                  <Image source={{ uri: item.image_main }} style={styles.image} resizeMode="cover" />
                ) : (
                  <View style={styles.noImage}>
                    <Text style={styles.noImageText}>No Image</Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productBrand}>{item.brand?.name || 'Unknown brand'}</Text>
                <Text style={styles.productDepartment}>{item.department?.name_en || ''}</Text>
                <Text style={styles.productPrice}>MAD {item.price?.toFixed(2) || '0.00'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles (unchanged from your current file) ─────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f3f3' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingTop: 50, paddingBottom: 100 },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: { aspectRatio: 1, backgroundColor: '#F7F9F9' },
  image: { width: '100%', height: '100%' },
  noImage: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0' },
  noImageText: { color: '#B0B8C1', fontSize: 14 },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: '#0F1419', marginBottom: 4, lineHeight: 18 },
  productBrand: { fontSize: 12, color: '#536471', marginBottom: 2 },
  productDepartment: { fontSize: 11, color: '#1c7245', marginBottom: 2 },
  productPrice: { fontSize: 13, fontWeight: '700', color: '#0F1419' },
  // … all your other styles (carousel, etc.) should be copied from your existing file
});