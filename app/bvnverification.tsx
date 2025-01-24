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
  const [selectedDate, setSelectedDate] = useState('');

  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
    verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
  };

  const { mutate: submitBVN } = useMutation({
    mutationKey: ['submitBVN'],
    mutationFn: (values) => KyCRequest(values, token),
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

  const handleDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      const date = new Date(selected);
      const formattedDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      setSelectedDate(formattedDate);
    }
  };

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
                  dob: selectedDate,
                }}
                validationSchema={validationBVNValidation}
                onSubmit={(values) => submitBVN(values)}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  setFieldValue,
                  errors,
                  touched,
                }) => (
                  <View>
                    <Input
                      id="surName"
                      label="Surname"
                      onChangeText={handleChange('surName')}
                      keyboardType="default"
                      onBlur={handleBlur('surName')}
                      value={values.surName}
                      errorText={
                        touched.surName && errors.surName ? errors.surName : ''
                      }
                    />
                    <Input
                      id="firstName"
                      label="First Name"
                      onChangeText={handleChange('firstName')}
                      keyboardType="default"
                      onBlur={handleBlur('firstName')}
                      value={values.firstName}
                      errorText={
                        touched.firstName && errors.firstName
                          ? errors.firstName
                          : ''
                      }
                    />
                    <Input
                      id="bvn"
                      label="BVN"
                      onChangeText={handleChange('bvn')}
                      keyboardType="numeric"
                      onBlur={handleBlur('bvn')}
                      value={values.bvn}
                      errorText={touched.bvn && errors.bvn ? errors.bvn : ''}
                    />
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      style={styles.dateInput}
                    >
                      <Text
                        style={{
                          color: selectedDate
                            ? themeStyles.normalText
                            : COLORS.gray,
                        }}
                      >
                        {selectedDate || 'Select Date of Birth'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={selectedDate ? new Date(selectedDate) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                          handleDateChange(event, date);
                          setFieldValue('dob', date);
                        }}
                      />
                    )}
                    <Button title={'Continue'} onPress={() => handleSubmit()} />
                  </View>
                )}
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
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
  },
});

export default BvnVerification;
