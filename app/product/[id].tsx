import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

type ProductDetail = {
  id: string;
  name: string;
  department: string;
  area: string;
  category: string;
  texture: string;
  capacity: string;
  brand: { name: string } | null;
  product_functions: { function: { name: string } }[];
  product_ingredients: { ingredient: { name: string } }[];
  product_skin_types: { skin_type: { name: string } }[];
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  async function fetchProduct(productId: string) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        brand:brands(name),
        product_functions(function_id, functions(name)),
        product_ingredients(ingredient_id, ingredients(name)),
        product_skin_types(skin_type_id, skin_types(name))
      `,
      )
      .eq("id", productId)
      .single();

    if (error) console.error(error);
    else setProduct(data);
    setLoading(false);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!product) return <Text>Product not found</Text>;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{product.name}</Text>
      <Text style={{ fontSize: 18, marginVertical: 5 }}>
        {product.brand?.name}
      </Text>

      <View style={{ marginVertical: 15 }}>
        <Text style={{ fontWeight: "bold" }}>Details</Text>
        <Text>Category: {product.category}</Text>
        <Text>Texture: {product.texture}</Text>
        <Text>Size: {product.capacity}</Text>
        <Text>Area: {product.area}</Text>
      </View>

      <View style={{ marginVertical: 15 }}>
        <Text style={{ fontWeight: "bold" }}>Functions</Text>
        {product.product_functions.map((pf) => (
          <Text key={pf.function_id}>• {pf.functions?.name}</Text>
        ))}
      </View>

      <View style={{ marginVertical: 15 }}>
        <Text style={{ fontWeight: "bold" }}>Key Ingredients</Text>
        {product.product_ingredients.map((pi) => (
          <Text key={pi.ingredient_id}>• {pi.ingredients?.name}</Text>
        ))}
      </View>

      <View style={{ marginVertical: 15 }}>
        <Text style={{ fontWeight: "bold" }}>Suitable for</Text>
        {product.product_skin_types.map((pst) => (
          <Text key={pst.skin_type_id}>• {pst.skin_types?.name}</Text>
        ))}
      </View>
    </ScrollView>
  );
}
