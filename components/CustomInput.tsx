import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TextInputProps,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS, icons, SIZES } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { Image } from 'expo-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768; // iPads and larger devices

interface InputProps extends TextInputProps {
  id: string;
  label: string;
  icon?: string;
  errorText?: string;
  isEditable?: boolean;
  prefilledValue?: string;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const labelPosition = useRef(new Animated.Value(18)).current;
  const { dark } = useTheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (props.value) {
      animateLabel(true);
    }
  }, [props.value]);

  const animateLabel = (up: boolean) => {
    Animated.timing(labelPosition, {
      toValue: up ? 2 : 18,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    animateLabel(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!props.value) {
      animateLabel(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          props.errorText
            ? styles.errorInput
            : { borderColor: isFocused ? COLORS.primary : COLORS.greyscale300 },
        ]}
      >
        {props.icon && (
          <Image
            source={props.icon}
            style={[
              styles.icon,
              { tintColor: isFocused ? COLORS.primary : '#BCBCBC' },
            ]}
          />
        )}

        <TextInput
          {...props}
          ref={inputRef}
          editable={props.isEditable !== false}
          secureTextEntry={props.isPassword && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#BCBCBC"
          style={[
            styles.input,
            {
              color: dark ? COLORS.white : COLORS.black,
              paddingLeft: props.icon ? 50 : 20, // Increased padding for tablets
              top: 6,
              fontSize: isTablet ? 18 : SIZES.body3, // Larger font size for tablets
            },
          ]}
        />

        {props.label && (
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelPosition,
                fontSize: isTablet ? 16 : 12, // Larger label font size for tablets
                color: props.errorText
                  ? COLORS.red
                  : isFocused || props.value
                  ? COLORS.primary
                  : dark
                  ? COLORS.grayscale200
                  : COLORS.greyscale600,
              },
            ]}
            onPress={() => inputRef.current?.focus()}
          >
            {props.label}
          </Animated.Text>
        )}

        {props.isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.passwordToggle}
          >
            <MaterialIcons
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={isTablet ? 24 : 20} // Larger icon for tablets
              color={isFocused ? COLORS.primary : '#BCBCBC'}
            />
          </TouchableOpacity>
        )}
      </View>

      {props.errorText && (
        <Text style={styles.errorText}>{props.errorText}</Text>
      )}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputContainer: {
    borderRadius: SIZES.padding,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    textAlignVertical: 'center',
  },
  icon: {
    width: isTablet ? 25 : 20, // Increased icon size for tablets
    height: isTablet ? 25 : 20, // Increased icon size for tablets
    marginLeft: 10,
  },
  label: {
    position: 'absolute',
    left: 15,
    fontSize: isTablet ? 16 : 12, // Larger label font size for tablets
    transitionProperty: 'all',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease-in-out',
  },
  passwordToggle: {
    position: 'absolute',
    right: 15,
    top: '55%',
    transform: [{ translateY: -10 }],
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.red,
  },
});
