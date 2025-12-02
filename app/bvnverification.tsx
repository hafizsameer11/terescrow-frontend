import React, { useState } from 'react';
import { COLORS, icons } from '@/constants';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/themeContext';
import { useNavigation } from 'expo-router';

import { Formik } from 'formik';
import { validationBVNValidation } from '@/utils/validation';
import Input from '@/components/CustomInput';
import Button from '@/components/Button';
import { KyCRequest } from '@/utils/mutations/authMutations';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { router } from 'expo-router';
import { showTopToast } from '@/utils/helpers';
import DateTimePicker from '@react-native-community/datetimepicker';

const BvnVerification = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const { token, userData } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
    verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
  };

  const { mutate: submitBVN } = useMutation({
    mutationKey: ['submitBVN'],
    mutationFn: (values: { surName: string; firstName: string; bvn: string; dob: string }) => KyCRequest(values, token),
    onSuccess: (data) => {
      router.push('/profile');
      console.log('Submission Successful:', data);
    },
    onError: (error) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
      router.push('/profile');
      console.error('Submission Failed:', error);
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <View style={styles.container}>
              <TouchableOpacity
                style={{ position: 'absolute', left: 15 }}
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
                  { fontSize: 20, fontWeight: 'bold' },
                  { color: themeStyles.normalText },
                ]}
              >
                BVN Verification
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Formik
                initialValues={{
                  surName: '',
                  firstName: '',
                  bvn: '',
                  dob: '',
                }}
                validationSchema={validationBVNValidation}
                onSubmit={(values) => {
                  // Ensure dob is a string in YYYY-MM-DD format
                  let formattedDob = values.dob;
                  if (typeof formattedDob === 'string' && formattedDob) {
                    // Already a string, use as is
                    formattedDob = formattedDob;
                  } else {
                    // If somehow it's not a string, format it
                    formattedDob = '';
                  }
                  
                  const formattedValues = {
                    ...values,
                    dob: formattedDob
                  };
                  submitBVN(formattedValues);
                }}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  setFieldValue,
                  errors,
                  touched,
                }) => {
                  // Format date for display
                  const formatDateForDisplay = (dateValue: string | undefined) => {
                    if (!dateValue) return '';
                    try {
                      const date = new Date(dateValue);
                      if (isNaN(date.getTime())) return '';
                      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    } catch {
                      return '';
                    }
                  };

                  const displayDate = formatDateForDisplay(values.dob);
                  const datePickerValue = values.dob 
                    ? new Date(values.dob)
                    : new Date();

                  return (
                    <View>
                      <Input
                        id="surName"
                        label="Surname"
                        onChangeText={handleChange('surName')}
                        keyboardType="default"
                        onBlur={handleBlur('surName')}
                        value={values.surName || ''}
                        errorText={
                          touched.surName && errors.surName ? errors.surName : ''
                        }
                        variant="signin"
                      />
                      <Input
                        id="firstName"
                        label="First Name"
                        onChangeText={handleChange('firstName')}
                        keyboardType="default"
                        onBlur={handleBlur('firstName')}
                        value={values.firstName || ''}
                        errorText={
                          touched.firstName && errors.firstName
                            ? errors.firstName
                            : ''
                        }
                        variant="signin"
                      />
                      <Input
                        id="bvn"
                        label="BVN"
                        onChangeText={handleChange('bvn')}
                        keyboardType="numeric"
                        onBlur={handleBlur('bvn')}
                        value={values.bvn || ''}
                        errorText={touched.bvn && errors.bvn ? errors.bvn : ''}
                        variant="signin"
                      />
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={[
                          styles.dateInput,
                          {
                            borderColor: touched.dob && errors.dob 
                              ? COLORS.error 
                              : COLORS.gray,
                            backgroundColor: '#FEFEFE',
                          }
                        ]}
                      >
                        <Text
                          style={{
                            color: displayDate
                              ? themeStyles.normalText
                              : COLORS.gray,
                            fontSize: displayDate ? 14 : 16,
                            paddingTop: displayDate ? 8 : 0,
                          }}
                        >
                          {displayDate || 'Select Date of Birth'}
                        </Text>
                        {displayDate && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: COLORS.gray,
                              marginTop: 2,
                            }}
                          >
                            Date of Birth
                          </Text>
                        )}
                      </TouchableOpacity>
                      {touched.dob && errors.dob && (
                        <Text style={styles.errorText}>{errors.dob}</Text>
                      )}
                      {showDatePicker && (
                        <DateTimePicker
                          value={datePickerValue}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, date) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (date && event.type !== 'dismissed') {
                              // Format date as YYYY-MM-DD string for Formik
                              const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                              setFieldValue('dob', formattedDate);
                            }
                            if (Platform.OS === 'android') {
                              setShowDatePicker(false);
                            }
                          }}
                        />
                      )}
                      <Button title={'Continue'} onPress={() => handleSubmit()} />
                    </View>
                  );
                }}
              </Formik>
            </View>
          </View>
        </View>

        <Text
          style={[
            { textAlign: 'center', paddingHorizontal: 20, paddingBottom: 10 },
            { color: themeStyles.normalText },
          ]}
        >
          Please ensure that you submit the correct BVN details. Your information will be matched with the national database for verification. Providing incorrect details will result in failed verification
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    minHeight: 56,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: -5,
    marginBottom: 5,
    marginLeft: 2,
  },
});

export default BvnVerification;
