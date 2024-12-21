import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface ProfileListItemProps {
  text: string;
  icon: React.ReactNode;
  onPress: () => void;
  areLast?: boolean;
}

const ProfileListItem: React.FC<ProfileListItemProps> = ({
  text,
  icon,
  onPress,
  areLast,
}) => {
  const { dark } = useTheme();
  const themeStyles = {
    backgroundIcon: dark
      ? COLORS.green
      : areLast
      ? COLORS.transparentRed
      : COLORS.grayscale200,
    background: dark ? COLORS.transparentAccount : COLORS.white,
    text: dark ? COLORS.white : COLORS.black,
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: themeStyles.background,
          borderBottomColor: dark
            ? COLORS.transparentAccount
            : COLORS.greyscale300,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingLeft: 10,
        }}
      >
        <View
          style={[styles.icon, { backgroundColor: themeStyles.backgroundIcon }]}
        >
          <Image
            source={icon}
            style={{ width: 23, height: 23, tintColor: areLast && COLORS.red }}
          />
        </View>
        <Text style={[styles.text, { color: themeStyles.text }]}>{text}</Text>
      </View>
      <View>
        <Image
          source={icons.arrowRight}
          style={{
            width: 23,
            height: 23,
            tintColor: dark ? COLORS.white : COLORS.black,
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingRight: 8,
    marginVertical: 5,
  },
  icon: {
    padding: 6,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});

export default ProfileListItem;
