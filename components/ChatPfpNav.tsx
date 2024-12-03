import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { COLORS, icons } from "@/constants";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { Colors } from "@/constants/Colors";

const ChatPfpNav: React.FC<{ image: string; name: string; status: string }> = (
  props
) => {
  const { dark } = useTheme();
  const router = useRouter();

  const backPressHandler = () => {
    router.dismissTo("/(tabs)");
  };

  return (
    <View
      style={[
        styles.container,
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
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

      <View style={styles.mainContentContainer}>
        <View>
          <Image source={props.image} style={{ width: 50, height: 50 }} />
        </View>
        <View style={styles.mainTextContainer}>
          <View>
            <Text
              style={[
                styles.mainHeading,
                dark
                  ? { color: Colors.dark.text }
                  : { color: Colors.light.text },
              ]}
            >
              {props.name}
            </Text>
          </View>
          <View>
            <Text style={styles.agentStatus}>{props.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ChatPfpNav;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  pressableArea: {
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  mainContentContainer: {
    flexDirection: "row",
  },
  mainTextContainer: {
    marginLeft: 12,
  },
  mainHeading: {
    fontSize: 18,
    fontWeight: "bold",
  },
  agentStatus: {
    color: COLORS.green,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
});
