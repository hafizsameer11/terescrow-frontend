import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/contexts/themeContext";
import { icons } from "@/constants";
import { Colors } from "@/constants/Colors";
import { COLORS } from "@/constants";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";

const Header = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { userData } = useAuth();

  const notificationUrlHandler = () => {
    router.push("/notificationpage");
  };

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={[
            styles.mainText,
            dark ? { color: Colors.dark.text } : { color: Colors.light.text },
          ]}
        >
          {userData?.username}
        </Text>
        <Text
          style={[
            styles.subText,
            dark ? { color: Colors.dark.text } : { color: Colors.light.text },
          ]}
        >
          Welcome to Tercescrow
        </Text>
      </View>
      
      <Pressable onPress={notificationUrlHandler} style={styles.notificationContainer}>
        <Image
          source={icons.notification}
          style={[
            styles.image,
            dark
              ? { tintColor: Colors.dark.tint }
              : { tintColor: COLORS.black },
          ]}
          contentFit="contain"
        />
        
        {userData?.unReadNotification > 0 && (
          <View style={styles.redDot} />
        )}
      </Pressable>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  mainText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subText: {
    fontFamily: "Regular",
    color: COLORS.greyscale600,
  },
  image: {
    width: 27,
    height: 27,
  },
  notificationContainer: {
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary, // Red color for the dot
  },
});
