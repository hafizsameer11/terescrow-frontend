import React, { useState } from "react";
import { COLORS } from "@/constants";
import { Pressable, StyleSheet, Text, View, FlatList } from "react-native";
import ChatDataRendering from "./ChatDataRendering";
import {
  DUMMY_DATA_ALL,
  DUMMY_DATA_COMP,
  DUMMY_DATA_DECLINE,
  DUMMY_DATA_PROCESS,
} from "../utils/DummyData";
import { useTheme } from "@/contexts/themeContext";

const ChatCategories = () => {
  const { dark } = useTheme();

  const categories = [
    { id: "all", name: "All", bg: COLORS.green },
    { id: "completed", name: "Completed", bg: COLORS.green },
    { id: "processing", name: "Processing", bg: COLORS.warning },
    { id: "declined", name: "Declined", bg: COLORS.red },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const getFilteredData = () => {
    switch (selectedCategory) {
      case "completed":
        return DUMMY_DATA_COMP;
      case "processing":
        return DUMMY_DATA_PROCESS;
      case "declined":
        return DUMMY_DATA_DECLINE;
      default:
        return DUMMY_DATA_ALL;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Categories */}
      <View style={styles.container}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            style={[
              styles.categoryTypeContainer,
              {
                backgroundColor:
                  selectedCategory === category.id ? category.bg : dark ? 'transparent' : COLORS.white,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === category.id
                      ? "black"
                      : COLORS.grayscale400,
                },
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Data */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={getFilteredData()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatDataRendering
              icon={item.icon}
              heading={item.heading}
              text={item.text}
              date={item.date}
              price={item.price}
              productId={item.productId}
            />
          )}
          style={styles.dataList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontWeight: "500",
    color: COLORS.greyscale600,
    textTransform: "capitalize",
    marginVertical: 5,
  },
});

export default ChatCategories;
