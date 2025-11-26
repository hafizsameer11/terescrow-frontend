import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { COLORS, icons } from "@/constants";
import Input from "../components/CustomInput";
import { Formik } from "formik";
import { validationSignInSchema } from "@/utils/validation";
import { useTheme } from "@/contexts/themeContext";
import { useNavigation, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword, loginUser } from "@/utils/mutations/authMutations";
import { showTopToast } from "@/utils/helpers";
import { ApiError } from "@/utils/customApiCalls";
import { useAuth } from "@/contexts/authContext";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { NavigationProp } from "@react-navigation/native";

const { width } = Dimensions.get('window');

const TOKEN_KEY = "USER_TOKEN";
const USER_DATA_KEY = "USER_DATA";
const BIOMETRIC_AUTH_KEY = "BIOMETRIC_AUTH";

const Signin = () => {
  const { dark } = useTheme();
  const { reset, navigate } = useNavigation<NavigationProp<any>>();
  const router = useRouter();
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
      console.log("Login Error:", error);
      console.log("Error Status:", error.statusCode);
      console.log("Error Data:", error.data);
      showTopToast({
        type: "error",
        text1: "Error",
        text2: error.message || "Server error occurred. Please try again.",
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
          const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
          if (now - loginTime < THIRTY_DAYS) {
            setToken(token);
            console.log("token",token)
            console.log("use data",JSON.parse(userDataStr))
            setUserData(JSON.parse(userDataStr));
            reset({
              index: 0,
              routes: [{ name: "(tabs)" }],
            });
          } else {
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


  const isFormValid = (email: string, password: string) => {
    return email.trim().length > 0 && password.trim().length > 0;
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      {/* Back Arrow Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Image
          source={icons.arrowBack}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSignInSchema}
        onSubmit={(values) => {
          console.log("Form submitted with values:", values);
          handleLogin(values);
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          errors,
          touched,
          values,
        }) => {
          const formValid = isFormValid(values.email, values.password);
          
          return (
            <>
              <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.contentContainer}>
                  {/* Title Section */}
                  <View style={styles.titleSection}>
                    <Text style={styles.title}>Sign in</Text>
                    <Text style={styles.subtitle}>
                      Don't have an account?{" "}
                      <Text
                        style={styles.createAccountText}
                        onPress={() => navigate("signup")}
                      >
                        Create account
                      </Text>
                    </Text>
                  </View>

                  {/* Input Fields Section */}
                  <View style={styles.inputsSection}>
                    <View style={styles.inputWrapper}>
                      <Input
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        label="Email Address"
                        id="email"
                        keyboardType="email-address"
                        errorText={touched.email && errors.email ? errors.email : ""}
                        placeholder="Email Address"
                        variant="signin"
                      />
                    </View>

                    <View style={styles.passwordSection}>
                      <View style={styles.inputWrapper}>
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
                          placeholder="Password"
                          variant="signin"
                        />
                      </View>
                      <Text style={styles.forgotPasswordText}>
                        Forgot password?{" "}
                        <Text
                          style={styles.resetPasswordLink}
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
                          Reset here
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Fixed Bottom Button */}
              <View style={styles.bottomContainer}>
                {Platform.OS === 'ios' ? (
                  <BlurView intensity={14} style={styles.blurContainer}>
                    <TouchableOpacity
                      style={[
                        styles.signInButton,
                        formValid ? styles.signInButtonActive : styles.signInButtonInactive,
                      ]}
                      onPress={() => {
                        if (formValid) {
                          handleSubmit();
                        }
                      }}
                      disabled={!formValid || loginPending}
                    >
                      {loginPending ? (
                        <Text style={[styles.signInButtonText, styles.signInButtonTextActive]}>Loading...</Text>
                      ) : (
                        <Text
                          style={[
                            styles.signInButtonText,
                            formValid ? styles.signInButtonTextActive : styles.signInButtonTextInactive,
                          ]}
                        >
                          Sign in
                        </Text>
                      )}
                    </TouchableOpacity>
                  </BlurView>
                ) : (
                  <View style={styles.androidBottomContainer}>
                    <TouchableOpacity
                      style={[
                        styles.signInButton,
                        formValid ? styles.signInButtonActive : styles.signInButtonInactive,
                      ]}
                      onPress={() => {
                        if (formValid) {
                          handleSubmit();
                        }
                      }}
                      disabled={!formValid || loginPending}
                    >
                      {loginPending ? (
                        <Text style={[styles.signInButtonText, styles.signInButtonTextActive]}>Loading...</Text>
                      ) : (
                        <Text
                          style={[
                            styles.signInButtonText,
                            formValid ? styles.signInButtonTextActive : styles.signInButtonTextInactive,
                          ]}
                        >
                          Sign in
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          );
        }}
      </Formik>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 60,
    zIndex: 10,
    width: 24,
    height: 24,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#121212',
  },
  scrollContainer: {
    paddingTop: 108,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  contentContainer: {
    flex: 1,
  },
  titleSection: {
    marginBottom: 32,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#121212',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 15,
    color: '#616161',
    lineHeight: 23,
  },
  createAccountText: {
    color: '#147341',
    fontWeight: '400',
  },
  inputsSection: {
    gap: 24,
  },
  inputWrapper: {
    marginBottom: 0,
  },
  passwordSection: {
    gap: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#8a8a8a',
    lineHeight: 19,
  },
  resetPasswordLink: {
    color: '#147341',
  },
  bottomContainer: {
    marginTop: 'auto',
    paddingTop: 12,
    paddingBottom: 34,
    height: 103,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 254, 254, 0.8)',
  },
  androidBottomContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
  },
  signInButton: {
    width: 327,
    height: 49,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonActive: {
    backgroundColor: '#147341',
  },
  signInButtonInactive: {
    backgroundColor: '#a2dfc2',
    opacity: 0.5,
  },
  signInButtonText: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 21,
  },
  signInButtonTextActive: {
    color: '#FEFEFE',
  },
  signInButtonTextInactive: {
    color: '#147341',
  },
});

export default Signin;
