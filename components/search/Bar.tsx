import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onPress: () => void;
};

export const SearchBar = React.memo(({ onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}>
      <View style={styles.inner}>
        <Ionicons name="search" size={22} color="#222" />
        <View style={styles.textContainer}>
          <Text style={styles.placeholder}>Search products</Text>
          <Text style={styles.subtitle}>Skincare • Makeup • Haircare</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    marginHorizontal: 20,
    marginTop: 16,
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  inner: { flexDirection: 'row', alignItems: 'center', },
  textContainer: { marginLeft: 14, flex: 1, },
  placeholder: { fontSize: 17, fontWeight: '600', color: '#222', },
  subtitle: { fontSize: 13, color: '#666', marginTop: 2, },
});