import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/contexts/themeContext";
import { icons } from "@/constants";
import { Colors } from "@/constants/Colors";
import { COLORS } from "@/constants";
import { Route, useRouter } from "expo-router";
const Header = () => {
  const { dark } = useTheme();
  const router = useRouter();

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
          Hi, John!
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
      <Pressable onPress={notificationUrlHandler}>
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
    flex: 1,
    width: 27,
    height: 27,
  },
});
