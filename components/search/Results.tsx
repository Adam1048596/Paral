import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

type Props = {
  products: any[];
  loading: boolean;
  onProductPress: (productId: string) => void;
};

export const SearchResults  = React.memo(({ products, loading, onProductPress }: Props) => {
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#73b504" />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No products found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      numColumns={2}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={styles.columnWrapper}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onProductPress(item.id)}
          activeOpacity={0.9}>
          <Image
            source={{ uri: item.image_main || 'https://via.placeholder.com/150' }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.brand}>{item.brand?.name || ''}</Text>
            <Text style={styles.price}>MAD {item.price?.toFixed(2) || '0.00'}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
});

const styles = StyleSheet.create({
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 12 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: '100%', aspectRatio: 1, backgroundColor: '#F7F9F9' },
  info: { padding: 12 },
  name: { fontSize: 14, fontWeight: '600', color: '#0F1419', marginBottom: 4 },
  brand: { fontSize: 12, color: '#536471', marginBottom: 2 },
  price: { fontSize: 14, fontWeight: '700', color: '#0F1419' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#8E8E93' },
});