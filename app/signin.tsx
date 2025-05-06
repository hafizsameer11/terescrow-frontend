import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { COLORS, icons, images } from "@/constants";
import Input from "../components/CustomInput";
import Button from "../components/Button";
import { Formik } from "formik";
import { validationSignInSchema } from "@/utils/validation";
import { useTheme } from "@/contexts/themeContext";
import { useNavigation } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword, loginUser } from "@/utils/mutations/authMutations";
import { showTopToast } from "@/utils/helpers";
import { ApiError } from "@/utils/customApiCalls";
import { useAuth } from "@/contexts/authContext";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { NavigationProp } from "@react-navigation/native";

const TOKEN_KEY = "USER_TOKEN";
const USER_DATA_KEY = "USER_DATA";
const BIOMETRIC_AUTH_KEY = "BIOMETRIC_AUTH";

const Signin = () => {
  const { dark } = useTheme();
  const { reset, navigate } = useNavigation<NavigationProp<any>>();
  const { setToken, setUserData } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleBiometricAuth = async () => {
    try {
      const isBiometricEnabled = await SecureStore.getItemAsync(BIOMETRIC_AUTH_KEY);
      if (isBiometricEnabled !== "true") {
        Alert.alert("Error", "Biometric login is not enabled.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Biometrics",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userData = await SecureStore.getItemAsync(USER_DATA_KEY);

        if (token && userData) {
          setToken(token);
          setUserData(JSON.parse(userData));
          reset({
            index: 0,
            routes: [{ name: "(tabs)" }],
          });
        }
      } else {
        Alert.alert("Authentication Failed", "Biometric Authentication Failed.");
      }
    } catch (error) {
      console.error("Biometric Error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const { mutate: handleLogin, isPending: loginPending } = useMutation({
    mutationFn: loginUser,
    mutationKey: ["login"],
    onSuccess: async (data) => {
      const { token, data: userData } = data;
      setToken(token);
      setUserData(userData);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
      await SecureStore.setItemAsync(BIOMETRIC_AUTH_KEY, "true");
      await SecureStore.setItemAsync("LOGIN_TIMESTAMP", Date.now().toString());

      reset({
        index: 0,
        routes: [{ name: "(tabs)" }],
      });
    },
    onError: (error: ApiError) => {
      showTopToast({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    },
  });

  const { mutate: handleForgotPassword, isPending: forgotPasswordPending } =
    useMutation({
      mutationKey: ["forgot-password"],
      mutationFn: forgotPassword,
      onSuccess: (data) => {
        navigate("otpverification", {
          context: "forgot-password",
          email: data.data.email,
        });
      },
      onError: (error: ApiError) => {
        showTopToast({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
      },
    });
  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userDataStr = await SecureStore.getItemAsync(USER_DATA_KEY);
        const timestampStr = await SecureStore.getItemAsync("LOGIN_TIMESTAMP");

        if (token && userDataStr && timestampStr) {
          const loginTime = parseInt(timestampStr);
          const now = Date.now();

          // Check if login is within 30 days (in ms)
          const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
          if (now - loginTime < THIRTY_DAYS) {
            setToken(token);
            setUserData(JSON.parse(userDataStr));
            reset({
              index: 0,
              routes: [{ name: "(tabs)" }],
            });
          } else {
            // Expired - clear storage
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_DATA_KEY);
            await SecureStore.deleteItemAsync("LOGIN_TIMESTAMP");
            await SecureStore.deleteItemAsync(BIOMETRIC_AUTH_KEY);
          }
        }
      } catch (err) {
        console.log("Auto-login error:", err);
      }
    };

    checkAutoLogin();
  }, []);


  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: dark ? COLORS.dark1 : COLORS.white },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={images.logo}
            style={styles.logo}
          />
        </View>

        <Text
          style={[
            styles.subtitle,
            { color: dark ? COLORS.white : COLORS.black, paddingBottom: 10 },
          ]}
        >
          Don't have an account?{" "}
          <Text
            style={styles.createAccountText}
            onPress={() => navigate("signup")}
          >
            Create Account
          </Text>
        </Text>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSignInSchema}
          onSubmit={(values) => handleLogin(values)}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            errors,
            touched,
            values,
          }) => (
            <View style={{ flex: 1 }}>
              <Input
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                label="Email"
                id="email"
                keyboardType="email-address"
                errorText={touched.email && errors.email ? errors.email : ""}
              />

              <Input
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                label="Password"
                isPassword
                id="password"
                secureTextEntry
                errorText={
                  touched.password && errors.password ? errors.password : ""
                }
              />

              <Text
                style={[
                  styles.subtitle,
                  { color: dark ? COLORS.white : COLORS.black },
                ]}
              >
                Forgot Password?{" "}
                <Text
                  style={styles.resetPasswordText}
                  onPress={() => {
                    if (!values.email) {
                      showTopToast({
                        type: "error",
                        text1: "Error",
                        text2: "Please enter your email",
                      });
                      return;
                    }
                    handleForgotPassword({ email: values.email });
                  }}
                >
                  {forgotPasswordPending ? "Loading..." : "Click here"}
                </Text>
              </Text>

              <View style={styles.buttonContainer}>
                <Button
                  title="Sign in"
                  onPress={handleSubmit as () => void}
                  isLoading={loginPending}
                  style={{ width: "80%" }}
                />
                <TouchableOpacity onPress={handleBiometricAuth} style={styles.iconButton}>
                  <Image source={icons.fingerPrint} style={styles.fingerprintIcon} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  subtitle: {
    fontSize: 16,
  },
  createAccountText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  resetPasswordText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  iconButton: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  fingerprintIcon: {
    width: 40,
    height: 40,
  },
});

export default Signin;
