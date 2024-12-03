import { StyleSheet, Text, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants";

const CustomCancelTrade = () => {
  const router = useRouter();
  const handlePress = () => {
    console.log("Proceed to connecting agent!");
    router.back();
  };
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Cancel Trade</Text>
      </Pressable>
    </View>
  );
};

export default CustomCancelTrade;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 92,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  button: {
    borderRadius: 32,
    backgroundColor: COLORS.red,
    width: "90%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});