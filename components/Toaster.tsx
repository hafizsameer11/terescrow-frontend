import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Toast, { ToastConfigParams } from "react-native-toast-message";

export default function Toaster() {
  const customToastConfig = {
    success: ({ text1, text2 }: ToastConfigParams<any>) => (
      <View style={styles.toastContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        <Text style={styles.toastMessage}>{text2}</Text>
      </View>
    ),
  };

  const showCustomToast = () => {
    Toast.show({
      type: "success",
      text1: "Success",
      text2:
        "Incorrect login credentials. Please, try again or reset your password.",
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text onPress={showCustomToast} style={{ fontSize: 18, color: "blue" }}>
        Show Toast
      </Text>
      <Toast config={customToastConfig} />
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  toastMessage: {
    fontSize: 14,
    color: "#fff", 
  },
});
