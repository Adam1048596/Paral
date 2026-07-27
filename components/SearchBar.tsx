import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Keyboard,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

type Props = {
  onProductPress?: (productId: string) => void;   // optional, for future use
};

export const SearchBar = ({ onProductPress }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(-20)).current;

  // Open the search
  const openSearch = () => {
    setExpanded(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(contentTranslateY, {
        toValue: 0,
        damping: 20,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close the search
  const closeSearch = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: -20,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setExpanded(false);
      setSearchText('');
    });
  };

  // ── Collapsed pill ──────────────────────────────────────
  if (!expanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedPill}
        activeOpacity={0.95}
        onPress={openSearch}>
        <View style={styles.collapsedInner}>
          <Ionicons name="search" size={22} color="#222" />
          <View style={styles.collapsedText}>
            <Text style={styles.placeholder}>Start your Search</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Expanded overlay ────────────────────────────────────
  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      {/* Blur background */}
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />

      {/* Slide‑in content */}
      <Animated.View
        style={[
          styles.expandedContainer,
          { transform: [{ translateY: contentTranslateY }] },
        ]}>
        {/* Header: category tabs + close */}
        <View style={styles.header}>
          <View style={styles.tabsRow}>
            {['Skincare', 'Supplements', 'Accessories'].map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.tab, idx === 0 && styles.activeTab]}>
                <Text style={[styles.tabText, idx === 0 && styles.activeTabText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={closeSearch}>
            <Ionicons name="close" size={24} color="#222" />
          </TouchableOpacity>
        </View>

        {/* White rounded container */}
        <View style={styles.whiteContainer}>
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
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          {/* Scrollable suggestions */}
          <ScrollView
            style={styles.suggestionsScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Suggested searches */}
            <Text style={styles.sectionTitle}>Suggested Searches</Text>
            {['Dry Skin', 'Combination Skin', 'Oily Skin', 'Sensitive Skin'].map(
              (item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionItem}
                  onPress={() => setSearchText(item)}>
                  <Ionicons name="search-outline" size={18} color="#8E8E93" />
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ),
            )}

            {/* Popular categories */}
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <View style={styles.chipRow}>
              {['Serum', 'Moisturizer', 'Cleanser', 'Sunscreen', 'Toner'].map(
                (cat, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => setSearchText(cat)}>
                    <Ionicons name="leaf-outline" size={16} color="#222" style={{ marginRight: 6 }} />
                    <Text style={styles.chipText}>{cat}</Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // ── Collapsed Pill ─────────────────────────────────────
  collapsedPill: {
    backgroundColor: '#fcfbfc',
    borderRadius: 999,            
    paddingVertical: 18,
    paddingHorizontal: 90,
    marginHorizontal: 25,
    marginTop: 0,
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
    color: '#222',
  },
  // ── Expanded Overlay ───────────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'flex-start',
    paddingTop: StatusBar.currentHeight || 50,
  },
  expandedContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header with category tabs & close button
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
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
    fontSize: 14,
    color: '#222',
  },
  activeTabText: {
    color: '#fff',
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },

  // White rounded container
  whiteContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },

  // Search input row
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

  // Suggestions
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

  // Popular categories chips
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