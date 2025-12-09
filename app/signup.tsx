import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import { validationSignUpSchema } from "../utils/validation";
import Input from "../components/CustomInput";
import { COLORS, icons, images, SIZES } from "@/constants";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import Checkbox from "expo-checkbox";
import { router, useNavigation, useRouter } from "expo-router";
import * as Yup from "yup";
import { COUNTRIES, GENDERS, WayOfHearing } from "@/utils/dummyTrans";
import CustomSelect from "@/components/CustomSelect";
import { NavigationProp } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { registerUser } from "@/utils/mutations/authMutations";
import { ApiError } from "@/utils/customApiCalls";
import { showTopToast } from "@/utils/helpers";
import { useAuth } from "@/contexts/authContext";
import { getAllCountries, getPrivacyPageLinks, getWaysOfHearing, WaysOfHearingResponse } from "@/utils/queries/quickActionQueries";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get('window');

const SignUp = () => {
  const { dark } = useTheme();
  const { navigate, reset } = useNavigation<NavigationProp<any>>();
  const { setToken } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const token = '';
  const {
    data: CountriesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["get-countries"],
    queryFn: async () => {
      try {
        return await getAllCountries();
      } catch (error: any) {
        // Handle error locally without triggering global logout
        console.log("Error fetching countries:", error);
        // Return empty data structure to prevent error propagation
        return { data: [], status: "error", message: error?.message || "Failed to fetch countries" };
      }
    },
    enabled: true,
    retry: false,
    throwOnError: false, // Prevent error from propagating to global handler
  });

  const { data: wayofHearings, isLoading: wayOfHearingLoading } = useQuery<WaysOfHearingResponse>({
    queryKey: ['waysOfHearing'],
    queryFn: async () => {
      try {
        return await getWaysOfHearing();
      } catch (error: any) {
        // Handle error locally without triggering global logout
        console.log("Error fetching ways of hearing:", error);
        // Return empty data structure matching WaysOfHearingResponse format
        return { 
          data: { list: [], grouped: [] }, 
          status: "error", 
          message: error?.message || "Failed to fetch ways of hearing" 
        } as WaysOfHearingResponse;
      }
    },
    enabled: true,
    retry: false,
    throwOnError: false, // Prevent error from propagating to global handler
  });

  const { data: privacyData } = useQuery({
    queryKey: ['privacy'],
    queryFn: async () => {
      try {
        return await getPrivacyPageLinks();
      } catch (error: any) {
        // Handle error locally without triggering global logout
        console.log("Error fetching privacy links:", error);
        // Return empty data structure to prevent error propagation
        return { data: null, status: "error", message: error?.message || "Failed to fetch privacy links" };
      }
    },
    enabled: true,
    retry: false,
    throwOnError: false, // Prevent error from propagating to global handler
  })
  console.log("countries",CountriesData?.data," wayOfHearing",wayofHearings?.data)
  const handlePress = async (url: string) => {
    // Check if the URL can be opened
    console.log(url)
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Open the URL in the default browser
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };
  const [signupEmail, setSignupEmail] = useState<string>("");

  const { mutate: signUp, isPending } = useMutation({
    mutationKey: ["signup"],
    mutationFn: registerUser,
    onSuccess: async (data) => {
      // Get email from stored signupEmail state (set before calling signUp)
      const userEmail = signupEmail || data.data?.email || data.data?.user?.email;
      console.log("Signup success - email:", userEmail, "signupEmail state:", signupEmail, "data:", data);
      
      setToken(data.token)
        .then(() => {
          reset({
            index: 0,
            routes: [{ name: "otpverification" }],
          });
          navigate("otpverification", {
            context: "signup",
            email: userEmail, // Pass the email from registration
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
      console.log("Selected Profile Image:", imageUri);
    }
  };

  const handleSubmit = async (
    values: Yup.InferType<typeof validationSignUpSchema> & { referralCode?: string }
  ) => {
    const formData = new FormData();

    // Append text fields
    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'referralCode' && value !== undefined && value !== null) {
        formData.append(key, value as string);
        console.log("form data", value, key)
      }
    });

    // Append referral code if provided
    if (values.referralCode) {
      formData.append("referralCode", values.referralCode);
    }

    // Append profile picture if available
    if (profileImage) {
      formData.append("profilePicture", {
        uri: profileImage,
        type: "image/jpeg",
        name: "profile.jpg",
      } as unknown as Blob);
    }

    // Store email before calling signUp so we can use it in onSuccess
    setSignupEmail(values.email);
    signUp(formData as any);
  };

  useEffect(() => {
    if (wayofHearings) {
      console.log("ways of hearing", wayofHearings.data.list)
    }
  })

  const isFormValid = (values: any) => {
    return values.firstName && values.lastName && values.email && 
           values.phoneNumber && values.username && values.password && 
           values.country && values.gender && values.termsAccepted;
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
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          username: "",
          password: "",
          gender: 1,
          termsAccepted: false,
          country: 1,
          means: 1,
          referralCode: ""
        }}
        validationSchema={validationSignUpSchema}
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
          const formValid = isFormValid(values);

          return (
            <>
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.contentContainer}>
                  {/* Title Section */}
                  <View style={styles.titleSection}>
                    <Text style={styles.title}>Create an account</Text>
                    <Text style={styles.subtitle}>
                      Fill in the details below to get started.
                    </Text>
                  </View>

                  {/* Profile Picture Section */}
                  <TouchableOpacity
                    onPress={handleImagePicker}
                    style={styles.profilePictureContainer}
                  >
                    <View>
                      <Image
                        source={
                          profileImage
                            ? { uri: profileImage }
                            : images.userProfile
                        }
                        style={styles.profileImage}
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
                    <Text style={styles.profilePictureText}>
                      {profileImage
                        ? "Change Profile Picture"
                        : "Add Profile Picture"}
                    </Text>
                  </TouchableOpacity>

                  {/* Input Fields Section */}
                  <View style={styles.inputsSection}>
                    <View style={styles.inputWrapper}>
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
                        placeholder="First Name"
                        id="firstName"
                        variant="signin"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Input
                        value={values.lastName}
                        onChangeText={handleChange("lastName")}
                        keyboardType="default"
                        onBlur={handleBlur("lastName")}
                        label="Last Name"
                        errorText={
                          touched.lastName && errors.lastName ? errors.lastName : ""
                        }
                        placeholder="Last Name"
                        id="lastName"
                        variant="signin"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Input
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        label="Email Address"
                        keyboardType="email-address"
                        errorText={touched.email && errors.email ? errors.email : ""}
                        placeholder="Email Address"
                        id="email"
                        variant="signin"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <CustomSelect
                        options={COUNTRIES}
                        currValue={values.country.toString()}
                        error={errors.country}
                        touched={touched.country}
                        placeholder="Country"
                        id="country"
                        setFieldValue={setFieldValue}
                        modalLabel="Country"
                        isSignup={true}
                        variant="signin"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Input
                        keyboardType="phone-pad"
                        value={values.phoneNumber}
                        onChangeText={handleChange("phoneNumber")}
                        onBlur={handleBlur("phoneNumber")}
                        label="Mobile Number"
                        errorText={
                          touched.phoneNumber && errors.phoneNumber
                            ? errors.phoneNumber
                            : ""
                        }
                        placeholder="Mobile Number"
                        id="phoneNumber"
                        variant="signin"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Input
                        value={values.username}
                        onChangeText={handleChange("username")}
                        keyboardType="default"
                        onBlur={handleBlur("username")}
                        label="Username"
                        errorText={
                          touched.username && errors.username ? errors.username : ""
                        }
                        placeholder="Username"
                        id="username"
                        variant="signin"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
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
                        placeholder="Password"
                        isPassword
                        id="password"
                        variant="signin"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <CustomSelect
                        options={GENDERS}
                        currValue={values.gender.toString()}
                        error={errors.gender}
                        touched={touched.gender}
                        placeholder="Gender"
                        id="gender"
                        setFieldValue={setFieldValue}
                        key={values.gender}
                        modalLabel="Gender"
                        isSignup={true}
                        variant="signin"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Input
                        value={values.referralCode}
                        onChangeText={handleChange("referralCode")}
                        onBlur={handleBlur("referralCode")}
                        keyboardType="default"
                        label="Referral code? (optional)"
                        placeholder="Referral code? (optional)"
                        id="referralCode"
                        variant="signin"
                      />
                    </View>

                    {/* Referral Code Banner */}
                    {values.referralCode && (
                      <View style={styles.referralBanner}>
                        <Text style={styles.referralBannerText}>
                          Input a referral code to get 100% on your first trade (T&C applies)
                        </Text>
                      </View>
                    )}

                    {/* Terms and Conditions Checkbox */}
                    <View style={styles.checkboxContainer}>
                      <Checkbox
                        style={styles.checkbox}
                        value={values.termsAccepted}
                        onValueChange={(value) =>
                          setFieldValue("termsAccepted", value)
                        }
                        color={values.termsAccepted ? COLORS.primary : undefined}
                      />
                      <Text style={styles.checkboxText}>
                        I agree to the{" "}
                        <Text
                          style={styles.linkText}
                          onPress={() => { 
                            const termsLink = (privacyData as any)?.data?.termsPageLink;
                            if (termsLink) handlePress(termsLink);
                          }}
                        >
                          Terms of Service
                        </Text>
                        {" and "}
                        <Text
                          style={styles.linkText}
                          onPress={() => { 
                            const privacyLink = (privacyData as any)?.data?.privacyPageLink;
                            if (privacyLink) handlePress(privacyLink);
                          }}
                        >
                          Privacy Policy
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
                        styles.createAccountButton,
                        formValid ? styles.createAccountButtonActive : styles.createAccountButtonInactive,
                      ]}
                      onPress={handleSubmit as () => void}
                      disabled={!formValid || isPending}
                    >
                      {isPending ? (
                        <Text style={[styles.createAccountButtonText, styles.createAccountButtonTextActive]}>Loading...</Text>
                      ) : (
                        <Text
                          style={[
                            styles.createAccountButtonText,
                            formValid ? styles.createAccountButtonTextActive : styles.createAccountButtonTextInactive,
                          ]}
                        >
                          Create an account
                        </Text>
                      )}
                    </TouchableOpacity>
                  </BlurView>
                ) : (
                  <View style={styles.androidBottomContainer}>
                    <TouchableOpacity
                      style={[
                        styles.createAccountButton,
                        formValid ? styles.createAccountButtonActive : styles.createAccountButtonInactive,
                      ]}
                      onPress={handleSubmit as () => void}
                      disabled={!formValid || isPending}
                    >
                      {isPending ? (
                        <Text style={[styles.createAccountButtonText, styles.createAccountButtonTextActive]}>Loading...</Text>
                      ) : (
                        <Text
                          style={[
                            styles.createAccountButtonText,
                            formValid ? styles.createAccountButtonTextActive : styles.createAccountButtonTextInactive,
                          ]}
                        >
                          Create an account
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
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
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
  profilePictureText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  inputsSection: {
    gap: 24,
  },
  inputWrapper: {
    marginBottom: 0,
  },
  referralBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 10,
    marginTop: -16,
    marginBottom: 8,
  },
  referralBannerText: {
    fontSize: 14,
    color: '#147341',
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 16,
  },
  checkbox: {
    borderRadius: 4,
    marginTop: 2,
    marginRight: 8,
  },
  checkboxText: {
    flex: 1,
    color: '#616161',
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: '#147341',
    textDecorationLine: "underline",
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  createAccountButton: {
    width: 327,
    height: 49,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountButtonActive: {
    backgroundColor: '#147341',
  },
  createAccountButtonInactive: {
    backgroundColor: '#a2dfc2',
    opacity: 0.5,
  },
  createAccountButtonText: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 21,
  },
  createAccountButtonTextActive: {
    color: '#FEFEFE',
  },
  createAccountButtonTextInactive: {
    color: '#147341',
  },
});

export default SignUp;
