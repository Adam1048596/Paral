import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../../lib/supabase'; // ← your existing Supabase client
import { SearchResults } from './Results';

type Props = {
  visible: boolean;
  onClose: () => void;
  onProductPress: (productId: string) => void;
};

export const SearchModal = ({ visible, onClose, onProductPress }: Props) => {
  const [view, setView] = useState<'discover' | 'results'>('discover');
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularCategories, setPopularCategories] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Animations
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (visible) {
      // Prefetch popular categories
      supabase
        .from('categories')
        .select('id, name')
        .limit(6)
        .then(({ data }) => {
          if (data) setPopularCategories(data);
        });
      // Animate in
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalTranslateY, { toValue: 0, damping: 20, stiffness: 120, useNativeDriver: true }),
      ]).start();
    } else {
      overlayOpacity.setValue(0);
      modalTranslateY.setValue(200);
    }
  }, [visible]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    // Save to recent
    setRecentSearches(prev => [query, ...prev.filter(t => t !== query)].slice(0, 5));
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`id, name, image_main, price, brand:brands(name), category:categories(name)`)
        .ilike('name', `%${query}%`)
        .limit(20);
      if (error) throw error;
      setProducts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setView('results');
    }
  };

  const handleCategoryPress = async (category: string) => {
    setQuery(category);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`id, name, image_main, price, brand:brands(name), category:categories(name)`)
        .ilike('name', `%${category}%`)
        .limit(20);
      if (error) throw error;
      setProducts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setView('results');
    }
  };

  const clearSearch = () => {
    setView('discover');
    setQuery('');
    setProducts([]);
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalTranslateY }] }]}>
        {/* Header with close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#222" />
        </TouchableOpacity>

        {/* Search input */}
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, or categories..."
            placeholderTextColor="#8E8E93"
            value={query}
            onChangeText={setQuery}
            autoFocus={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            onFocus={() => {
              if (view === 'results') clearSearch();
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); clearSearch(); }}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content based on view */}
        {view === 'discover' ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {recentSearches.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearches.map((term, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.recentItem}
                    onPress={() => {
                      setQuery(term);
                      handleSearch();
                    }}>
                    <Ionicons name="time-outline" size={18} color="#8E8E93" />
                    <Text style={styles.recentText}>{term}</Text>
                    <TouchableOpacity
                      onPress={() => setRecentSearches(prev => prev.filter(t => t !== term))}>
                      <Ionicons name="close" size={18} color="#8E8E93" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <View style={styles.chipRow}>
              {popularCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.chip}
                  onPress={() => handleCategoryPress(cat.name)}>
                  <Ionicons name="leaf-outline" size={16} color="#222" style={{ marginRight: 6 }} />
                  <Text style={styles.chipText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <SearchResults
            products={products}
            loading={loading}
            onProductPress={(id) => {
              onClose();
              onProductPress(id);
            }}
          />
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    height: 50,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0F1419',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F1419',
    marginBottom: 12,
    marginTop: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  recentText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0F1419',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  chipText: {
    fontSize: 14,
    color: '#0F1419',
  },
});