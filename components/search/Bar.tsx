import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onPress: () => void;
};

export const SearchBar = React.memo(({ onPress }: Props) => {
  return (
    <TouchableOpacity
      style={styles.capsule}
      activeOpacity={0.95}
      onPress={onPress}>
      <View style={styles.inner}>
        <Ionicons name="search" size={15} color="#222" />
        <View style={styles.textContainer}>
          <Text style={styles.placeholder}>start your Search</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  capsule: {
    backgroundColor: '#fcfbfc',
    borderRadius: 999,            
    paddingVertical: 18,
    paddingHorizontal: 90,
    marginHorizontal: 25,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#fcfcfc',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 14,
    flex: 1,
  },
  placeholder: {
    fontSize: 14,
    fontWeight: '200',
    color: '#222',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});