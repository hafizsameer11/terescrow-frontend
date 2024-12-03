import { Text, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { COLORS, images } from "@/constants";
import CustomCancelTrade from "./CustomCancelTrade";
import { useRouter } from "expo-router";

const ConnectingScreen = () => {
  const router = useRouter();
  const sendToChatHandler = () => {
    setTimeout(() => {
      router.push('/chatwithagent');
    }, 2000);
  }
  sendToChatHandler();
  return (
    <View style={styles.container}>
      <Image
        source={images.connectingAgentBg}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <View style={styles.loadingTextContainer}>
        <Text style={styles.textContent1}>Connecting you to an agent</Text>
        <Text style={styles.textContent2}>.. This will take few seconds</Text>
      </View>
      <CustomCancelTrade />
    </View>
  );
};

export default ConnectingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  loadingTextContainer: {
    position: "absolute",
  },
  textContent1: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  textContent2: {
    fontSize: 13,
    textAlign: "center",
    color: COLORS.white
  },
});