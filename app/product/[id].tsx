import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, ScrollView, Text, TouchableOpacity, View, } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.8;

type ProductImage = {
  id: string;
  image_path: string;
  order_index: number;
  is_main: boolean;
};

type ProductDetails = {
  what_it_does: string | null;
  how_to_use: string | null;
  who_its_for: string | null;
  ingredient_spotlight: string | null;
  tips: string | null;
  warnings: string | null;
};

type ProductDetail = {
  id: string;
  name: string;
  department: string;
  area: string;
  category: string;
  texture: string;
  capacity: string;
  image_main: string | null;
  brand: { name: string } | null;
  product_functions: { function_id: string; functions: { name: string } }[];
  product_ingredients: { ingredient_id: string; ingredients: { name: string } }[];
  product_skin_types: { skin_type_id: string; skin_types: { name: string } }[];
  product_images: ProductImage[];
  product_details: ProductDetails | null;
};

function getPublicUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('product').getPublicUrl(path);
  return data.publicUrl;
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      if (user) checkFavorite(id);
    }
  }, [id, user]);

  async function fetchProduct(productId: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(name),
        product_functions(function_id, functions(name)),
        product_ingredients(ingredient_id, ingredients(name)),
        product_skin_types(skin_type_id, skin_types(name)),
        product_images(id, image_path, order_index, is_main),
        product_details(*)
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error(error);
    } else {
      setProduct(data);
    }
    setLoading(false);
  }

  async function checkFavorite(productId: string) {
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();
    setIsFavorited(!!data);
  }

  async function toggleFavorite() {
    if (!user || !product) return;

    if (isFavorited) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      if (!error) setIsFavorited(false);
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: product.id });
      if (!error) setIsFavorited(true);
    }
  }

  const allImages: string[] = [];
  if (product?.image_main) {
    allImages.push(getPublicUrl(product.image_main));
  }
  if (product?.product_images) {
    product.product_images
      .sort((a, b) => a.order_index - b.order_index)
      .forEach((img) => allImages.push(getPublicUrl(img.image_path)));
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header with back button */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 18,
            fontWeight: '600',
          }}>
          {product.name}
        </Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorited ? '#FF3B30' : '#333'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Image Carousel */}
        {allImages.length > 0 && (
          <View>
            <FlatList
              ref={flatListRef}
              data={allImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                setActiveImageIndex(newIndex);
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width, height: IMAGE_HEIGHT }}
                  resizeMode="cover"
                />
              )}
            />
            {allImages.length > 1 && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingVertical: 8,
                }}>
                {allImages.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      marginHorizontal: 4,
                      backgroundColor:
                        index === activeImageIndex ? '#007AFF' : '#ccc',
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{product.name}</Text>
          <Text style={{ fontSize: 16, color: '#555', marginTop: 4 }}>
            {product.brand?.name || 'Unknown brand'}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
            {product.department && (
              <View style={{ backgroundColor: '#eef2f7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                <Text style={{ textTransform: 'capitalize' }}>{product.department}</Text>
              </View>
            )}
            {product.area && (
              <View style={{ backgroundColor: '#eef2f7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                <Text style={{ textTransform: 'capitalize' }}>{product.area}</Text>
              </View>
            )}
            {product.category && (
              <View style={{ backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                <Text>{product.category}</Text>
              </View>
            )}
            {product.texture && (
              <View style={{ backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                <Text>{product.texture}</Text>
              </View>
            )}
            {product.capacity && (
              <View style={{ backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                <Text>{product.capacity}</Text>
              </View>
            )}
          </View>

          {product.product_functions.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>What it does</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {product.product_functions.map((pf) => (
                  <View key={pf.function_id} style={{ backgroundColor: '#e8f0fe', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                    <Text style={{ color: '#1a73e8' }}>{pf.functions?.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {product.product_ingredients.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Key Ingredients</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {product.product_ingredients.map((pi) => (
                  <View key={pi.ingredient_id} style={{ backgroundColor: '#f0f0f0', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e0e0e0' }}>
                    <Text style={{ color: '#555' }}>{pi.ingredients?.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {product.product_details?.what_it_does && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>Description</Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>{product.product_details.what_it_does}</Text>
            </View>
          )}
          {product.product_details?.how_to_use && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>How to Use</Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>{product.product_details.how_to_use}</Text>
            </View>
          )}
          {product.product_details?.who_its_for && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>Who is it for?</Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>{product.product_details.who_its_for}</Text>
            </View>
          )}
          {product.product_details?.ingredient_spotlight && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>Key Ingredient</Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>{product.product_details.ingredient_spotlight}</Text>
            </View>
          )}
          {product.product_details?.tips && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>Pro Tips</Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>{product.product_details.tips}</Text>
            </View>
          )}
          {product.product_details?.warnings && (
            <View style={{ marginTop: 20, marginBottom: 40 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6, color: '#d32f2f' }}>Warnings</Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>{product.product_details.warnings}</Text>
            </View>
          )}

          {/* ========== CUSTOMER REVIEWS ========== */}
          <View style={{ borderTopWidth: 1, borderColor: '#eee', paddingTop: 20, marginTop: 10 }}>
            <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 12 }}>Customer Reviews</Text>
            <ReviewsSection productId={product.id} />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={{ padding: 16, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }}>
        {user && (
          <TouchableOpacity
            style={{
              padding: 12,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              marginBottom: 12,
            }}
            onPress={() =>
              router.push({
                pathname: '/write-review',
                params: { productId: product.id },
              })
            }>
            <Text style={{ textAlign: 'center', color: '#007AFF', fontWeight: '600' }}>
              Write a Review
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            addItem(product.id);
            Alert.alert('Added to cart', `${product.name} has been added to your cart.`);
          }}
          style={{
            backgroundColor: '#007AFF',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ====================== REVIEWS COMPONENT ======================
function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, review_text, image_url, created_at, user:user_id ( full_name )')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(10);
    setReviews(data || []);
    setLoadingReviews(false);
  }

  if (loadingReviews) return <ActivityIndicator />;
  if (reviews.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Text style={{ color: '#888' }}>No reviews yet. Be the first!</Text>
      </View>
    );
  }

  return (
    <View>
      {reviews.map((review) => (
        <View key={review.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontWeight: '600' }}>{review.user?.full_name || 'Anonymous'}</Text>
            <View style={{ flexDirection: 'row', marginLeft: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= review.rating ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
          {review.review_text ? <Text style={{ marginTop: 4, color: '#333' }}>{review.review_text}</Text> : null}
          {review.image_url ? (
            <Image source={{ uri: review.image_url }} style={{ width: 100, height: 100, borderRadius: 8, marginTop: 8 }} resizeMode="cover" />
          ) : null}
        </View>
      ))}
    </View>
  );
}