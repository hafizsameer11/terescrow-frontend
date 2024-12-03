import { StyleSheet, View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/constants";
import { useTheme } from "@/contexts/themeContext";

const QuickBoxItem: React.FC<{
  icon: string;
  heading: string;
  text: string;
  onSend: () => void;
}> = (props) => {
  const { dark } = useTheme();
  return (
    <Pressable
      style={[
        styles.container,
        dark
          ? { backgroundColor: COLORS.dark3 }
          : { backgroundColor: COLORS.grayscale100 },
      ]}
      onPress={props.onSend}
    >
      <View
        style={[
          styles.iconContainer,
          dark
            ? { backgroundColor: COLORS.white }
            : { backgroundColor: COLORS.transparentAccount },
        ]}
      >
        <Image source={props.icon} style={styles.icon} />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.heading,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          {props.heading}
        </Text>
        <Text
          style={[
            styles.text,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          {props.text}
        </Text>
      </View>
    </Pressable>
  );
};

export default QuickBoxItem;

const styles = StyleSheet.create({
  container: {
    width: '47%',
    padding: 12,
    flexDirection: "column",
    backgroundColor: "#F7F7F7",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 20,
    height: 20,
  },
  textContainer: {
    marginTop: 5,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
  },
  text: {
    fontSize: 10,
    color: COLORS.greyscale600,
  },
});
