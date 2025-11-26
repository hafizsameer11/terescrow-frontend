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
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/themeContext';
import { MaterialIcons } from '@expo/vector-icons';

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
  variant?: 'default' | 'signin';
  showLock?: boolean;
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

  const isSigninVariant = props.variant === 'signin';
  const signinLabelPosition = useRef(new Animated.Value(16)).current;
  
  useEffect(() => {
    if (isSigninVariant) {
      if (props.value || isFocused) {
        Animated.timing(signinLabelPosition, {
          toValue: 7,
          duration: 200,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.timing(signinLabelPosition, {
          toValue: 16,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [props.value, isFocused, isSigninVariant]);

  // Default behavior (when variant is not 'signin')
  const inputHeight = isSigninVariant ? 56 : undefined;
  const borderRadius = isSigninVariant ? 12 : SIZES.padding;
  const borderColor = isSigninVariant 
    ? (props.errorText ? COLORS.error : '#e2d9ec')
    : (props.errorText ? COLORS.error : (isFocused ? COLORS.primary : COLORS.greyscale300));
  const labelColor = isSigninVariant
    ? (props.errorText ? COLORS.red : '#989898')
    : (props.errorText 
        ? COLORS.red 
        : (isFocused || props.value 
          ? COLORS.primary 
          : (dark ? COLORS.grayscale200 : COLORS.greyscale600)));
  const inputTextColor = isSigninVariant ? '#1e1e1e' : (dark ? COLORS.white : COLORS.black);
  const placeholderColor = isSigninVariant ? '#989898' : '#BCBCBC';
  const inputFontSize = isSigninVariant ? 16 : (isTablet ? 18 : SIZES.body3);
  const labelFontSize = isSigninVariant 
    ? ((isFocused || props.value) ? 12 : 16) 
    : (isTablet ? 16 : 12);
  const labelTop = isSigninVariant ? signinLabelPosition : labelPosition;
  const inputTop = isSigninVariant ? ((props.value || isFocused) ? 25 : 16) : 6;

  return (
    <View style={[styles.container, isSigninVariant && styles.containerSignin]}>
      <View
        style={[
          styles.inputContainer,
          isSigninVariant && styles.inputContainerSignin,
          { 
            height: inputHeight,
            borderRadius: borderRadius,
            borderColor: borderColor,
            backgroundColor: isSigninVariant ? '#FEFEFE' : 'transparent',
          },
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
          placeholder={isSigninVariant && (props.value || isFocused) ? undefined : (props.placeholder || '')}
          placeholderTextColor={placeholderColor}
          style={[
            styles.input,
            isSigninVariant && styles.inputSignin,
            {
              color: inputTextColor,
              paddingLeft: props.icon ? 50 : (isSigninVariant ? 16 : 20),
              paddingRight: isSigninVariant && (props.isPassword || props.showLock) ? 50 : (isSigninVariant ? 50 : 0),
              paddingTop: isSigninVariant ? (props.value || isFocused ? 25 : 16) : 0,
              paddingBottom: isSigninVariant ? (props.value || isFocused ? 8 : 16) : 0,
              top: isSigninVariant ? 0 : inputTop,
              fontSize: inputFontSize,
            },
          ]}
        />

        {props.label && (
          <Animated.Text
            style={[
              styles.label,
              isSigninVariant && styles.labelSignin,
              {
                top: isSigninVariant ? labelTop : labelPosition,
                fontSize: labelFontSize,
                color: labelColor,
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
            style={[
              styles.passwordToggle,
              isSigninVariant && styles.passwordToggleSignin,
            ]}
          >
            <MaterialIcons
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={isTablet ? 24 : 20}
              color={isSigninVariant ? '#989898' : (isFocused ? COLORS.primary : '#BCBCBC')}
            />
          </TouchableOpacity>
        )}
        {props.showLock && (
          <View
            style={[
              styles.lockIcon,
              isSigninVariant && styles.lockIconSignin,
            ]}
          >
            <Image
              source={require('../assets/images/lock.png')}
              style={{
                width: isTablet ? 20 : 16,
                height: isTablet ? 20 : 16,
              }}
              contentFit="contain"
            />
          </View>
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
  containerSignin: {
    // marginBottom: 20,
  },
  inputContainer: {
    borderRadius: SIZES.padding,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerSignin: {
    height: 56,
    borderRadius: 12,
    borderColor: '#e2d9ec',
    borderWidth: 1,
    backgroundColor: '#FEFEFE',
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    textAlignVertical: 'center',
  },
  inputSignin: {
    paddingVertical: 0,
    fontSize: 16,
    color: '#1e1e1e',
    height: '100%',
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
  labelSignin: {
    left: 16,
    fontSize: 12,
    color: '#989898',
  },
  passwordToggle: {
    position: 'absolute',
    right: 15,
    top: '55%',
    transform: [{ translateY: -10 }],
  },
  passwordToggleSignin: {
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  lockIcon: {
    position: 'absolute',
    right: 15,
    top: '55%',
    transform: [{ translateY: -10 }],
  },
  lockIconSignin: {
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.red,
  },
});
