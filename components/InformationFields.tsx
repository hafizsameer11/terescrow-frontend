import { COLORS } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import React, { useState } from "react";
import { Colors } from "@/constants/Colors";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import CustomSelectField from "./CustomSelectField";

const InformationFields = () => {
  const { dark } = useTheme();
  const [counter, setCounter] = useState(0);

  const increaseCounter = () => setCounter(counter + 1);
  const decreaseCounter = () => setCounter(counter > 0 ? counter - 1 : 0);

  return (
    <View style={styles.container}>
      {/* Input with Counter */}
      <View style={styles.inputWithCounter}>
        <Text
          style={[
            styles.mainText,
            dark ? { color: Colors.dark.text } : { color: Colors.light.text },
          ]}
        >
          How many cards?
        </Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            onPress={decreaseCounter}
            style={styles.counterButton}
          >
            <Text style={[styles.counterText, styles.specialCase]}>-</Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.counterValue,
              dark ? { color: Colors.dark.text } : { color: Colors.light.text },
            ]}
          >
            {counter}
          </Text>
          <TouchableOpacity
            onPress={increaseCounter}
            style={styles.counterButton}
          >
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Regular Input */}
      <TextInput
        style={[
          styles.input,
          dark ? { color: Colors.dark.text } : { color: Colors.light.text },
        ]}
        keyboardType="numeric"
        placeholder="Enter amount in USD"
        placeholderTextColor={"#888"}
      />
      <View style={{ flex: 1, marginTop: 24 }}>
        <CustomSelectField title="Category" />
      </View>
    </View>
  );
};

export default InformationFields;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 24,
    marginHorizontal: 16,
  },
  mainText: {
    fontSize: 16,
    color: COLORS.grayscale700,
    fontWeight: "semibold",
  },
  inputWithCounter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingLeft: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.greyscale300,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    borderRadius: 50,
    marginHorizontal: 16,
    backgroundColor: COLORS.greyscale600,
  },
  counterText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "semibold",
    paddingHorizontal: 7,
  },
  counterValue: {
    fontSize: 16,
    color: "#333",
  },
  specialCase: {
    paddingHorizontal: 10,
  },
  input: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.greyscale300,
  },
});
