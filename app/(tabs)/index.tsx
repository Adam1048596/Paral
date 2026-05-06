import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View, } from "react-native";
import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  brand: { name: string } | null;
  category: string;
  capacity: string;
  image_main: string | null;
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        category,
        capacity,
        image_main,
        brand:brands(name)
      `,
      )
      .limit(20);

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/product/[id]",
                params: { id: item.id },
              })
            }
            style={{
              flex: 1,
              backgroundColor: "#fff",
              margin: 6,
              borderRadius: 12,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2,
            }}
          >
            {/* Product Image */}
            <View style={{ aspectRatio: 1, backgroundColor: "#f0f0f0" }}>
              {item.image_main ? (
                <Image
                  source={{ uri: item.image_main }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#e1e1e1",
                  }}
                >
                  <Text style={{ color: "#999", fontSize: 14 }}>No Image</Text>
                </View>
              )}
            </View>

            {/* Product Info */}
            <View style={{ padding: 12 }}>
              <Text
                style={{ fontWeight: "600", fontSize: 14, marginBottom: 4 }}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text style={{ color: "#888", fontSize: 12 }}>
                {item.brand?.name || "Unknown brand"}
              </Text>
              <Text style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>
                {item.category} {item.capacity ? `· ${item.capacity}` : ""}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// If you’re storing only a relative path (e.g., product/cleanser/main.png), you’ll need to prefix it with your Supabase storage URL when displaying. You can do that by creating a helper:
// lib/storage.ts
// import { supabase } from './supabase';

// export function getPublicImageUrl(path: string | null): string | null {
//   if (!path) return null;
//   // If already full URL, return as is
//   if (path.startsWith('http')) return path;

//   const { data } = supabase
//     .storage
//     .from('product')
//     .getPublicUrl(path);

//   return data.publicUrl;
// }
