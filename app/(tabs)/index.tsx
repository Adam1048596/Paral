import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SearchBar } from '../../components/SearchBar';
import { supabase } from '../../lib/supabase';
import { typography } from '../../theme/typography';

type FeaturedProduct = {
  id: number;
  name: string;
  price: number;
  image_main: string | null;
  brand: { name: string } | null;
};

export default function HomeScreen() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const featuredRef = useRef<FlatList>(null);

  const fetchFeatured = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('featured_products')
      .select(`
        product:products (
          id,
          name,
          price,
          image_main,
          brand:brands(name)
        )
      `)
      .eq('featured_location', 'homepage')
      .order('position', { ascending: true });

    if (error) {
      console.error('Featured error:', error);
    } else {
      const feats = (data || []).map((f) => f.product).filter(Boolean);
      setFeaturedProducts(feats as FeaturedProduct[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeatured();
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
        }
      >
        {/* Search bar */}
        <SearchBar
          onSearch={(query) => router.push(`/search-results?query=${encodeURIComponent(query)}`)}
          onProductPress={(id) => router.push(`/product/${id}`)}
        />

        {/* Featured Products */}
        <Text style={typography.title}>Your Next Favorite</Text>
        <FlatList
          ref={featuredRef}
          data={featuredProducts}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (width - 30));
            setActiveFeaturedIndex(index);
          }}
          renderItem={({ item }) => <FeaturedProductCard product={item} />}
        />
        {featuredProducts.length > 1 && (
          <View style={styles.dotsRow}>
            {featuredProducts.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  { backgroundColor: idx === activeFeaturedIndex ? '#1c7245' : '#D1D5DB' },
                ]}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Featured Product Card ──────────────────────────────
function FeaturedProductCard({ product }: { product: FeaturedProduct }) {
  return (
    <TouchableOpacity
      style={styles.featuredCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      {/* Gradient background */}
      <LinearGradient
        colors={['#f7f7f7', '#ebebeb']}      // dark green gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Left – text */}
        <View style={styles.featuredCardContent}>
          <Text style={styles.featuredCardBrand}>{product.brand?.name || ''}</Text>
          <Text style={styles.featuredCardName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.featuredCardPrice}>
            {product.price?.toFixed(2) || '0.00'} MAD
          </Text>
          <TouchableOpacity
            style={styles.featuredCardButton}
            onPress={() => router.push(`/product/${product.id}`)}
          >
            <Text style={styles.featuredCardButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>

        {/* Right – image */}
        <View style={styles.featuredCardImageContainer}>
          <Image
            source={{ uri: product.image_main || 'https://via.placeholder.com/300' }}
            style={styles.featuredCardImage}
            resizeMode="cover"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────
const { width } = require('react-native').Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e3e3e3' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingTop: 50, paddingBottom: 100 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  featuredCard: {
    flexDirection: 'row',
    width: width - 30,
    height: 300,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 50,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  gradientBackground: {
    flex: 1,
    flexDirection: 'row',
  },
  featuredCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  featuredCardBrand: {
    fontSize: 13,
    color: '#606060',
    fontWeight: '600',
    marginBottom: 8,
  },
  featuredCardName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  featuredCardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  featuredCardButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  featuredCardButtonText: {
    color: '#1c7245',
    fontWeight: '600',
    fontSize: 14,
  },
  featuredCardImageContainer: {
    width: '45%',
    height: '100%',
  },
  featuredCardImage: {
    width: '100%',
    height: '100%',
  },
});
