import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
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

type Props = {
  onProductPress?: (productId: string) => void;
};

const STATUS_BAR_H = StatusBar.currentHeight ?? 50;

// ---- Tab content data structure ----
const TAB_DATA: Record<string, { suggested: string[]; categories: string[] }> = {
  Skincare: {
    suggested: ['Dry Skin', 'Combination Skin', 'Oily Skin', 'Sensitive Skin'],
    categories: ['Serum', 'Moisturizer', 'Cleanser', 'Sunscreen', 'Toner'],
  },
  Supplements: {
    suggested: ['Vitamin C', 'Collagen', 'Omega‑3', 'Multivitamin', 'Probiotics'],
    categories: ['Powder', 'Capsules', 'Gummies', 'Liquids', 'Teas'],
  },
  Accessories: {
    suggested: ['Facial Roller', 'Spatula', 'Headband', 'Brush', 'Cotton Pads'],
    categories: ['Tools', 'Brushes', 'Headbands', 'Cotton', 'Bottles'],
  },
};

// ---- Static icon mapping (fixed for Metro) ----
const ICON_MAP: Record<string, any> = {
  skincare: require('../assets/icons/skincare.png'),
  supplements: require('../assets/icons/supplements.png'),
  accessories: require('../assets/icons/accessories.png'),
};

export const SearchBar = ({ onProductPress }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Skincare');

  const openSearch = () => setExpanded(true);

  const closeSearch = () => {
    Keyboard.dismiss();
    setExpanded(false);
    setSearchText('');
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

  // Get the current tab data
  const currentTab = TAB_DATA[activeTab];

  // Expanded panel
  return (
    <View style={styles.overlay}>
      {/* Blur background */}
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />

      {/* Tabs row */}
      <View style={styles.tabsRowOuter}>
        <View style={styles.tabsRow}>
          {Object.keys(TAB_DATA).map((tabName) => {
            const isActive = tabName === activeTab;
            return (
              <TouchableOpacity
                key={tabName}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tabName)}>
                {isActive && (
                  <Image
                    source={ICON_MAP[tabName.toLowerCase()]}
                    style={styles.tabIcon}
                    resizeMode="contain"
                  />
                )}
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tabName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable suggestions – dynamic per active tab */}
        <ScrollView
          style={styles.suggestionsScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Suggested Searches</Text>
          {currentTab.suggested.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionItem}
              onPress={() => setSearchText(item)}>
              <Ionicons name="search-outline" size={18} color="#8E8E93" />
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.chipRow}>
            {currentTab.categories.map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => setSearchText(cat)}>
                <Ionicons
                  name="leaf-outline"
                  size={16}
                  color="#292d32"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.chipText}>{cat}</Text>
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