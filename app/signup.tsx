import React, { useState } from 'react';
import { Formik } from 'formik';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/themeContext'; // Assuming you have a theme context
import { validationSignUpSchema } from '../utils/validation';
import Input from '../components/CustomInput';
import { COLORS, icons, SIZES } from '@/constants';
import { Image } from 'expo-image';
import Button from '../components/Button';
import Checkbox from 'expo-checkbox';
import { router, useNavigation, useRouter } from 'expo-router';
import * as Yup from 'yup';
import { COUNTRIES, GENDERS } from '@/utils/dummyTrans';
import CustomSelect from '@/components/CustomSelect';
import { NavigationProp } from '@react-navigation/native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { registerUser } from '@/utils/mutations/authMutations';
import { ApiError } from '@/utils/customApiCalls';
import { showTopToast } from '@/utils/helpers';
import { useAuth } from '@/contexts/authContext';
import { getAllCountries } from '@/utils/queries/quickActionQueries';

const SignUp = () => {
  const { dark } = useTheme();
  const { navigate, reset } = useNavigation<NavigationProp<any>>();
  const { setToken } = useAuth();

  const {
    data: CountriesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['get-countries'],
    queryFn: () => getAllCountries(),
  });

  const { mutate: signUp, isPending } = useMutation({
    mutationKey: ['signup'],
    mutationFn: registerUser,
    onSuccess: async (data) => {
      setToken(data.token)
        .then(() => {
          reset({
            index: 0,
            routes: [{ name: 'otpverification' }],
          });
          navigate('otpverification', {
            context: 'signup',
            email: null,
          });
        })
        .catch((error) => {
          showTopToast({
            type: 'error',
            text1: 'Error',
            text2: error.message,
          });
        });
    },
    onError: (error: ApiError) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    },
  });

  const handleSubmit = async (
    values: Yup.InferType<typeof validationSignUpSchema>
  ) => {
    signUp(values);
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
              fontWeight: 'bold',
              color: dark ? COLORS.white : COLORS.black,
            }}
          >
            Create an Account
          </Text>
          <Text
            style={{
              fontSize: SIZES.h4,
              fontWeight: 'normal',
              color: dark ? COLORS.white : COLORS.black,
            }}
          >
            Already have an account?{' '}
            <Text
              onPress={() => navigate('signin')}
              style={{
                fontSize: SIZES.h4,
                fontWeight: 'bold',
                color: COLORS.primary,
              }}
            >
              Sign In
            </Text>
          </Text>
        </View>

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            username: '',
            password: '',
            gender: 'male',
            termsAccepted: false,
            country: '',
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
                <Input
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  keyboardType="default"
                  label="First Name"
                  errorText={
                    touched.firstName && errors.firstName
                      ? errors.firstName
                      : ''
                  }
                  showCheckbox={false}
                  prefilledValue={values.firstName}
                  id="firstName"
                />

                <Input
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  keyboardType="default"
                  onBlur={handleBlur('lastName')}
                  label="Last Name"
                  errorText={
                    touched.lastName && errors.lastName ? errors.lastName : ''
                  }
                  showCheckbox={false}
                  prefilledValue={values.lastName}
                  id="lastName"
                />

                <Input
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  label="Email"
                  keyboardType="email-address"
                  errorText={touched.email && errors.email ? errors.email : ''}
                  showCheckbox={false}
                  prefilledValue={values.email}
                  id="email"
                />

                {CountriesData?.data && (
                  <CustomSelect
                    options={CountriesData.data}
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
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  label="Phone Number"
                  errorText={
                    touched.phoneNumber && errors.phoneNumber
                      ? errors.phoneNumber
                      : undefined
                  }
                  showCheckbox={false}
                  prefilledValue={values.phoneNumber}
                  id="phoneNumber"
                />

                <Input
                  value={values.username}
                  onChangeText={handleChange('username')}
                  keyboardType="default"
                  onBlur={handleBlur('username')}
                  label="Username"
                  errorText={
                    touched.username && errors.username ? errors.username : ''
                  }
                  showCheckbox={false}
                  prefilledValue={values.username}
                  id="username"
                />

                <Input
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  keyboardType="default"
                  label="Password"
                  secureTextEntry
                  errorText={
                    touched.password && errors.password ? errors.password : ''
                  }
                  showCheckbox={false}
                  prefilledValue={values.password}
                  id="password"
                />

                {/* Gender text container */}
                <CustomSelect
                  options={GENDERS}
                  currValue={values.gender}  // Correctly bound to Formik's state
                  error={errors.gender}
                  touched={touched.gender}
                  placeholder="Select Gender"
                  id="gender"
                  setFieldValue={setFieldValue}
                  modalLabel="Gender"
                  onSelectOverride={(value) => {
                    const selectedOption = GENDERS.find((o) => o.title === value);
                    if (selectedOption) {
                      setFieldValue("gender", selectedOption.title);  // Update Formik state
                    }
                  }}
                />


                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 15,
                  }}
                >
                  <Checkbox
                    style={{ borderRadius: 50, marginTop: 3 }}
                    id="termsAccepted"
                    value={values.termsAccepted}
                    onValueChange={(value) =>
                      setFieldValue('termsAccepted', value)
                    }
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
                    I agree to the{' '}
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontSize: 12,
                        textDecorationLine: 'underline',
                      }}
                    >
                      Terms of Service
                    </Text>
                    {' and '}
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontSize: 12,
                        textDecorationLine: 'underline',
                      }}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                </View>
                {/* <Button onPress={handleSubmit} title="Create an Account"/> */}
                <View style={{ marginTop: 25, width: '100%' }}>
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

export default SignUp;
