import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@react-navigation/native';

const chat = () => {
  const { colors, dark } = useTheme();
  console.log(dark);
  return (
    <ThemedView>
      <Text>chat</Text>
    </ThemedView>
  );
};

export default chat;

const styles = StyleSheet.create({});
