import React, { useState } from "react";
import { Formik } from "formik";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext"; // Assuming you have a theme context
import { validationSignUpSchema } from "../utils/validation";
import Input from "../components/CustomInput";
import { COLORS, icons, images, SIZES } from "@/constants";
import { Image } from "expo-image";
import Button from "../components/Button";
import Checkbox from "expo-checkbox";
import { router, useNavigation, useRouter } from "expo-router";
import * as Yup from "yup";
import { COUNTRIES, GENDERS } from "@/utils/dummyTrans";
import CustomSelect from "@/components/CustomSelect";
import { NavigationProp } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { registerUser } from "@/utils/mutations/authMutations";
import { ApiError } from "@/utils/customApiCalls";
import { showTopToast } from "@/utils/helpers";
import { useAuth } from "@/contexts/authContext";
import { getAllCountries } from "@/utils/queries/quickActionQueries";
import * as ImagePicker from "expo-image-picker";
const SignUp = () => {
  const { dark } = useTheme();
  const { navigate, reset } = useNavigation<NavigationProp<any>>();
  const { setToken } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const {
    data: CountriesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["get-countries"],
    queryFn: () => getAllCountries(),
  });

  const { mutate: signUp, isPending } = useMutation({
    mutationKey: ["signup"],
    mutationFn: registerUser,
    onSuccess: async (data) => {
      setToken(data.token)
        .then(() => {
          reset({
            index: 0,
            routes: [{ name: "otpverification" }],
          });
          navigate("otpverification", {
            context: "signup",
            email: null,
          });
        })
        .catch((error) => {
          showTopToast({
            type: "error",
            text1: "Error",
            text2: error.message,
          });
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

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access media is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      console.log("Selected Profile Image:", imageUri); // Log directly
    }
  };

  const handleSubmit = async (
    values: Yup.InferType<typeof validationSignUpSchema>
  ) => {
    const formData = new FormData();

    // Append text fields
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Append profile picture if available
    if (profileImage) {
      formData.append("profilePicture", {
        uri: profileImage,
        type: "image/jpeg",
        name: "profile.jpg",
      } as unknown as Blob);
    }
    signUp(formData);
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
              onPress={() => navigate("signin")}
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
            username: "",
            password: "",
            gender: "male",
            termsAccepted: false,
            country: "",
          }}
          // validationSchema={validationSignUpSchema}
          onSubmit={(values) => {
            console.log(values);
            handleSubmit(values);
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
            // console.log(values);
            return (
              <View style={{ marginBottom: SIZES.padding3 }}>
                <TouchableOpacity
                  onPress={handleImagePicker}
                  style={{
                    alignItems: "center",
                    marginVertical: 20,
                  }}
                >
                  <View>
                    <Image
                      source={
                        profileImage
                          ? { uri: profileImage }
                          : images.userProfile
                      }
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        marginBottom: 10,
                      }}
                    />
                    {profileImage && (
                      <View style={styles.editIcon}>
                        <Image
                          style={{ width: 23, height: 23 }}
                          source={icons.edit}
                        />
                      </View>
                    )}
                  </View>
                  <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
                    {profileImage
                      ? "Change Profile Picture"
                      : "Add Profile Picture"}
                  </Text>
                </TouchableOpacity>
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
                  prefilledValue={values.email}
                  id="email"
                />

                {CountriesData?.data && (
                  <CustomSelect
                    options={CountriesData?.data}
                    currValue={values.country}
                    error={errors.country}
                    touched={touched.country}
                    placeholder="Select Country"
                    id="country"
                    setFieldValue={setFieldValue}
                    modalLabel="Country"
                  />
                )}

                <Input
                  keyboardType="phone-pad"
                  value={values.phoneNumber}
                  onChangeText={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                  label="Phone Number"
                  errorText={
                    touched.phoneNumber && errors.phoneNumber
                      ? errors.phoneNumber
                      : undefined
                  }
                  prefilledValue={values.phoneNumber}
                  id="phoneNumber"
                />

                <Input
                  value={values.username}
                  onChangeText={handleChange("username")}
                  keyboardType="default"
                  onBlur={handleBlur("username")}
                  label="Username"
                  errorText={
                    touched.username && errors.username ? errors.username : ""
                  }
                  prefilledValue={values.username}
                  id="username"
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
                  prefilledValue={values.password}
                  isPassword
                  id="password"
                />

                {/* Gender text container */}
                <CustomSelect
                  options={GENDERS}
                  currValue={values.gender} 
                  error={errors.gender}
                  touched={touched.gender}
                  placeholder="Select Gender"
                  id="gender"
                  setFieldValue={setFieldValue}
                  key={values.gender}
                  modalLabel="Gender"
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
                    error={errors.termsAccepted}
                    
                    // onValueChange={handleChange("") as unknown as ((value: boolean) => void)}
                    color={values.termsAccepted ? COLORS.primary : undefined}
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
                    isLoading={isPending}
                    onPress={handleSubmit as any}
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

const styles = StyleSheet.create({
  editIcon: {
    width: 35,
    height: 35,
    position: "absolute",
    bottom: 10,
    right: 0,
    backgroundColor: COLORS.warning,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignUp;
