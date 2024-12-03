import { COLORS } from "@/constants";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/contexts/themeContext";

const NotifiItem: React.FC<{
  id: string;
  icon: string;
  title: string;
  description: string;
  date: string;
}> = (props) => {
  const { dark } = useTheme();
  return (
    <View style={styles.notificationContainer}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <View
          style={[
            styles.iconContainer,
            dark
              ? { backgroundColor: COLORS.transparentAccount }
              : { backgroundColor: COLORS.transparentAccount },
          ]}
        >
          <Image
            source={props.icon}
            style={[
              { width: 25, height: 25 },
              dark
                ? { tintColor: COLORS.green }
                : { tintColor: Colors.light.tint },
            ]}
          />
        </View>
        <View>
          <Text
            style={[
              styles.notificationTitle,
              dark ? { color: Colors.dark.text } : { color: Colors.light.text },
            ]}
          >
            {props.title}
          </Text>
        </View>
      </View>
      <View>
        <Text style={styles.notificationDescription}>{props.description}</Text>
        <Text style={styles.notificationDate}>{props.date}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    flexDirection: "column",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.transparentAccount,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notificationDescription: {
    width: "100%",
    fontSize: 14,
    color: COLORS.gray3,
    marginBottom: 12,
  },
  notificationDate: {
    fontSize: 12,
    color: "#888",
  },
});

export default NotifiItem;
