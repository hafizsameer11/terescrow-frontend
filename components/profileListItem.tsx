import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = width >= 768; // iPads and larger devices

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
          gap: isTablet ? 15 : 10, // Increased gap for tablet
          paddingLeft: isTablet ? 20 : 10, // Increased left padding for tablet
        }}
      >
        <View
          style={[styles.icon, { backgroundColor: themeStyles.backgroundIcon }]}
        >
          <Image
            source={icon}
            style={{
              width: isTablet ? 35 : 23, // Increased icon size for tablet
              height: isTablet ? 35 : 23, // Increased icon size for tablet
              tintColor: areLast && COLORS.red,
            }}
          />
        </View>
        <Text
          style={[
            styles.text,
            { color: themeStyles.text, fontSize: isTablet ? 18 : 14 }, // Larger text size for tablet
          ]}
        >
          {text}
        </Text>
      </View>
      <View>
        <Image
          source={icons.arrowRight}
          style={{
            width: isTablet ? 30 : 23, // Larger arrow icon for tablet
            height: isTablet ? 30 : 23, // Larger arrow icon for tablet
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
    paddingVertical: isTablet ? 18 : 11, // Increased padding for tablet
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingRight: isTablet ? 20 : 8, // Increased padding for tablet
    marginVertical: isTablet ? 15 : 5, // Increased margin for tablet
  },
  icon: {
    padding: isTablet ? 12 : 6, // Larger padding for tablet
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
