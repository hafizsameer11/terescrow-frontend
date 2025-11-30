import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';
import { Image } from 'expo-image';
import FONTS from '@/constants/fonts';
import Input from '../components/CustomInput';
import { useMutation } from '@tanstack/react-query';
import {
  resendOtp,
  verifyEmailOtp,
  verifyPasswordOtp,
} from '@/utils/mutations/authMutations';
import { useAuth } from '@/contexts/authContext';
import { NavigationProp, useRoute } from '@react-navigation/native';
import { showTopToast } from '@/utils/helpers';
import { ApiError } from '@/utils/customApiCalls';

const OTPVerification = () => {
  const { goBack, navigate, reset } = useNavigation<NavigationProp<any>>();
  const { token, userData } = useAuth();
  const [time, setTime] = useState(45);
  const [otp, setOtp] = useState('');
  const [timerOut, setTimerOut] = useState(false);
  const { colors, dark } = useTheme();
  const route = useRoute();
  const { context, email } = route.params as { context: string; email: string };
  const isVerifyingRef = useRef(false);

  // console.log(otp);
  // console.log(context);
  // console.log(token);
const { mutate: verifyOtp, isPending: verifyingOtp } = useMutation({
  mutationFn:
    context === "signup"
      ? () => {
          if (!token) {
            throw new Error("Authentication token is required");
          }
          if (!otp || otp.length !== 4) {
            throw new Error("Please enter a valid 4-digit OTP");
          }
          // Try to get userId from userData
          let userId: number | undefined = userData?.id;
          
          // If userData doesn't have id, try to decode token (JWT format: header.payload.signature)
          if (!userId && token) {
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = parts[1];
                // Base64 URL decode for React Native
                const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/');
                const padded = base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4);
                
                // Use global atob if available (web), otherwise try to decode manually
                let decodedPayload: string;
                if (typeof atob !== 'undefined') {
                  decodedPayload = atob(padded);
                } else {
                  // Manual base64 decode for React Native
                  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                  let str = '';
                  for (let i = 0; i < padded.length; i += 4) {
                    const enc1 = chars.indexOf(padded.charAt(i));
                    const enc2 = chars.indexOf(padded.charAt(i + 1));
                    const enc3 = chars.indexOf(padded.charAt(i + 2));
                    const enc4 = chars.indexOf(padded.charAt(i + 3));
                    const chr1 = (enc1 << 2) | (enc2 >> 4);
                    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    const chr3 = ((enc3 & 3) << 6) | enc4;
                    str += String.fromCharCode(chr1);
                    if (enc3 !== 64) str += String.fromCharCode(chr2);
                    if (enc4 !== 64) str += String.fromCharCode(chr3);
                  }
                  decodedPayload = str;
                }
                
                const decoded = JSON.parse(decodedPayload);
                userId = decoded.id;
                console.log('Decoded userId from token:', userId);
              }
            } catch (e) {
              console.log('Could not decode token:', e);
            }
          }
          
          if (!userId) {
            throw new Error("User ID not found. Please try again.");
          }
          
          return verifyEmailOtp(token, otp, userId);
        }
      : () => verifyPasswordOtp(email, otp),
  mutationKey: ["verify-otp"],
  onSuccess: (data) => {
    isVerifyingRef.current = false;
    console.log("OTP verification success - full response:", JSON.stringify(data, null, 2));
    
    // Backend returns: { status: "success", message: "User Verified Successfully.", data: null }
    // If we reach onSuccess, it means the API call succeeded (2xx status)
    // Check response to confirm it's actually a success response
    const isSuccess = data?.status === 'success' || 
                     (data?.message && (
                       data.message.toLowerCase().includes('verified') || 
                       data.message.toLowerCase().includes('success')
                     ));
    
    console.log("Is success response?", isSuccess, "Context:", context);
    
    if (isSuccess) {
      if (context === "signup") {
        // Navigate to set PIN screen after successful OTP verification
        // Try multiple sources for email
        let userEmail = userData?.email || email;
        
        // If email still not found, try to decode from token
        if (!userEmail && token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = parts[1];
              const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/');
              const padded = base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4);
              
              let decodedPayload: string;
              if (typeof atob !== 'undefined') {
                decodedPayload = atob(padded);
              } else {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                let str = '';
                for (let i = 0; i < padded.length; i += 4) {
                  const enc1 = chars.indexOf(padded.charAt(i));
                  const enc2 = chars.indexOf(padded.charAt(i + 1));
                  const enc3 = chars.indexOf(padded.charAt(i + 2));
                  const enc4 = chars.indexOf(padded.charAt(i + 3));
                  const chr1 = (enc1 << 2) | (enc2 >> 4);
                  const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                  const chr3 = ((enc3 & 3) << 6) | enc4;
                  str += String.fromCharCode(chr1);
                  if (enc3 !== 64) str += String.fromCharCode(chr2);
                  if (enc4 !== 64) str += String.fromCharCode(chr3);
                }
                decodedPayload = str;
              }
              
              const decoded = JSON.parse(decodedPayload);
              userEmail = decoded.email || decoded.username;
              console.log("Decoded email from token:", userEmail);
            }
          } catch (e) {
            console.log("Could not decode email from token:", e);
          }
        }
        
        console.log("User email for navigation:", userEmail, "userData:", userData);
        
        if (!userEmail) {
          console.log("Email not found, showing error");
          showTopToast({
            type: "error",
            text1: "Error",
            text2: "Email not found. Please try again.",
          });
          return;
        }
        
        console.log("Navigating to set PIN screen with email:", userEmail);
        
        // Show success message
        showTopToast({
          type: "success",
          text1: "Email Verified",
          text2: "Your email has been verified successfully.",
        });
        
        // Navigate immediately to set PIN screen (no delay)
        try {
          reset({
            index: 0,
            routes: [
              {
                name: "setpinscreen" as any,
                params: {
                  title: "Set your Pin",
                  context: "signup",
                  email: userEmail,
                },
              },
            ],
          });
          console.log("Navigation reset completed");
        } catch (navError) {
          console.log("Navigation error:", navError);
          // Fallback: use navigate instead
          navigate("setpinscreen" as any, {
            title: "Set your Pin",
            context: "signup",
            email: userEmail,
          });
        }
      } else {
        reset({
          index: 0,
          routes: [
            {
              name: "setnewpassword" as any,
              params: { userId: data.data?.userId },
            },
          ],
        });
      }
    } else {
      // Response doesn't indicate success, treat as error but don't navigate
      console.log("Response doesn't indicate success, showing error");
      showTopToast({
        type: "error",
        text1: "Error",
        text2: data?.message || "Failed to verify OTP. Please try again.",
      });
    }
  },
  onError: (error: ApiError) => {
    isVerifyingRef.current = false;
    console.log("OTP verification error:", error);
    
    // Distinguish between different error types
    const errorMessage = error.message || "Failed to verify OTP. Please try again.";
    const isNetworkError = error.statusCode === 500 || 
                           errorMessage.toLowerCase().includes('network') ||
                           errorMessage.toLowerCase().includes('server') ||
                           errorMessage.toLowerCase().includes('timeout');
    
    if (isNetworkError) {
      showTopToast({
        type: "error",
        text1: "Network Error",
        text2: "Unable to connect to server. Please check your internet connection and try again.",
      });
    } else if (errorMessage.toLowerCase().includes('invalid otp') || 
               errorMessage.toLowerCase().includes('otp has been expired')) {
      // Invalid OTP or expired - stay on screen
      showTopToast({
        type: "error",
        text1: "Invalid OTP",
        text2: errorMessage,
      });
    } else {
      // Other errors
      showTopToast({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    }
  },
});


  const { mutate: resend, isPending: resendingOtp } = useMutation({
    mutationFn:
      context === 'signup'
        ? () => resendOtp(token, undefined)
        : () => resendOtp(undefined, email),
    mutationKey: ['resend-otp'],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (time === 0) {
      setTimerOut(true);
    }
  }, [time]);

  const handleResendOtp = () => {
    setTime(45);
    setTimerOut(false);
    resend();
  };

  const handleVerifyOTP = () => {
    // Prevent multiple calls
    if (verifyingOtp || isVerifyingRef.current) {
      return;
    }
    
    if (!otp || otp.length !== 4) {
      showTopToast({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid 4-digit OTP",
      });
      return;
    }
    if (!token && context === "signup") {
      showTopToast({
        type: "error",
        text1: "Error",
        text2: "Authentication token not found. Please try again.",
      });
      return;
    }
    
    isVerifyingRef.current = true;
    verifyOtp();
  };

  const themeStyle = {
    opacity: otp.length === 4 ? 1 : 0.6,
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.fullHeightContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={goBack}>
              <Image
                source={icons.arrowBack}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: dark ? COLORS.white : COLORS.dark1,
                }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.iconContainer}>
              <Image
                source={icons.email3}
                style={{
                  width: 80,
                  height: 80,
                }}
              />
            </View>
            <Text
              style={[
                styles.title,
                { color: dark ? COLORS.white : COLORS.dark1 },
              ]}
            >
              Verify OTP
            </Text>
            <Text style={styles.subtitle}>
              A 4 digits code has been sent to your email address
              {' '} {email}
            </Text>
            <View style={styles.otpWrapper}>
              <Input
                id="otp"
                label="OTP"
                value={otp}
                onChangeText={(text) => {
                  // Only allow numeric input
                  const numericText = text.replace(/[^0-9]/g, '');
                  setOtp(numericText);
                }}
                keyboardType="numeric"
                maxLength={4}
                variant="signin"
                placeholder=""
                isPassword={true}
                style={styles.otpInput}
              />
            </View>
          </View>
        </ScrollView>

        {/* Fixed Buttons at the Bottom */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            filled
            isLoading={verifyingOtp}
            disabled={otp.length !== 4 || verifyingOtp}
            style={[styles.button, themeStyle]}
            onPress={handleVerifyOTP}
          />
          <TouchableOpacity
            style={[styles.resendButton, { opacity: time > 0 ? 0.6 : 1 }]}
            onPress={handleResendOtp}
            disabled={time > 0}
          >
            <Text style={styles.resendText}>
              {time > 0
                ? `Resend OTP in 00:${time < 10 ? `0${time}` : time}`
                : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  fullHeightContainer: {
    flex: 1,
    justifyContent: 'space-between', // Keeps content at the top and buttons at the bottom
  },
  scrollContainer: {
    paddingBottom: 80, // Ensures space for the bottom buttons
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  contentContainer: {
    flex: 1, // Takes the remaining space above the buttons
    justifyContent: 'flex-start', // Aligns content to the top
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 125,
    height: 125,
    borderRadius: 100,
    backgroundColor: COLORS.secondaryWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'regular',
    color: COLORS.greyscale600,
    textAlign: 'center',
    marginBottom: 32,
  },
  otpWrapper: {
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: 24,
  },
  otpInput: {
    // Additional styling can be added here if needed
  },
  resendButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 32,
    marginTop: 16,
    backgroundColor: '#eafff7',
    color: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 14,
    fontWeight: FONTS.Bold,
    fontFamily: 'regular',
    color: COLORS.primary,
  },
  button: {
    width: '100%',
    borderRadius: 32,
    marginTop: 16,
  },
});

export default OTPVerification;
