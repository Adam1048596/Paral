import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Dimensions, FlatList, Image, Keyboard, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;   // two columns with 12px padding on each side

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

type Category = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
};

type Brand = {
  id: string;
  name: string;
};

// ── Main Screen ────────────────────────────────────────
export default function HomeScreen() {
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search overlay
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<TextInput>(null);

  // Animation values for search overlay
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(1.02)).current;

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    const [prodRes, deptRes, catRes, brandRes] = await Promise.all([
      supabase.from('products').select(`
        id, name, capacity, image_main,
        brand:brands(name),
        department:departments(name),
        category:categories(name),
        area:areas(name),
        texture:textures(name)
      `).limit(30),
      supabase.from('departments').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('brands').select('*'),
    ]);

    if (prodRes.data) setProducts(prodRes.data);
    if (deptRes.data) setDepartments(deptRes.data);
    if (catRes.data) setCategories(catRes.data);
    if (brandRes.data) setBrands(brandRes.data);
  }, []);

  useEffect(() => {
    fetchAllData().finally(() => setLoading(false));
  }, [fetchAllData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  // Open search
  const openSearch = () => {
    setSearchVisible(true);
    // Fade in overlay
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(overlayScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => searchInputRef.current?.focus(), 200);
  };

  // Close search
  const closeSearch = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayScale, {
        toValue: 1.02,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSearchVisible(false);
      setSearchText('');
      setSearchResults([]);
    });
  };

  // Live search
  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    const { data } = await supabase
      .from('products')
      .select(`
        id, name, capacity, image_main,
        brand:brands(name),
        department:departments(name),
        category:categories(name),
        area:areas(name),
        texture:textures(name)
      `)
      .ilike('name', `%${text}%`)
      .limit(10);
    setSearchResults(data || []);
    // Add to recent searches if not already present
    if (text.trim() && !recentSearches.includes(text.trim())) {
      setRecentSearches(prev => [text.trim(), ...prev.slice(0, 4)]);
    }
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
      {/* ==================== HOME CONTENT ==================== */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#73b504" />
        }>
        {/* Sticky header is just part of scroll for now */}
        <Text style={styles.greeting}>Good morning, beautiful ✨</Text>
        <Text style={styles.subtitle}>Discover your perfect routine</Text>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={openSearch} activeOpacity={0.9}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <Text style={styles.searchPlaceholder}>Search products, brands, or categories...</Text>
        </TouchableOpacity>

        {/* Departments */}
        <Text style={styles.sectionTitle}>Departments</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {departments.map((d) => (
            <TouchableOpacity key={d.id} style={styles.chip}>
              <Text style={styles.chipText}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Categories */}
        <Text style={styles.sectionTitle}>Featured Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.slice(0, 6).map((c) => (
            <TouchableOpacity key={c.id} style={styles.catCard}>
              <View style={styles.catIcon}>
                <Ionicons name="leaf-outline" size={24} color="#73b504" />
              </View>
              <Text style={styles.catName}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Brands */}
        <Text style={styles.sectionTitle}>Featured Brands</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandScroll}>
          {brands.slice(0, 6).map((b) => (
            <View key={b.id} style={styles.brandCard}>
              <View style={styles.brandLogo}>
                <Ionicons name="ribbon-outline" size={28} color="#73b504" />
              </View>
              <Text style={styles.brandName}>{b.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Recently Added (Product Grid) */}
        <Text style={styles.sectionTitle}>Recently Added</Text>
        <View style={styles.productGrid}>
          {products.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}>
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

      {/* ==================== SEARCH OVERLAY ==================== */}
      {searchVisible && (
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayOpacity, transform: [{ scale: overlayScale }] },
          ]}>
          <BlurView intensity={60} style={StyleSheet.absoluteFill} tint="light" />
          <View style={styles.overlayContent}>
            {/* Search input */}
            <View style={styles.overlaySearchRow}>
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                ref={searchInputRef}
                style={styles.overlayInput}
                placeholder="Search products, brands, or categories..."
                placeholderTextColor="#8E8E93"
                value={searchText}
                onChangeText={handleSearch}
                autoFocus={false}
              />
              <TouchableOpacity onPress={closeSearch}>
                <Ionicons name="close-circle" size={22} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {/* Content based on state */}
            {searchText.length === 0 ? (
              <>
                {/* Popular Categories */}
                <Text style={styles.overlaySectionTitle}>Popular Categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {categories.slice(0, 6).map((c) => (
                    <TouchableOpacity key={c.id} style={styles.chip}>
                      <Text style={styles.chipText}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <>
                    <Text style={styles.overlaySectionTitle}>Recent Searches</Text>
                    <View style={styles.recentRow}>
                      {recentSearches.map((term, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.recentChip}
                          onPress={() => handleSearch(term)}>
                          <Text style={styles.recentChipText}>{term}</Text>
                          <Ionicons
                            name="close"
                            size={16}
                            color="#8E8E93"
                            onPress={() => setRecentSearches(prev => prev.filter(t => t !== term))}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* Suggested Products (empty state for now) */}
                <Text style={styles.overlaySectionTitle}>Suggested Products</Text>
                <View style={styles.emptySearch}>
                  <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptySearchText}>Start typing to discover products.</Text>
                </View>
              </>
            ) : (
              // Live results
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                style={{ marginTop: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => {
                      closeSearch();
                      router.push({ pathname: '/product/[id]', params: { id: item.id } });
                    }}>
                    <Image
                      source={{ uri: item.image_main || 'https://via.placeholder.com/60' }}
                      style={styles.searchResultImage}
                      resizeMode="cover"
                    />
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.searchResultBrand}>{item.brand?.name || 'Unknown brand'}</Text>
                      <Text style={styles.searchResultCat}>{item.category?.name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#B0B8C1" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptySearch}>
                    <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptySearchText}>No products found.</Text>
                  </View>
                }
              />
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },   // space for tab bar

  // Greeting
  greeting: { fontSize: 28, fontWeight: '700', color: '#0F1419', paddingHorizontal: 16, marginTop: 20 },
  subtitle: { fontSize: 16, color: '#536471', paddingHorizontal: 16, marginBottom: 20 },

  // Search bar
  searchBar: {
    marginHorizontal: 16,
    backgroundColor: '#F2F4F7',
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 24,
  },
  searchPlaceholder: { flex: 1, marginLeft: 10, color: '#8E8E93', fontSize: 16 },

  // Sections
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#0F1419', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },

  // Department chips
  chipsScroll: { paddingLeft: 16, marginBottom: 20 },
  chip: {
    backgroundColor: '#F2F4F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  chipText: { fontSize: 14, color: '#0F1419', textTransform: 'capitalize' },

  // Categories
  catScroll: { paddingLeft: 16, marginBottom: 20 },
  catCard: {
    width: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  catIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catName: { fontSize: 12, color: '#0F1419', textAlign: 'center' },

  // Brands
  brandScroll: { paddingLeft: 16, marginBottom: 20 },
  brandCard: {
    width: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  brandLogo: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  brandName: { fontSize: 12, color: '#0F1419', textAlign: 'center' },

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

  // ======== SEARCH OVERLAY ========
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  overlayContent: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  overlaySearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  overlayInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#0F1419' },
  overlaySectionTitle: { fontSize: 18, fontWeight: '600', color: '#0F1419', marginBottom: 12 },

  // Recent searches
  recentRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  recentChipText: { fontSize: 14, color: '#0F1419', marginRight: 6 },

  // Search results
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchResultImage: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F7F9F9', marginRight: 12 },
  searchResultInfo: { flex: 1 },
  searchResultName: { fontSize: 15, fontWeight: '600', color: '#0F1419' },
  searchResultBrand: { fontSize: 13, color: '#536471', marginTop: 2 },
  searchResultCat: { fontSize: 12, color: '#B0B8C1', marginTop: 2 },

  // Empty state
  emptySearch: { alignItems: 'center', marginTop: 40 },
  emptySearchText: { fontSize: 15, color: '#8E8E93', marginTop: 12 },
});