import { COLORS, icons } from "@/constants";
import { validationEditProfile } from "@/utils/validation";
import { Image } from "expo-image";
import { Formik } from "formik";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Touchable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "./customInput";
import { useNavigation } from "expo-router";
import Button from "@/utils/Button";
import { useTheme } from "@/contexts/themeContext";
const EditProfile = () => {
  const dummyData = {
    firstName: "John",
    lastName: "Doe",
    email: "Y9lR0@example.com",
    country: "Nigeria",
    mobileNumber: "1234567890",
    gender: "Male",
    userName: "johndoe",
  };
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
  }
  return (
    <SafeAreaView style={{ backgroundColor: themeStyles.background }}>
      <ScrollView>
        <View style={styles.container}>
          <TouchableOpacity
            style={{ position: "absolute", left: 15 }}
            onPress={goBack}
          >
            <Image source={icons.arrowBack} style={{ width: 20, height: 20, tintColor: themeStyles.normalText }} />
          </TouchableOpacity>
          <Text style={[{ fontSize: 20, fontWeight: "bold" }, { color: themeStyles.normalText }]}>Edit Profile</Text>
        </View>
        <View style={{ padding: 20 }}>
          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              country: "",
              mobileNumber: "",
              gender: "",
              userName: "",
            }}
            validationSchema={validationEditProfile}
            onSubmit={(values) => console.log(values)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              touched,
              errors,
            }) => (
              <View>
                <Input
                  label="First Name"
                  keyboardType="default"
                  prefilledValue={values.firstName}
                  value={values.firstName}
                  onChangeText={handleChange("firstName")}
                  onBlur={handleBlur("firstName")}
                  id="firstName"
                  errorText={
                    touched.firstName && errors.firstName
                      ? errors.firstName
                      : ""
                  }
                />
                <Input
                  label="Last Name"
                  keyboardType="default"
                  prefilledValue={values.lastName}
                  value={values.lastName}
                  onChangeText={handleChange("lastName")}
                  onBlur={handleBlur("lastName")}
                  id="lastName"
                  errorText={
                    touched.lastName && errors.lastName ? errors.lastName : ""
                  }
                />
                <Input
                  label="Email Address"
                  keyboardType="email-address"
                  prefilledValue={values.email}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  id="email"
                  errorText={touched.email && errors.email ? errors.email : ""}
                />
                <Input
                  label="Country"
                  keyboardType="default"
                  prefilledValue={values.country}
                  value={values.country}
                  onChangeText={handleChange("country")}
                  onBlur={handleBlur("country")}
                  id="country"
                  errorText={
                    touched.country && errors.country ? errors.country : ""
                  }
                />
                <Input
                  label="Mobile Number"
                  keyboardType="phone-pad"
                  prefilledValue={values.mobileNumber}
                  value={values.mobileNumber}
                  onChangeText={handleChange("mobileNumber")}
                  onBlur={handleBlur("mobileNumber")}
                  id="mobileNumber"
                  errorText={
                    touched.mobileNumber && errors.mobileNumber
                      ? errors.mobileNumber
                      : ""
                  }
                />
                <Input
                  label="Gender"
                  keyboardType="default"
                  prefilledValue={values.gender}
                  value={values.gender}
                  onChangeText={handleChange("gender")}
                  onBlur={handleBlur("gender")}
                  id="gender"
                  errorText={
                    touched.gender && errors.gender ? errors.gender : ""
                  }
                />
                <Input
                  label="Username"
                  keyboardType="default"
                  prefilledValue={values.userName}
                  value={values.userName}
                  onChangeText={handleChange("userName")}
                  onBlur={handleBlur("userName")}
                  id="userName"
                  errorText={
                    touched.userName && errors.userName ? errors.userName : ""
                  }
                />
                <View style={{ marginTop: 25 }}>
                  <Button
                    title="Save Changes"
                    onPress={handleSubmit as () => void}
                    disabled={
                      !(
                        values.firstName &&
                        values.lastName &&
                        values.email &&
                        values.country &&
                        values.mobileNumber &&
                        values.gender &&
                        values.userName &&
                        !errors.firstName &&
                        !errors.lastName &&
                        !errors.email &&
                        !errors.country &&
                        !errors.mobileNumber &&
                        !errors.gender &&
                        !errors.userName
                      )
                    }
                    style={{ opacity: !(
                      values.firstName &&
                      values.lastName &&
                      values.email &&
                      values.country &&
                      values.mobileNumber &&
                      values.gender &&
                      values.userName &&
                      !errors.firstName &&
                      !errors.lastName &&
                      !errors.email &&
                      !errors.country &&
                      !errors.mobileNumber &&
                      !errors.gender &&
                      !errors.userName
                    ) ? 0.5 : 1 }}
                  />
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
});

export default EditProfile;
