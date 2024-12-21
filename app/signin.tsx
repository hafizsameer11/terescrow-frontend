import React, { useEffect } from "react";
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
import { COLORS, icons } from "@/constants";
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
// import * as SecureStore from 'expo-secure-store';
// Secure Store Keys
const TOKEN_KEY = "USER_TOKEN";
const USER_DATA_KEY = "USER_DATA";
const BIOMETRIC_AUTH_KEY = "BIOMETRIC_AUTH";

const Signin = () => {
  const { dark } = useTheme();
  const { reset, navigate } = useNavigation<NavigationProp<any>>();
  const { setToken, setUserData } = useAuth();

  // Handle Biometric Authentication
  const handleBiometricAuth = async () => {
    try {
      const isBiometricEnabled = await SecureStore.getItemAsync(BIOMETRIC_AUTH_KEY);
      if (isBiometricEnabled !== "true") return;

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

  // React Query Mutations
  const { mutate: handleLogin, isPending: loginPending } = useMutation({
    mutationFn: loginUser,
    mutationKey: ["login"],
    onSuccess: async (data) => {
      const { token, data: userData } = data;
      setToken(token);
      setUserData(userData);
      console.log(token, userData);
      // Save Token & User Data Securely
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
      await SecureStore.setItemAsync(BIOMETRIC_AUTH_KEY, "true");

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
    });

  useEffect(() => {
    handleBiometricAuth();
  }, []);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: dark ? COLORS.dark1 : COLORS.white },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Image
              source={icons.arrowBack}
              style={[
                styles.backIcon,
                { tintColor: dark ? COLORS.white : COLORS.black },
              ]}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              { color: dark ? COLORS.white : COLORS.black },
            ]}
          >
            Sign in
          </Text>
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

              <Button
                title="Sign in"
                onPress={handleSubmit as () => void}
                isLoading={loginPending}
                style={{ marginTop: 10, position: 'absolute', bottom: 0, width: '100%' }}
              />
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
  header: {
    marginBottom: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 15,
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
});

export default Signin;
