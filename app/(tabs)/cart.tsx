import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useCart } from '../../context/CartContext';

export default function CartScreen() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();

  const total = items.reduce((sum, item) => {
    if (item.is_free) return sum;
    if (item.product?.price) return sum + item.product.price * item.quantity;
    return sum;
  }, 0);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#B0B8C1" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add products to get started
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/')}>
          <Text style={styles.browseButtonText}>Continue shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={{
                uri:
                  item.product?.image_main ||
                  'https://via.placeholder.com/80',
              }}
              style={styles.productImage}
              resizeMode="cover"
            />

            <View style={styles.itemInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.product?.name}
              </Text>

              {item.is_free ? (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              ) : (
                <Text style={styles.productPrice}>
                  MAD {item.product?.price?.toFixed(2) || '0.00'}
                </Text>
              )}

              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Ionicons name="remove" size={18} color="#73b504" />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Ionicons name="add" size={18} color="#73b504" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Bottom Checkout Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>MAD {total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push('/checkout')}
          activeOpacity={0.9}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F1419',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#536471',
    marginTop: 4,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#1c7245',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Main container
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F1419',
  },
  clearText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },

  // Cart items
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F7F9F9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: { fontSize: 15, fontWeight: '600', color: '#0F1419', lineHeight: 20, },
  productPrice: { fontSize: 14, color: '#536471', marginTop: 4, },
  freeBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  freeBadgeText: { color: '#065F46', fontSize: 12, fontWeight: '600', },

  // Quantity controls
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  quantityText: { marginHorizontal: 16, fontSize: 16, fontWeight: '600', color: '#0F1419', },
  deleteButton: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  // Bottom bar (now with extra padding)
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,               // clears the floating tab bar
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
  totalLabel: { fontSize: 18, fontWeight: '600', color: '#0F1419', },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#1c7245', },
  checkoutButton: {
    backgroundColor: '#1c7245',
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', },
});