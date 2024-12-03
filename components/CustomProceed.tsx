import { StyleSheet, Text, Pressable, View } from "react-native";
import { useRouter } from "expo-router";

const CustomProceed = () => {
  const router = useRouter();
  const handlePress = () => {
    console.log("Proceed to connecting agent!");
    router.push("/connectingagent");
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Proceed</Text>
      </Pressable>
    </View>
  );
};

export default CustomProceed;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  button: {
    borderRadius: 32,
    backgroundColor: "#007BFF",
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