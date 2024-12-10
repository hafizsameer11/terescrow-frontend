import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import FONTS from '@/constants/fonts';
import Input from '../components/CustomInput';
import Button from '../components/Button';
import { Formik } from 'formik';
import { validationSignInSchema } from '@/utils/validation';
import { useTheme } from '@/contexts/themeContext';
import { useNavigation, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword, loginUser } from '@/utils/mutations/authMutations';
import { NavigationProp } from '@react-navigation/native';
import { showTopToast } from '@/utils/helpers';
import { ApiError } from '@/utils/customApiCalls';
import { useAuth } from '@/contexts/authContext';

const Signin = () => {
  const { dark } = useTheme();
  const { navigate, reset } = useNavigation<NavigationProp<any>>();
  const { setToken } = useAuth();

  const { mutate: handleLogin, isPending: loginPending } = useMutation({
    mutationFn: loginUser,
    mutationKey: ['login'],
    onSuccess: async (data) => {
      await setToken(data.token);
      reset({
        index: 0,
        routes: [{ name: '(tabs)' }],
      });
      navigate('(tabs)');
    },
    onError: (error: ApiError) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    },
  });

  const { mutate: handleForgotPassword, isPending: forgotPasswordPending } =
    useMutation({
      mutationKey: ['forgot-password'],
      mutationFn: forgotPassword,
      onSuccess: (data) => {
        navigate('otpverification', {
          context: 'forgot-password',
          email: data.data.email,
        });
      },
    });

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: dark ? COLORS.dark1 : COLORS.white },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Section */}
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
            { color: dark ? COLORS.white : COLORS.black },
          ]}
        >
          Don't have an account?{' '}
          <Text
            style={styles.createAccountText}
            onPress={() => navigate('signup')}
          >
            Create Account
          </Text>
        </Text>

        <View style={styles.formContainer}>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSignInSchema}
            onSubmit={(values) => {
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
            }) => (
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Input
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    label="Email"
                    keyboardType="email-address"
                    errorText={
                      touched.email && errors.email ? errors.email : ''
                    }
                    showCheckbox={false}
                    prefilledValue={values.email}
                    id="email"
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
                  <View>
                    <Text
                      style={[
                        styles.subtitle,
                        { color: dark ? COLORS.white : COLORS.black },
                      ]}
                    >
                      Forgot Password?{' '}
                      {/* <TouchableOpacity>
                        
                      </TouchableOpacity> */}
                      <Text
                        style={styles.resetPasswordText}
                        onPress={() => {
                          if (!values.email) {
                            showTopToast({
                              type: 'error',
                              text1: 'Error',
                              text2: 'Please enter your email',
                            });
                            return;
                          }
                          handleForgotPassword({
                            email: values.email,
                          });
                        }}
                      >
                        {forgotPasswordPending ? 'Loading...' : 'Click here'}
                      </Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Sign in"
                    onPress={handleSubmit as () => void}
                    isLoading={loginPending}
                    style={[
                      styles.button,
                      {
                        opacity: !(
                          values.email &&
                          values.password &&
                          !errors.email &&
                          !errors.password
                        )
                          ? 0.6
                          : 1,
                      },
                    ]}
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
    fontWeight: 'bold',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
  },
  createAccountText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  formContainer: {
    marginTop: 20,
    flex: 1,
  },
  input: {
    marginBottom: 8,
  },
  resetPasswordText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    color: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Signin;
