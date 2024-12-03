import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { COLORS, icons } from "@/constants";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { Colors } from "@/constants/Colors";

const NavigateBack: React.FC<{ text: string }> = ({ text }) => {
  const router = useRouter();
  const { dark } = useTheme();

  const backPressHandler = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={backPressHandler}
        style={styles.pressableArea}
        accessible={true}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Image
          source={icons.arrowBack}
          style={[
            styles.backIcon,
            dark
              ? { tintColor: Colors.dark.tint }
              : { tintColor: COLORS.black },
          ]}
        />
      </Pressable>

      <View style={styles.mainTextContainer}>
        <Text
          style={[
            styles.mainText,
            dark ? { color: Colors.dark.text } : { color: Colors.light.text },
          ]}
        >
          {text}
        </Text>
      </View>
    </View>
  );
};

export default NavigateBack;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  pressableArea: {
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    position: "relative",
    zIndex: 1,
  },
  mainTextContainer: {
    flex: 1,
    marginLeft: -40,
  },
  mainText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
  },
});
