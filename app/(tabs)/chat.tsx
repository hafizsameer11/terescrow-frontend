import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "@/contexts/themeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants";
import ChatCategories from "@/components/ChatCategories";

const chat = () => {
  const { dark } = useTheme();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainHeadingContainer}>
        <Text style={styles.mainHeading}>Chat</Text>
      </View>
      <View
        style={[
          styles.mainContent,
          dark
            ? { backgroundColor: COLORS.black }
            : { backgroundColor: COLORS.white },
        ]}
      >
        <ChatCategories />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.green,
  },
  mainHeadingContainer: {
    flex: 0.15,
    flexDirection: "column",
    justifyContent: "center",
  },
  mainHeading: {
    flex: 1,
    fontSize: 24,
    marginBottom: 20,
    color: COLORS.white,
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "bottom",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
  },
});

export default chat;
