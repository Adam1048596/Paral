import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function WriteReviewScreen() {
  const { user } = useAuth();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!rating) {
      Alert.alert('Please select a rating');
      return;
    }
    if (!user || !productId) return;

    setUploading(true);
    let imageUrl: string | null = null;

    try {
      // Upload photo if selected
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const path = `reviews/${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('product')
          .upload(path, blob);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('product').getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      // Insert review
      const { error: insertError } = await supabase.from('reviews').insert({
        user_id: user.id,
        product_id: productId,
        rating,
        review_text: reviewText,
        has_photo: !!imageUrl,
        image_url: imageUrl,
      });

      if (insertError) {
        // Only possible error in normal use: duplicate review (unique constraint)
        if (insertError.code === '23505') {
          Alert.alert('Already reviewed', 'You have already left a review for this product.');
        } else {
          Alert.alert('Error', insertError.message);
        }
      } else {
        Alert.alert('Thank you!', 'Your review has been published.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20 }}>
        Write a Review
      </Text>

      {/* Rating stars */}
      <Text style={{ marginBottom: 8 }}>Rating</Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color="#FFD700"
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Review text */}
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          minHeight: 100,
          marginBottom: 16,
        }}
        multiline
        placeholder="Write your review (optional)..."
        value={reviewText}
        onChangeText={setReviewText}
      />

      {/* Photo upload */}
      <Text style={{ marginBottom: 8 }}>Add a photo (optional)</Text>
      {image ? (
        <View style={{ marginBottom: 16 }}>
          <Image
            source={{ uri: image }}
            style={{ width: 150, height: 150, borderRadius: 8 }}
          />
          <TouchableOpacity onPress={() => setImage(null)}>
            <Text style={{ color: 'red', marginTop: 4 }}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickImage}
          style={{
            borderWidth: 1,
            borderColor: '#007AFF',
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: '#007AFF' }}>Pick Photo</Text>
        </TouchableOpacity>
      )}

      {/* Submit button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={uploading}
        style={{
          backgroundColor: uploading ? '#a0c4ff' : '#007AFF',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '600' }}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}