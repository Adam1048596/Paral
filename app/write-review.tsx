import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function WriteReviewScreen() {
  const { user } = useAuth();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleSubmit() {
    if (!rating) {
      Alert.alert('Please select a rating');
      return;
    }
    if (!user || !productId) return;

    setUploading(true);

    const { error: insertError } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: productId,
      rating,
      review_text: reviewText,
      has_photo: false,
      image_url: null,
    });

    if (insertError) {
      // 23505 = duplicate key (already reviewed this product)
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

    setUploading(false);
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