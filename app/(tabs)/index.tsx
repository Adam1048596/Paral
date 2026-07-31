import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SearchBar } from '../../components/SearchBar';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

// ── Types ──────────────────────────────────────────────
type Product = {
  id: string;
  name: string;
  brand: { name: string } | null;
  department: { name: string } | null;
  category: { name: string } | null;
  area: { name: string } | null;
  texture: { name: string } | null;
  capacity: string;
  image_main: string | null;
};

// ── Offer data (static for now – replace with Supabase) ─
const OFFERS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600',
    title: 'Summer Glow Sale',
    subtitle: 'Up to 30% off',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600',
    title: 'New Vitamin C',
    subtitle: 'Brighten your skin',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600',
    title: 'Free Shipping',
    subtitle: 'On orders above 200 MAD',
  },
];

// ── Main Screen ────────────────────────────────────────
export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carousel state
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto‑scroll
  useEffect(() => {
    if (OFFERS.length <= 1) return;
    const timer = setInterval(() => {
      setActiveOfferIndex((prev) => {
        const next = (prev + 1) % OFFERS.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, capacity, image_main,
        brand:brands(name),
        department:departments(name),
        category:categories(name),
        area:areas(name),
        texture:textures(name)
      `)
      .limit(30);

    if (!error && data) setProducts(data);
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1c7245" />
        }>
        {/* Search bar */}
        <SearchBar
          onSearch={(query) => router.push(`/search-results?query=${encodeURIComponent(query)}`)}
          onProductPress={(id) => router.push(`/product/${id}`)}
        />

        {/* ── OFFERS CAROUSEL ──────────────────────────── */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={OFFERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveOfferIndex(index);
            }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.offerCard} activeOpacity={0.9}>
                <Image source={{ uri: item.image }} style={styles.offerImage} resizeMode="cover" />
                <View style={styles.offerOverlay}>
                  <Text style={styles.offerTitle}>{item.title}</Text>
                  <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          {/* Dot indicators */}
          {OFFERS.length > 1 && (
            <View style={styles.dotsRow}>
              {OFFERS.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    { backgroundColor: idx === activeOfferIndex ? '#1c7245' : '#D1D5DB' },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── PRODUCT GRID ──────────────────────────────── */}
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
                <Text style={styles.productDetails}>
                  {item.category?.name || ''}{item.capacity ? ` · ${item.capacity}` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f3f3' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingTop: 50, paddingBottom: 100 },

  // Carousel
  carouselContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  offerCard: {
    width: width - 32,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    backgroundColor: '#F0F0F0',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  offerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  offerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#F0F0F0',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // Product grid
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
  productDetails: { fontSize: 11, color: '#B0B8C1' },
});