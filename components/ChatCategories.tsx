import React from 'react';
import { COLORS } from '@/constants';
import { Pressable, StyleSheet, Text, ScrollView, View } from 'react-native';
import { useTheme } from '@/contexts/themeContext';

const categories = [
  { id: 'all', name: 'All', bg: COLORS.green },
  { id: 'completed', name: 'Completed', bg: COLORS.green },
  { id: 'processing', name: 'Processing', bg: COLORS.warning },
  { id: 'declined', name: 'Declined', bg: COLORS.red },
  { id: 'unsucessful', name: 'Unsucessful', bg: COLORS.black },
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
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
                      ? category.id === 'unsucessful'
                        ? COLORS.white  // Set to white if 'unsucessful' is selected
                        : 'black'
                      : COLORS.grayscale400,
                },
              ]}
            >
              {category.name}
            </Text>

          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.grayscale400,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTypeContainer: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 12,
    marginRight: 8, // Keeps spacing uniform without stretching layout
  },
  categoryText: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default ChatCategories;
