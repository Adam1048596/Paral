import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function Index() {
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/sign-in");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      {/* LOGO */}
      <Image
        source={require("../assets/logo/paral-logo.png")}
        style={{ width: 120, height: 120, marginBottom: 20 }}
        resizeMode="contain"
      />

      {/* TEXT (optional) */}
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 20 }}>
        Loading...
      </Text>

      {/* SPINNER */}
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}