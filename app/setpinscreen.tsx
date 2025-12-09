import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useRouter } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/contexts/themeContext';
import { validationPinChange } from '@/utils/validation';
import FONTS from '@/constants/fonts';
import { COLORS } from '@/constants';
import SuccessModal from './successmodal';
import { showTopToast } from '@/utils/helpers';
import { useMutation } from '@tanstack/react-query';
import { setPin as setPinApi } from '@/utils/mutations/authMutations';
import { useAuth } from '@/contexts/authContext';
import { ApiError } from '@/utils/customApiCalls';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const SetPinScreen: React.FC = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  const context = searchParams.get('context');
  const email = searchParams.get('email');
  const { push } = useRouter();
  const { navigate, reset } = useNavigation<NavigationProp<any>>();
  const [pin, setPin] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { dark } = useTheme();
  const { token: authToken, userData, logout } = useAuth();

  const handlePress = (digit: string) => {
    console.log('reached');
    if (pin.length < 4) {
      setPin([...pin, digit]);
      return;
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  // Mutation for setting PIN
  const { mutate: handleSetPin, isPending: isSettingPin } = useMutation({
    mutationFn: async (data: { email: string; pin: string }) => {
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
      const result = await setPinApi(
        { email: data.email, pin: data.pin },
        authToken
      );
      return result;
    },
    mutationKey: ['set-pin'],
    onSuccess: async (data) => {
      console.log('PIN set successfully:', data);
      
      // Only navigate to signin if this is part of the signup flow
      if (context === 'signup') {
        showTopToast({
          type: 'success',
          text1: 'Success',
          text2: 'PIN set successfully. Please log in to continue.',
        });
        
        // Logout user and navigate to signin (logout already handles navigation)
        // Small delay to ensure toast is visible
        setTimeout(async () => {
          try {
            await logout();
            console.log('User logged out after PIN setup - navigation handled by logout');
          } catch (logoutError) {
            console.log('Error during logout:', logoutError);
            // If logout fails, manually navigate to signin
            try {
              reset({
                index: 0,
                routes: [{ name: 'signin' as any }],
              });
              console.log('Navigation to signin completed (fallback)');
            } catch (navError) {
              console.log('Navigation error, using router:', navError);
              router.replace('/signin');
            }
          }
        }, 1500);
      } else {
        // For other contexts (like transactionPin), show success but don't navigate
        showTopToast({
          type: 'success',
          text1: 'Success',
          text2: 'PIN set successfully.',
        });
      }
    },
    onError: (error: ApiError) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to set PIN. Please try again.',
      });
      setPin([]);
    },
  });

  const validatePin = () => {
    const pinValue = pin.join('');
    // Removed router.push('/(tabs)') - it was interfering with navigation flow
    if (title === 'Confirm your Pin') {
      const enteredPin = searchParams.get('enteredPin');

      // Validate PINs match
      if (pinValue !== enteredPin) {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: 'Pins do not match!',
        });
        setPin([]);
        return;
      }

      // If signup context, call the API to set PIN
      if (context === 'signup') {
        const userEmail = email || userData?.email;
        console.log('Setting PIN for signup flow - email:', userEmail, 'context:', context);
        if (!userEmail) {
          showTopToast({
            type: 'error',
            text1: 'Error',
            text2: 'Email not found. Please try again.',
          });
          setPin([]);
          return;
        }
        if (!authToken) {
          showTopToast({
            type: 'error',
            text1: 'Error',
            text2: 'Authentication token not found. Please try again.',
          });
          setPin([]);
          return;
        }
        // Call API to set PIN
        console.log('Calling handleSetPin API...');
        handleSetPin({ email: userEmail, pin: pinValue });
        return;
      }

      if (context === 'transactionPin') {
        push({
          pathname: '/setpinscreen',
          params: { title: 'Pin confirmed', context: 'transactionPin' },
        });
        setModalVisible(false);
        setPin([]);
      }
      return;
    }

    validationPinChange
      .validate({ setYourPin: pinValue, confirmYourPin: pinValue })
      .then(() => {
        if (title === 'Set your Pin' && context === 'signup') {
          // Get email from params or userData
          const userEmail = email || userData?.email;
          if (!userEmail) {
            showTopToast({
              type: 'error',
              text1: 'Error',
              text2: 'Email not found. Please try again.',
            });
            setPin([]);
            return;
          }
          // Navigate to confirm PIN screen with email and entered PIN
          push({
            pathname: '/setpinscreen',
            params: { 
              title: 'Confirm your Pin', 
              enteredPin: pinValue,
              context: 'signup',
              email: userEmail,
            },
          });
          setPin([]);
        }

        if (title === 'Enter new Pin' && context === 'transactionPin') {
          push({
            pathname: '/setpinscreen',
            params: { title: 'Confirm your Pin', enteredPin: pinValue },
          });
          setModalVisible(false);
          setPin([]);
        }
      })
      .catch((err: { message: string }) => {
        showTopToast({ type: 'error', text1: 'Error', text2: err.message });
        setPin([]);
      });
  };

  useEffect(() => {
    if (pin.length === 4) {
      validatePin();
    }

    if (
      pin.length >= 4 &&
      title === 'Confirm your Pin' &&
      context === 'signup'
    ) {
      setModalVisible(true);
    }
  }, [pin, title, context, push]);

  const handleModalPress = () => {
    setModalVisible(false);
    push('/(tabs)/chat');
    setPin([]);
  };

  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    textPrimary: COLORS.primary,
    textSecondary: dark ? COLORS.greyscale500 : COLORS.grayscale700,
    pinDot: '#eafff7',
    pinDotFilled: dark ? COLORS.white : COLORS.dark1,
    buttonBackground: dark ? COLORS.gray2 : COLORS.grayscale100,
    buttonText: dark ? COLORS.white : COLORS.dark1,
    passwordPins: dark ? COLORS.black : COLORS.white,
    pinInputCont: dark ? COLORS.gray2 : COLORS.grayscale200,
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: themeStyles.pinDot },
          ]}
        >
          <Text style={[styles.pinText, { color: themeStyles.textPrimary }]}>
            {pin.length < 4 ? '***' : pin.join('')}
          </Text>
        </View>
        <Text
          style={[
            styles.title,
            { color: themeStyles.buttonText, fontWeight: 'bold' },
          ]}
        >
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: themeStyles.textSecondary }]}>
          Set a 4-digit PIN to authorize your transactions and also to log in to
          your account.
        </Text>

        <View
          style={[
            styles.pinInputContainer,
            { backgroundColor: themeStyles.pinInputCont },
          ]}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.pinDot,
                {
                  backgroundColor:
                    pin.length > index
                      ? themeStyles.pinDotFilled
                      : themeStyles.passwordPins,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.numberPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <TouchableOpacity
              key={digit}
              style={[
                styles.numberButton,
                { backgroundColor: themeStyles.buttonBackground },
              ]}
              onPress={() => handlePress(digit.toString())}
            >
              <Text
                style={[
                  styles.numberButtonText,
                  { color: themeStyles.buttonText },
                ]}
              >
                {digit}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.emptyButton} />
          <TouchableOpacity
            style={[
              styles.numberButton,
              { backgroundColor: themeStyles.buttonBackground },
            ]}
            onPress={() => handlePress('0')}
          >
            <Text
              style={[
                styles.numberButtonText,
                { color: themeStyles.buttonText },
              ]}
            >
              0
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.numberButton,
              { backgroundColor: themeStyles.buttonBackground },
            ]}
            onPress={handleBackspace}
          >
            <Text
              style={[
                styles.numberButtonText,
                { color: themeStyles.buttonText },
              ]}
            >
              ←
            </Text>
          </TouchableOpacity>
        </View>
        <SuccessModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          onPress={handleModalPress}
          buttonTitle="Go to dashboard"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  pinText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: FONTS.Bold,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  pinInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 50,
    marginBottom: 30,
  },
  pinDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: FONTS.Bold,
  },
  emptyButton: {
    width: 70,
    height: 70,
    marginVertical: 10,
    marginHorizontal: 10,
  },
});

export default SetPinScreen;
function toastConfig(message: string) {
  throw new Error('Function not implemented.');
}
