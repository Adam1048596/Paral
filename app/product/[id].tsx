import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

// If image_path is a relative path, convert it to a full Supabase storage URL
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
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

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

  // Combine main image + gallery images into one array for the carousel
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
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView>
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
            {/* Dot indicators */}
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

        {/* Product Info */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            {product.name}
          </Text>
          <Text style={{ fontSize: 16, color: '#555', marginTop: 4 }}>
            {product.brand?.name || 'Unknown brand'}
          </Text>

          {/* Quick Details - NOW INCLUDES department & area */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
            {product.department && (
              <View
                style={{
                  backgroundColor: '#eef2f7',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                  marginBottom: 8,
                }}>
                <Text style={{ textTransform: 'capitalize' }}>
                  {product.department}
                </Text>
              </View>
            )}
            {product.area && (
              <View
                style={{
                  backgroundColor: '#eef2f7',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                  marginBottom: 8,
                }}>
                <Text style={{ textTransform: 'capitalize' }}>{product.area}</Text>
              </View>
            )}
            {product.category && (
              <View
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                  marginBottom: 8,
                }}>
                <Text>{product.category}</Text>
              </View>
            )}
            {product.texture && (
              <View
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                  marginBottom: 8,
                }}>
                <Text>{product.texture}</Text>
              </View>
            )}
            {product.capacity && (
              <View
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                  marginBottom: 8,
                }}>
                <Text>{product.capacity}</Text>
              </View>
            )}
          </View>

          {/* Functions */}
          {product.product_functions.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>
                What it does
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {product.product_functions.map((pf) => (
                  <View
                    key={pf.function_id}
                    style={{
                      backgroundColor: '#e8f0fe',
                      borderRadius: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                    }}>
                    <Text style={{ color: '#1a73e8' }}>
                      {pf.functions?.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Ingredients */}
          {product.product_ingredients.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>
                Key Ingredients
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {product.product_ingredients.map((pi) => (
                  <View
                    key={pi.ingredient_id}
                    style={{
                      backgroundColor: '#f0f0f0',
                      borderRadius: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                    }}>
                    <Text style={{ color: '#555' }}>
                      {pi.ingredients?.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Detailed Education (product_details) */}
          {product.product_details?.what_it_does && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>
                Description
              </Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>
                {product.product_details.what_it_does}
              </Text>
            </View>
          )}

          {product.product_details?.how_to_use && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>
                How to Use
              </Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>
                {product.product_details.how_to_use}
              </Text>
            </View>
          )}

          {product.product_details?.who_its_for && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>
                Who is it for?
              </Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>
                {product.product_details.who_its_for}
              </Text>
            </View>
          )}

          {product.product_details?.ingredient_spotlight && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>
                Key Ingredient
              </Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>
                {product.product_details.ingredient_spotlight}
              </Text>
            </View>
          )}

          {product.product_details?.tips && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 6 }}>
                Pro Tips
              </Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>
                {product.product_details.tips}
              </Text>
            </View>
          )}

          {product.product_details?.warnings && (
            <View style={{ marginTop: 20, marginBottom: 40 }}>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                  marginBottom: 6,
                  color: '#d32f2f',
                }}>
                Warnings
              </Text>
              <Text style={{ lineHeight: 22, color: '#444' }}>
                {product.product_details.warnings}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}