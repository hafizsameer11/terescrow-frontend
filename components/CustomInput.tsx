import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TextInputProps,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { COLORS, icons, SIZES } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { Image } from 'expo-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
              paddingLeft: props.icon ? 40 : 15,
              top: 6,
            },
          ]}
        />

        {props.label && (
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelPosition,
                fontSize: isFocused || props.value ? 12 : 16,
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
              size={20}
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
    fontSize: SIZES.body3,
    paddingVertical: 16,
    textAlignVertical: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  label: {
    position: 'absolute',
    left: 15,
    fontSize: 16,
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
