import React, { useState } from "react";
import { Formik } from "formik";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext"; // Assuming you have a theme context
import { validationSignUpSchema } from "../utils/validation";
import Input from "./customInput";
import { COLORS, icons, SIZES } from "@/constants";
import CustomModal from "./CountriesModal";
import { Image } from "expo-image";
import Button from "../utils/Button";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import * as Yup from "yup";

const SignUp = () => {
  const { dark } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"gender" | "country">("country");
  const [isChecked, setChecked] = useState(false);
  const { push } = useRouter();

  function handleCountrySelect(country: string, setFieldValue: Function) {
    setFieldValue("country", country);
    setIsModalVisible(false);
  }

  // Handle gender selection
  function handleGenderSelect(gender: string, setFieldValue: Function) {
    setFieldValue("gender", gender);
    setIsModalVisible(false);
  }

  const handleFieldPress = (fieldType: "country" | "gender") => {
    setModalType(fieldType);
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: SIZES.padding2,
        backgroundColor: dark ? COLORS.dark1 : COLORS.white,
      }}
    >
      <ScrollView contentContainerStyle={{ padding: SIZES.padding2 }}>
        <View style={{ marginBottom: SIZES.padding3 }}>
          <Image source={icons.arrowLeft} style={{ width: 22, height: 22 }} />
          <Text
            style={{
              fontSize: SIZES.h2,
              paddingVertical: SIZES.padding,
              fontWeight: "bold",
              color: dark ? COLORS.white : COLORS.black,
            }}
          >
            Create an Account
          </Text>
          <Text
            style={{
              fontSize: SIZES.h4,
              fontWeight: "normal",
              color: dark ? COLORS.white : COLORS.black,
            }}
          >
            Already have an account?{" "}
            <Text
              onPress={() => push("/signin")}
              style={{
                fontSize: SIZES.h4,
                fontWeight: "bold",
                color: COLORS.primary,
              }}
            >
              Sign In
            </Text>
          </Text>
        </View>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            userName: "",
            password: "",
            gender: "",
            termsAccepted: false,
            country: "",
          }}
          validationSchema={validationSignUpSchema}
          onSubmit={(values) => {
            console.log(values);
            push({ pathname: '/otpverification', params: { context: 'signup' }});
          }}
        >
          {({
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            setFieldValue,
            handleSubmit,
          }) => {
            console.log(values);
            return (
              <View style={{ marginBottom: SIZES.padding3 }}>
                <Input
                  value={values.firstName}
                  onChangeText={handleChange("firstName")}
                  onBlur={handleBlur("firstName")}
                  keyboardType="default"
                  label="First Name"
                  errorText={
                    touched.firstName && errors.firstName
                      ? errors.firstName
                      : ""
                  }
                  showCheckbox={false}
                  prefilledValue={values.firstName}
                  id="firstName"
                />

                <Input
                  value={values.lastName}
                  onChangeText={handleChange("lastName")}
                  keyboardType="default"
                  onBlur={handleBlur("lastName")}
                  label="Last Name"
                  errorText={
                    touched.lastName && errors.lastName ? errors.lastName : ""
                  }
                  showCheckbox={false}
                  prefilledValue={values.lastName}
                  id="lastName"
                />

                <Input
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  label="Email"
                  keyboardType="email-address"
                  errorText={touched.email && errors.email ? errors.email : ""}
                  showCheckbox={false}
                  prefilledValue={values.email}
                  id="email"
                />

                <TouchableOpacity onPress={() => handleFieldPress("country")}>
                  <View
                    style={{
                      height: 50,
                      borderWidth: 1,
                      borderColor: COLORS.greyscale600,
                      paddingHorizontal: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 7,
                      marginBottom: 16,
                      borderRadius: SIZES.padding,
                    }}
                  >
                    <Text
                      style={{
                        color: values.country
                          ? dark
                            ? "#E2D9EC"
                            : COLORS.grayscale700
                          : dark
                          ? COLORS.greyscale300
                          : COLORS.greyscale600,
                        fontSize: 16,
                      }}
                    >
                      {values.country || "Select Country"}
                    </Text>

                    <Image
                      source={icons.arrowRight}
                      style={{
                        width: 18,
                        height: 18,
                        tintColor: dark
                          ? COLORS.greyscale300
                          : COLORS.greyscale600,
                      }}
                    />
                  </View>

                  {errors.country && touched.country && (
                    <Text
                      style={{
                        color: COLORS.red,
                        marginTop: 5,
                        fontSize: 12, 
                        marginBottom: SIZES.padding2,
                      }}
                    >
                      {errors.country}
                    </Text>
                  )}
                </TouchableOpacity>

                <Input
                  keyboardType="phone-pad"
                  value={values.phoneNumber}
                  onChangeText={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                  label="Phone Number"
                  errorText={
                    touched.phoneNumber && errors.phoneNumber
                      ? errors.phoneNumber
                      : ""
                  }
                  showCheckbox={false}
                  prefilledValue={values.phoneNumber}
                  id="phoneNumber"
                />

                <Input
                  value={values.userName}
                  onChangeText={handleChange("userName")}
                  keyboardType="default"
                  onBlur={handleBlur("userName")}
                  label="Username"
                  errorText={
                    touched.userName && errors.userName ? errors.userName : ""
                  }
                  showCheckbox={false}
                  prefilledValue={values.userName}
                  id="userName"
                />

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

                {/* Gender text container */}
                <TouchableOpacity onPress={() => handleFieldPress("gender")}>
                  <View
                    style={{
                      height: 50,
                      borderWidth: 1,
                      borderColor: COLORS.greyscale600,
                      paddingHorizontal: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: SIZES.padding,
                      marginTop: SIZES.padding2,
                    }}
                  >
                    {/* Gender Text */}
                    <Text
                      style={{
                        color: values.gender
                          ? dark
                            ? COLORS.white
                            : COLORS.black
                          : dark
                          ? COLORS.greyscale300
                          : COLORS.greyscale600,
                        fontSize: 16, // Adjust font size for better readability
                      }}
                    >
                      {values.gender || "Select Gender"}
                    </Text>

                    {/* Arrow Icon */}
                    <Image
                      source={icons.arrowRight} // Replace with the actual source of your icon
                      style={{
                        width: 18,
                        height: 18,
                        tintColor: dark
                          ? COLORS.greyscale300
                          : COLORS.greyscale600, // Icon color matching theme
                      }}
                    />
                  </View>

                  {/* Error Message */}
                  {errors.gender && touched.gender && (
                    <Text
                      style={{
                        color: COLORS.red,
                        marginTop: 5,
                        fontSize: 12, // Adjust error text size
                      }}
                    >
                      {errors.gender}
                    </Text>
                  )}
                </TouchableOpacity>

                <CustomModal
                  isVisible={isModalVisible}
                  onEditPress={handleFieldPress}
                  onSelect={
                    modalType === "country"
                      ? (selection: string) =>
                          handleCountrySelect(selection, setFieldValue)
                      : (selection: string) =>
                          handleGenderSelect(selection, setFieldValue)
                  }
                  onClose={() => setIsModalVisible(false)}
                  type={modalType}
                  setFieldValue={setFieldValue}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 15,
                  }}
                >
                  <Checkbox
                    style={{ borderRadius: 50, marginTop: 3 }}
                    id="termsAccepted"
                    value={values.termsAccepted}
                    onValueChange={(value) =>
                      setFieldValue("termsAccepted", value)
                    }
                    // onValueChange={handleChange("") as unknown as ((value: boolean) => void)}
                    color={isChecked ? COLORS.primary : undefined}
                  />
                  <Text
                    style={{
                      color: dark ? COLORS.greyscale300 : COLORS.greyscale600,
                      fontSize: 12,
                      marginLeft: 5,
                      marginTop: 5,
                      marginBottom: 5,
                    }}
                  >
                    I agree to the{" "}
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontSize: 12,
                        textDecorationLine: "underline",
                      }}
                    >
                      Terms of Service
                    </Text>
                    {" and "}
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontSize: 12,
                        textDecorationLine: "underline",
                      }}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                </View>
                {/* <Button onPress={handleSubmit} title="Create an Account"/> */}
                <View style={{ marginTop: 25, width: "100%" }}>
                  <Button
                    title="Create an Account"
                    onPress={handleSubmit as () => void}
                  />
                </View>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
