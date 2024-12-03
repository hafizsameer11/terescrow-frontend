import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../utils/Button";
import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { useRouter, useNavigation } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { Image } from "expo-image";
import FONTS from "@/constants/fonts";
import Input from "./customInput";

const OTPVerification = () => {
  const { goBack } = useNavigation();
  const [time, setTime] = useState(45);
  const [otp, setOtp] = useState("");
  const [timerOut, setTimerOut] = useState(false);
  const { colors, dark } = useTheme();
  const {push} = useRouter()

  const searchParams = useSearchParams();
  const context = searchParams.get("context");

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
  };

  const handleVerifyOTP = () => {
    if (otp.length === 4) {
      console.log(`Verifying OTP: ${otp}`);
      if(context === 'signup'){
        push({ pathname: '/setpinscreen', params: { title: 'Set your Pin' }})
      }
      else if(context === 'signin'){
        push('/setnewpassword')
      }
    }
  };

  const themeStyle = {
    opacity: otp.length === 4 ? 1 : 0.6,
  }

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.fullHeightContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <Text style={[styles.title, {color: dark ? COLORS.white : COLORS.dark1}]}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              A 4 digits code has been sent to your email address
              emmanuel@gmail.com
            </Text>
            <Input
              id="password"
              label="OTP"
              value={otp}
              onChangeText={(text) => setOtp(text)}
              keyboardType="numeric"
              maxLength={4}
              style={styles.otpInput}
            />
          </View>
        </ScrollView>

        {/* Fixed Buttons at the Bottom */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            filled
            disabled={otp.length !== 4}
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
                : "Resend OTP"}
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
    justifyContent: "space-between", // Keeps content at the top and buttons at the bottom
  },
  scrollContainer: {
    paddingBottom: 80, // Ensures space for the bottom buttons
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "flex-start",
  },
  contentContainer: {
    flex: 1, // Takes the remaining space above the buttons
    justifyContent: "flex-start", // Aligns content to the top
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 125,
    height: 125,
    borderRadius: 100,
    backgroundColor: COLORS.secondaryWhite,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.greyscale600,
    textAlign: "center",
    marginBottom: 32,
  },
  otpInput: {
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.greyscale300,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    marginBottom: 24,
    color: COLORS.black,
  },
  resendButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 32,
    marginTop: 16,
    backgroundColor: "#eafff7",
    color: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  resendText: {
    fontSize: 14,
    fontWeight: FONTS.Bold,
    fontFamily: "regular",
    color: COLORS.primary,
  },
  button: {
    width: "100%",
    borderRadius: 32,
    marginTop: 16,
  },
});

export default OTPVerification;
