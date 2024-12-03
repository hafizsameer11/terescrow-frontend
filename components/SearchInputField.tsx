import { StyleSheet, View, TextInput, Text } from "react-native";
import { Image } from "expo-image";
import { COLORS, icons } from "@/constants";

const SearchInputField = () => {
  return (
    <View style={styles.container}>
        <Image source={icons.search} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.grayscale400} 
        
        placeholder="Search..."
      />
    </View>
  );
};

export default SearchInputField;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    width: "100%",
    paddingLeft: 45,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  resultText: {
    marginTop: 8,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    position: "absolute",
    top: 28,
    left: 30,
    width: 20,
    height: 20,
    tintColor: "#ccc",
    marginBottom: 4,
  },
});
