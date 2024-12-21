import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/constants";

interface ChatStatusMessageProps {
  text: string;
  subText?: string;
  icon?: string; // Optional icon name
}

const ChatStatusMessage: React.FC<ChatStatusMessageProps> = ({
  text,
  subText,
  icon = "check-circle", // Default icon
}) => {
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <View style={styles.iconContainer}>
          <Image
            source={icon}
            style={{ width: 10, height: 10, tintColor: COLORS.white }}
          />
        </View>
        <Text style={styles.text}>{text}</Text>
      </View>
      {subText && <Text style={styles.subText}>{subText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 10,
    backgroundColor: COLORS.black,
    borderRadius: 50,
    padding: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "semibold",
  },
  subText: {
    fontSize: 12,
    color: "#333",
  },
});

export default ChatStatusMessage;
