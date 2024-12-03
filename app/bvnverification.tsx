import { COLORS, icons } from "@/constants";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useTheme } from "@/contexts/themeContext";
import { useNavigation } from "expo-router";

import { Formik } from "formik";
import { validationBVNValidation } from "@/utils/validation";
import Input from "./customInput";
import Button from "@/utils/Button";

const BvnVerification = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
    verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View>
            <View style={styles.container}>
              <TouchableOpacity
                style={{ position: "absolute", left: 15 }}
                onPress={goBack}
              >
                <Image
                  source={icons.arrowBack}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: themeStyles.normalText,
                  }}
                />
              </TouchableOpacity>
              <Text
                style={[
                  { fontSize: 20, fontWeight: "bold" },
                  { color: themeStyles.normalText },
                ]}
              >
                BVN Verification
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Formik
                initialValues={{
                  surName: "",
                  firstName: "",
                  bvn: "",
                  dateOfBirth: "",
                }}
                validationSchema={validationBVNValidation}
                onSubmit={(values) => console.log(values)}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <View>
                    <Input
                      label="Surname"
                      onChangeText={handleChange("surName")}
                      keyboardType="default"
                      onBlur={handleBlur("surName")}
                      value={values.surName}
                      errorText={
                        touched.surName && errors.surName ? errors.surName : ""
                      }
                      id="surName"
                      prefilledValue={values.surName}
                    />
                    <Input
                      label="First name"
                      onChangeText={handleChange("firstName")}
                      keyboardType="default"
                      onBlur={handleBlur("firstName")}
                      value={values.firstName}
                      errorText={
                        touched.firstName && errors.firstName
                          ? errors.firstName
                          : ""
                      }
                      id="firstName"
                      prefilledValue={values.firstName}
                    />
                    <Input
                      label="BVN"
                      onChangeText={handleChange("bvn")}
                      keyboardType="default"
                      onBlur={handleBlur("bvn")}
                      value={values.bvn}
                      errorText={touched.bvn && errors.bvn ? errors.bvn : ""}
                      id="bvn"
                      prefilledValue={values.bvn}
                    />
                    <Input
                      label="Date of birth"
                      onChangeText={handleChange("dateOfBirth")}
                      keyboardType="default"
                      onBlur={handleBlur("dateOfBirth")}
                      value={values.dateOfBirth}
                      errorText={
                        touched.dateOfBirth && errors.dateOfBirth
                          ? errors.dateOfBirth
                          : ""
                      }
                      id="dateOfBirth"
                      prefilledValue={values.dateOfBirth}
                    />
                  </View>
                )}
              </Formik>
            </View>
          </View>

          {/* Button at the bottom */}
          <View style={{ padding: 20 }}>
            <Formik
              initialValues={{
                surName: "",
                firstName: "",
                bvn: "",
                dateOfBirth: "",
              }}
              validationSchema={validationBVNValidation}
              onSubmit={(values) => console.log(values)}
            >
              {({ handleSubmit, values, errors }) => (
                <Button
                  title="Continue"
                  onPress={() => handleSubmit()}
                  disabled={
                    !(
                      values.surName &&
                      values.firstName &&
                      values.bvn &&
                      values.dateOfBirth &&
                      !errors.surName &&
                      !errors.firstName &&
                      !errors.bvn &&
                      !errors.dateOfBirth
                    )
                  }
                  style={{
                    opacity:
                      values.surName &&
                      values.firstName &&
                      values.bvn &&
                      values.dateOfBirth &&
                      !errors.surName &&
                      !errors.firstName &&
                      !errors.bvn &&
                      !errors.dateOfBirth
                        ? 1
                        : 0.5,
                  }}
                />
              )}
            </Formik>
          </View>
        </View>
        <Text style={[{ textAlign: "center", paddingHorizontal: 20, paddingBottom: 10 }, { color: themeStyles.normalText }]}>
          An OTP will be send to the number registered to your BNV
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  rowContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
});

export default BvnVerification;
