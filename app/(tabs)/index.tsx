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
const HORIZONTAL_CARD_WIDTH = 150;

// ── Types ──────────────────────────────────────────────
type Product = {
  id: string;
  name: string;
  price: number;
  image_main: string | null;
  brand: { name: string; id: number } | null;
  department: { name_en: string; id: string } | null;   // id is UUID
};

type Department = { id: string; name_en: string; slug: string };
type Category = { id: string; name_en: string; slug: string; department_id: string | null };
type Brand = { id: number; name: string };

const OFFERS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600', title: 'Summer Glow Sale', subtitle: 'Up to 30% off' },
  { id: '2', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600', title: 'New Vitamin C', subtitle: 'Brighten your skin' },
  { id: '3', image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600', title: 'Free Shipping', subtitle: 'On orders above 200 MAD' },
];

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);   // UUID or null

  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  useEffect(() => {
    if (OFFERS.length <= 1) return;
    const timer = setInterval(() => {
      setActiveOfferIndex((prev) => {
        const next = (prev + 1) % OFFERS.length;
        carouselRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, deptRes, catRes, brandRes] = await Promise.all([
        supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            image_main,
            brand:brands(id, name),
            department:departments(id, name_en)
          `)
          .limit(10),

        supabase.from('departments').select('id, name_en, slug'),

        supabase
          .from('categories')
          .select('id, name_en, slug, department_id')
          .limit(10),

        supabase.from('brands').select('id, name').limit(30),
      ]);

      console.log('Products:', prodRes);
      console.log('Departments:', deptRes);
      console.log('Categories:', catRes);
      console.log('Brands:', brandRes);
      console.log('RENDER departments:', departments.length);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

// fetch departments
useEffect(() => { async function loadDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name_en, slug');

    if (data) {
      console.log('Standalone departments fetch:', data.length);
      setDepartments(data);
    } else {
      console.error('Dept fetch error:', error);
    }
  }
  loadDepartments();
}, []);

// Simple standalone fetch for categories
useEffect(() => {
  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name_en, slug, department_id')
      .limit(50);

    if (data) {
      console.log('Standalone categories fetch:', data.length);
      setCategories(data);
    } else {
      console.error('Categories fetch error:', error);
    }
  }
  loadCategories();
}, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  // Filter based on selected department
  const filteredProducts = selectedDeptId
    ? products.filter(p => p.department?.id === selectedDeptId)
    : products;

  const filteredCategories = selectedDeptId
    ? categories.filter(c => c.department_id === selectedDeptId)
    : categories;

  const filteredBrands = selectedDeptId
    ? brands.filter(b => filteredProducts.some(p => p.brand?.id === b.id))
    : brands;

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


        {/* 🎠 Offers */}
        <View style={styles.sectionContainer}>
          <FlatList
            ref={carouselRef}
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
          {OFFERS.length > 1 && (
            <View style={styles.dotsRow}>
              {OFFERS.map((_, idx) => (
                <View key={idx} style={[styles.dot, { backgroundColor: idx === activeOfferIndex ? '#1c7245' : '#D1D5DB' }]} />
              ))}
            </View>
          )}
        </View>

        {/* 🏷️ Departments (selectable) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <TouchableOpacity
            style={[styles.departmentChip, !selectedDeptId && styles.activeDepartmentChip]}
            onPress={() => setSelectedDeptId(null)}>
            <Text style={[styles.departmentChipText, !selectedDeptId && styles.activeDepartmentChipText]}>All</Text>
          </TouchableOpacity>
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept.id}
              style={[styles.departmentChip, selectedDeptId === dept.id && styles.activeDepartmentChip]}
              onPress={() => setSelectedDeptId(dept.id === selectedDeptId ? null : dept.id)}>
              <Text style={[styles.departmentChipText, selectedDeptId === dept.id && styles.activeDepartmentChipText]}>
                {dept.name_en}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ⭐ Categories (filtered by department) */}
        <SectionHeader title="Categories" onSeeAll={() => router.push('/categories')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {filteredCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => router.push(`/search-results?category=${cat.slug}`)}>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>🧴</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name_en}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 🔥 Featured Products (filtered) */}
        <SectionHeader title="Featured Products" onSeeAll={() => router.push(`/search-results?department=${selectedDeptId || ''}`)} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {filteredProducts.slice(0, 6).map((item) => (
            <ProductCardHorizontal key={item.id} product={item} />
          ))}
        </ScrollView>

        {/* 🧴 Department‑specific product row (only if a department is selected) */}
        {selectedDeptId && (
          <>
            <SectionHeader
              title={departments.find(d => d.id === selectedDeptId)?.name_en || ''}
              onSeeAll={() => router.push(`/search-results?department=${selectedDeptId}`)}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {filteredProducts.map((item) => (
                <ProductCardHorizontal key={item.id} product={item} />
              ))}
            </ScrollView>
          </>
        )}

        {/* 🏷️ Featured Brands (filtered) */}
        <SectionHeader title="Featured Brands" onSeeAll={() => router.push('/brands')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {filteredBrands.slice(0, 8).map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={styles.brandCircle}
              onPress={() => router.push(`/search-results?brand=${brand.id}`)}>
              <View style={styles.brandCircleInner}>
                <Text style={styles.brandInitial}>{brand.name.charAt(0)}</Text>
              </View>
              <Text style={styles.brandName}>{brand.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ✨ Products from first two filtered brands */}
        {filteredBrands.slice(0, 2).map((brand) => {
          const brandProducts = filteredProducts.filter(p => p.brand?.id === brand.id);
          if (brandProducts.length === 0) return null;
          return (
            <View key={brand.id}>
              <SectionHeader
                title={`Products From ${brand.name}`}
                onSeeAll={() => router.push(`/search-results?brand=${brand.id}`)}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {brandProducts.map((item) => (
                  <ProductCardHorizontal key={item.id} product={item} />
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Reusable Components (unchanged) ─────────────────────
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ProductCardHorizontal({ product }: { product: Product }) {
  return (
    <TouchableOpacity
      style={styles.horizontalCard}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product.id}`)}>
      <Image
        source={{ uri: product.image_main || 'https://via.placeholder.com/150' }}
        style={styles.horizontalCardImage}
        resizeMode="cover"
      />
      <Text style={styles.horizontalCardName} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.horizontalCardBrand}>{product.brand?.name || ''}</Text>
      <Text style={styles.horizontalCardPrice}>MAD {product.price?.toFixed(2) || '0.00'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e3e3e3' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingTop: 50, paddingBottom: 100 },
  sectionContainer: { marginTop: 20, marginBottom: 10 },
  offerCard: {
    width: width - 30, height: 200, borderRadius: 20,
    overflow: 'hidden', marginHorizontal: 16, backgroundColor: '#F0F0F0',
  },
  offerImage: { width: '100%', height: '100%' },
  offerOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 16, paddingVertical: 12,
  },
  offerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  offerSubtitle: { fontSize: 14, fontWeight: '400', color: '#F0F0F0' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginTop: 24, marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0F1419' },
  seeAll: { fontSize: 14, color: '#1c7245', fontWeight: '600' },
  horizontalScroll: { paddingLeft: 16, paddingRight: 8 },
  departmentChip: {
    backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10,
    marginRight: 10, borderWidth: 1, borderColor: '#E1E8ED',
  },
  activeDepartmentChip: {
    backgroundColor: '#1c7245', borderColor: '#1c7245',
  },
  departmentChipText: { fontSize: 14, fontWeight: '500', color: '#0F1419' },
  activeDepartmentChipText: { color: '#FFFFFF' },
  categoryCard: {
    width: 100, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1,
    borderColor: '#F0F0F0', paddingVertical: 16, alignItems: 'center', marginRight: 12,
  },
  categoryIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0FDF4',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  categoryEmoji: { fontSize: 22 },
  categoryName: { fontSize: 12, color: '#0F1419', textAlign: 'center' },
  brandCircle: { alignItems: 'center', marginRight: 16, width: 80 },
  brandCircleInner: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#1c7245',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  brandInitial: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  brandName: { fontSize: 12, color: '#0F1419', textAlign: 'center' },
  horizontalCard: {
    width: 150, backgroundColor: '#FFFFFF', borderRadius: 16, marginRight: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
  },
  horizontalCardImage: { width: '100%', height: 130, backgroundColor: '#F7F9F9' },
  horizontalCardName: { fontSize: 13, fontWeight: '600', color: '#0F1419', marginTop: 8, marginHorizontal: 8 },
  horizontalCardBrand: { fontSize: 11, color: '#536471', marginTop: 2, marginHorizontal: 8 },
  horizontalCardPrice: { fontSize: 13, fontWeight: '700', color: '#0F1419', marginTop: 4, marginBottom: 10, marginHorizontal: 8 },
});