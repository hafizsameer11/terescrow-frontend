import { COLORS, icons } from "@/constants";
import { Image } from "expo-image";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import { Formik } from "formik";
import { validationChangePassword } from "@/utils/validation";
import Toast from "react-native-toast-message";
import Input from "./customInput";
import Button from "@/utils/Button";
import { router, useNavigation } from "expo-router";
import { useState } from "react";

const ChangePassword = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const themeStyles = {
    backgroundCont: dark ? COLORS.dark1 : COLORS.white,
    primaryText: dark ? COLORS.white : COLORS.dark1,
  };

  const showSuccessToast = () => {
    Toast.show({
      type: "success",
      text1: "Password Changed",
      text2: "Your password has been successfully updated.",
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });

    setTimeout(() => {
      router.canGoBack() ? router.back() : router.push("/profilesecurity");
    }, 3000);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: themeStyles.backgroundCont }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goBack}
            style={{ position: "absolute", left: 0 }}
          >
            <Image
              source={icons.arrowBack}
              style={{
                width: 20,
                height: 20,
                tintColor: themeStyles.primaryText,
              }}
            />
          </TouchableOpacity>
          <Text
            style={[
              { fontWeight: "bold", fontSize: 22, textAlign: "center" },
              { color: themeStyles.primaryText },
            ]}
          >
            Change Password
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <Formik
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={validationChangePassword}
            onSubmit={(values) => {
              console.log(values);
              setIsSubmitted(true);
              showSuccessToast();
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                <View>
                  <Input
                    label="Current Password"
                    secureTextEntry
                    onChangeText={handleChange("currentPassword")}
                    onBlur={handleBlur("currentPassword")}
                    value={values.currentPassword}
                    prefilledValue={values.currentPassword}
                    errorText={
                      errors.currentPassword && touched.currentPassword
                        ? errors.currentPassword
                        : ""
                    }
                    id="password"
                    keyboardType="default"
                  />
                  <Text
                    style={[
                      { marginBottom: 10, marginTop: -10 },
                      { color: themeStyles.primaryText },
                    ]}
                    onPress={() => router.push("/forgetpassword")}
                  >
                    Forget Password
                    <Text style={{ color: COLORS.primary }}> Reset here</Text>
                  </Text>
                  <Input
                    label="New Password"
                    secureTextEntry
                    onChangeText={handleChange("newPassword")}
                    onBlur={handleBlur("newPassword")}
                    value={values.newPassword}
                    prefilledValue={values.newPassword}
                    errorText={
                      errors.newPassword && touched.newPassword
                        ? errors.newPassword
                        : ""
                    }
                    id="password"
                    keyboardType="default"
                  />
                  <Input
                    label="Re-enter Password"
                    secureTextEntry
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    value={values.confirmPassword}
                    prefilledValue={values.confirmPassword}
                    errorText={
                      errors.confirmPassword && touched.confirmPassword
                        ? errors.confirmPassword
                        : ""
                    }
                    id="password"
                    keyboardType="default"
                  />
                </View>
                <View>
                  <Button
                    title="Save changes"
                    disabled={
                      !(
                        values.currentPassword &&
                        values.newPassword &&
                        values.confirmPassword &&
                        values.newPassword === values.confirmPassword &&
                        !errors.currentPassword &&
                        !errors.newPassword &&
                        !errors.confirmPassword
                      )
                    }
                    onPress={() => handleSubmit()}
                    style={{
                      opacity: !(
                        values.currentPassword &&
                        values.newPassword &&
                        values.confirmPassword &&
                        values.newPassword === values.confirmPassword &&
                        !errors.currentPassword &&
                        !errors.newPassword &&
                        !errors.confirmPassword
                      )
                        ? 0.5
                        : 1,
                    }}
                  />
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flex: 1,
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    justifyContent: "space-between",
    flex: 1,
  },
});

export default ChangePassword;
