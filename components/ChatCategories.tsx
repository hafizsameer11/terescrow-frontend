import React, { useState } from 'react';
import { COLORS } from '@/constants';
import { Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import { useTheme } from '@/contexts/themeContext';

const categories = [
  { id: 'all', name: 'All', bg: COLORS.green },
  { id: 'completed', name: 'Completed', bg: COLORS.green },
  { id: 'processing', name: 'Processing', bg: COLORS.warning },
  { id: 'declined', name: 'Declined', bg: COLORS.red },
];

interface PropTypes {
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}
const ChatCategories = (props: PropTypes) => {
  const { dark } = useTheme();

  const handleCategoryPress = (categoryId: string) => {
    props.setSelectedCategory(categoryId);
  };

  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <Pressable
          key={category.id}
          onPress={() => handleCategoryPress(category.id)}
          style={[
            styles.categoryTypeContainer,
            {
              backgroundColor:
                props.selectedCategory === category.id
                  ? category.bg
                  : dark
                  ? 'transparent'
                  : COLORS.white,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              {
                color:
                  props.selectedCategory === category.id
                    ? 'black'
                    : COLORS.grayscale400,
              },
            ]}
          >
            {category.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderColor: COLORS.grayscale400,
  },
  categoryTypeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  dataList: {
    marginTop: 10,
  },
  categoryText: {
    fontWeight: '500',
    color: COLORS.greyscale600,
    textTransform: 'capitalize',
    marginVertical: 5,
  },
});

export default ChatCategories;
