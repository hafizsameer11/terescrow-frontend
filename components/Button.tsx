import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { COLORS, SIZES } from "@/constants";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  color?: string;
  textColor?: string;
  filled?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = (props) => {
  const { dark } = useTheme();
  const {
    title,
    color,
    textColor,
    filled = true,
    isLoading = false,
    style,
    onPress,
    ...rest
  } = props;
  
  const bgColor = color || COLORS.primary;
  const resolvedTextColor = textColor || COLORS.white;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bgColor }, style]}
      onPress={onPress}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <Text style={[styles.text, { color: resolvedTextColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding, 
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    height: 52,
  },
  text: {
    fontSize: 18,
    fontFamily: "semiBold",
  },
});

export default Button;
