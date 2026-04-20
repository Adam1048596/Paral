import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import debounce from 'lodash.debounce'; // install with: npx expo install lodash.debounce
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type Product = {
  id: string;
  name: string;
  brand: { name: string } | null;
  category: string;
  price?: number;
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    skinType: '',
    concern: '',
    minPrice: '',
    maxPrice: '',
  });
  const [sortBy, setSortBy] = useState('popularity'); // popularity, price_asc, price_desc

  // Fetch products based on search, filters, and sort
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        category,
        brand:brands(name)
      `);

    // Search by name
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.skinType) {
      // This would require a join with product_skin_types
      // For simplicity, we'll skip in this MVP; you can add later
    }

    // Apply sorting
    if (sortBy === 'price_asc') {
      // query = query.order('price', { ascending: true });
    } else if (sortBy === 'price_desc') {
      // query = query.order('price', { ascending: false });
    }

    const { data, error } = await query.limit(50);
    if (error) console.error(error);
    else setProducts(data || []);
    setLoading(false);
  }, [searchQuery, filters, sortBy]);

  // Debounced search to avoid excessive API calls
  const debouncedFetch = useCallback(debounce(fetchProducts, 500), [fetchProducts]);

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [searchQuery, filters, sortBy]);

  const clearFilters = () => {
    setFilters({ category: '', skinType: '', concern: '', minPrice: '', maxPrice: '' });
    setSortBy('popularity');
    setShowFilterModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Search Bar */}
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 12 }}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16 }}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowFilterModal(true)} style={{ marginLeft: 12 }}>
          <Ionicons name="options-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Sort Row */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: '#666' }}>{products.length} results</Text>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ marginRight: 4 }}>Sort by: {sortBy}</Text>
          <Ionicons name="chevron-down" size={16} />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {loading && products.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
              style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}
            >
              <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
              <Text style={{ color: '#666' }}>{item.brand?.name || 'Unknown brand'}</Text>
              <Text style={{ color: '#888' }}>{item.category}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
              No products found
            </Text>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {/* Category Filter */}
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                {['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'mask'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFilters({ ...filters, category: cat })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: filters.category === cat ? '#007AFF' : '#f0f0f0',
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: filters.category === cat ? '#fff' : '#333' }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price Range */}
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Price Range (MAD)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TextInput
                  placeholder="Min"
                  value={filters.minPrice}
                  onChangeText={(text) => setFilters({ ...filters, minPrice: text })}
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, flex: 1, marginRight: 8 }}
                />
                <Text>-</Text>
                <TextInput
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChangeText={(text) => setFilters({ ...filters, maxPrice: text })}
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, flex: 1, marginLeft: 8 }}
                />
              </View>

              {/* Sort By */}
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Sort By</Text>
              <View style={{ marginBottom: 20 }}>
                {[
                  { label: 'Popularity', value: 'popularity' },
                  { label: 'Price: Low to High', value: 'price_asc' },
                  { label: 'Price: High to Low', value: 'price_desc' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSortBy(option.value)}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: sortBy === option.value ? '#007AFF' : '#ccc',
                      marginRight: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      {sortBy === option.value && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' }} />}
                    </View>
                    <Text>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity
                onPress={clearFilters}
                style={{ flex: 1, padding: 16, alignItems: 'center', marginRight: 8, backgroundColor: '#f0f0f0', borderRadius: 8 }}
              >
                <Text>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={{ flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#007AFF', borderRadius: 8 }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}