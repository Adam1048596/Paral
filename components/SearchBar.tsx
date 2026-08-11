import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase'; // adjust path as needed

type Props = {
  onSearch?: (query: string) => void;
  onProductPress?: (productId: string) => void;
};

type Department = {
  id: number;
  name_en: string;
  slug: string;
};

type Category = {
  id: number;
  name_en: string;
  slug: string;
};

const STATUS_BAR_H = StatusBar.currentHeight ?? 50;

// ---- Static icon mapping (can be extended with new departments) ----
const ICON_MAP: Record<string, any> = {
  skincare: require('../assets/icons/skincare.png'),
  supplements: require('../assets/icons/supplements.png'),
  accessories: require('../assets/icons/accessories.png'),
  makeup: require('../assets/icons/skincare.png'),   // fallback
  hygiene: require('../assets/icons/skincare.png'),
  'oral-dental': require('../assets/icons/skincare.png'),
  'babies-moms': require('../assets/icons/skincare.png'),
};

export const SearchBar = ({ onSearch, onProductPress }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch departments on first open
  useEffect(() => {
    if (expanded && departments.length === 0) {
      fetchDepartments();
    }
  }, [expanded]);

  const fetchDepartments = async () => {
    setLoading(true);
    const { data } = await supabase.from('departments').select('id, name_en, slug');
    setDepartments(data || []);
    if (data?.length) {
      setActiveTab(data[0].name_en);   // default to first department
      fetchCategories(data[0].id);
    }
    setLoading(false);
  };

  const fetchCategories = async (departmentId: number) => {
    const { data } = await supabase
      .from('categories')
      .select('id, name_en, slug')
      .eq('department_id', departmentId)
      .limit(10);
    setCategories(data || []);
  };

  const handleTabPress = (dept: Department) => {
    setActiveTab(dept.name_en);
    fetchCategories(dept.id);
  };

  const openSearch = () => setExpanded(true);

  const closeSearch = () => {
    Keyboard.dismiss();
    setExpanded(false);
    setSearchText('');
  };

  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    if (trimmed && onSearch) {
      onSearch(trimmed);
    }
    closeSearch();
  };

  // Collapsed pill
  if (!expanded) {
    return (
      <TouchableOpacity style={styles.collapsedPill} onPress={openSearch}>
        <View style={styles.collapsedInner}>
          <Ionicons name="search" size={16} color="#292d32" />
          <View style={styles.collapsedText}>
            <Text style={styles.placeholder}>Start your Search</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Expanded panel
  return (
    <View style={styles.overlay}>
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />

      {/* Tabs row – dynamically from departments */}
      <View style={styles.tabsRowOuter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {loading && departments.length === 0 ? (
            <ActivityIndicator size="small" color="#1c7245" style={{ marginRight: 20 }} />
          ) : (
            departments.map((dept) => {
              const isActive = dept.name_en === activeTab;
              const icon = ICON_MAP[dept.slug] || ICON_MAP['skincare'];
              return (
                <TouchableOpacity
                  key={dept.id}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => handleTabPress(dept)}
                >
                  {isActive && (
                    <Image source={icon} style={styles.tabIcon} resizeMode="contain" />
                  )}
                  <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                    {dept.name_en}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={closeSearch}>
          <Ionicons name="close" size={24} color="#292d32" />
        </TouchableOpacity>
      </View>

      {/* White panel */}
      <View style={styles.expandedPanel}>
        {/* Search input */}
        <View style={styles.inputRow}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.input}
            placeholder="Search products, brands, or categories..."
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus={false}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable suggestions – categories of active department */}
        <ScrollView
          style={styles.suggestionsScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Suggested Searches</Text>
          {categories.slice(0, 5).map((cat, idx) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.suggestionItem}
              onPress={() => {
                if (onSearch) onSearch(cat.name_en);
                closeSearch();
              }}
            >
              <Ionicons name="search-outline" size={18} color="#8E8E93" />
              <Text style={styles.suggestionText}>{cat.name_en}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.chipRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.chip}
                onPress={() => {
                  if (onSearch) onSearch(cat.name_en);
                  closeSearch();
                }}
              >
                <Ionicons name="leaf-outline" size={16} color="#292d32" style={{ marginRight: 6 }} />
                <Text style={styles.chipText}>{cat.name_en}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  // Collapsed pill
  collapsedPill: {
    backgroundColor: '#fcfbfc',
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 90,
    marginHorizontal: 25,
    marginTop: 0,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fcfcfc',
  },
  collapsedInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedText: {
    marginLeft: 14,
    flex: 1,
  },
  placeholder: {
    fontSize: 14,
    fontWeight: '200',
    color: '#292d32',
  },

  // Expanded overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    paddingTop: STATUS_BAR_H + 20,
  },
  tabsRowOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F2F4F7',
  },
  activeTab: {
    backgroundColor: '#1c7245',
  },
  tabText: {
    fontSize: 11,
    color: '#292d32',
  },
  activeTabText: {
    color: '#fff',
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  expandedPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 24,
    padding: 20,
    elevation: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F9',
    borderRadius: 30,
    height: 50,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0F1419',
  },
  suggestionsScroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F1419',
    marginBottom: 12,
    marginTop: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  suggestionText: {
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