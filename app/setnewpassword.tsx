import React, { useState } from "react";
import { icons } from "@/constants";
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
import { COLORS } from "@/constants";
import { Formik } from "formik";
import { validationSetNewPassword } from "@/utils/validation";
import Input from "./customInput";
import Button from "@/utils/Button";
import NavigateBack from "@/components/NavigateBack";
import { useNavigation, useRouter } from "expo-router"; // Importing useRouter
import SuccessModal from "./successmodal";

const SetNewPassword = () => {
  const [modalVisible, setModalVisible] = useState(false); // Added state for modal visibility
  const { dark } = useTheme();
  const router = useRouter(); 
  const {goBack} = useNavigation();
  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
  };

  const handleModalPress = () => {
    setModalVisible(false);
    router.push("/(tabs)/chat"); 
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View>
          <TouchableOpacity onPress={goBack}>
            <Image
              source={icons.arrowBack}
              style={{
                width: 20,
                height: 20,
                marginBottom: 10,
                tintColor: themeStyles.normalText,
              }}
            />
          </TouchableOpacity>
          <Text
            style={[
              { fontSize: 23, fontWeight: "bold", marginVertical: 10 },
              { color: themeStyles.normalText },
            ]}
          >
            Set New Password
          </Text>
          <Text style={{ color: themeStyles.normalText }}>
            Fill in the details below to get started.
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={validationSetNewPassword}
            onSubmit={(values) => {
              console.log(values);
              setModalVisible(true); // Show modal after successful submission
            }}
          >
            {({
              handleSubmit,
              handleBlur,
              handleChange,
              errors,
              touched,
              values,
            }) => (
              <View style={[{ flex: 1 }, styles.secondryCont]}>
                <View>
                  <Input
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    keyboardType="default"
                    label="Password"
                    secureTextEntry
                    errorText={
                      touched.password && errors.password ? errors.password : ""
                    }
                    showCheckbox={false}
                    prefilledValue={values.password}
                    id="password"
                  />
                  <Input
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    keyboardType="default"
                    label="Confirm Password"
                    secureTextEntry
                    errorText={
                      touched.confirmPassword && errors.confirmPassword
                        ? errors.confirmPassword
                        : ""
                    }
                    showCheckbox={false}
                    prefilledValue={values.confirmPassword}
                    id="password"
                  />
                </View>
                <View style={{ width: "100%" }}>
                  <Button
                    disabled={
                      !(
                        values.password &&
                        values.confirmPassword &&
                        !errors.password &&
                        !errors.confirmPassword
                      )
                    }
                    title="Complete" // Ensure this is a string
                    style={{
                      opacity:
                        values.password &&
                        values.confirmPassword &&
                        !errors.password &&
                        !errors.confirmPassword
                          ? 1
                          : 0.6,
                    }}
                    onPress={handleSubmit as () => void}
                  />
                </View>
              </View>
            )}
          </Formik>
        </View>
        <SuccessModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          onPress={handleModalPress}
          buttonTitle="Go to dashboard" // Ensure this is a string
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  secondryCont: {
    flexDirection: "column",
    marginTop: 15,
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default SetNewPassword;
