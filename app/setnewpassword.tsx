import React, { useState } from 'react';
import { icons } from '@/constants';
import { Image } from 'expo-image';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/themeContext';
import { COLORS } from '@/constants';
import { Formik } from 'formik';
import { validationSetNewPassword } from '@/utils/validation';
import Input from '../components/CustomInput';
import Button from '@/components/Button';
import { useNavigation, useRouter } from 'expo-router';
// import { setNewPassword } from '@/utils/apiCalls'; // Importing your backend function
import SuccessModal from './successmodal';
import { showTopToast } from '@/utils/helpers'; // For toast messages
import { setNewPassword } from '@/utils/mutations/authMutations';
import { NavigationProp, useRoute } from '@react-navigation/native';

const SetNewPassword = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { dark } = useTheme();
  const router = useRoute();
  const { userId }: { userId: string } = router.params as any;
 const { navigate, goBack } = useNavigation<NavigationProp<any>>();
  // const { goBack } = useNavigation();
  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
  };

  const handleModalPress = () => {
    setModalVisible(false);
    router.push('/(tabs)/dashboard'); // Navigate to the dashboard after success
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
              { fontSize: 23, fontWeight: 'bold', marginVertical: 10 },
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
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={validationSetNewPassword}
            onSubmit={async (values, { resetForm }) => {
              try {
                const response = await setNewPassword({
                  userId,
                  password: values.password,
                });
                console.log('Password changed successfully:', response);

                resetForm();
                showTopToast({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Password changed successfully',
                });
                // Navigate to the dashboard after success
                // router.push('/(tabs)/dashboard');
                navigate('signin');
                  
                // setModalVisible(true);
              } catch (error) {
                console.error('Error changing password:', error);
                showTopToast({
                  type: 'error',
                  text1: 'Error',
                  text2: error?.message || 'Failed to change password',
                });
              }
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
              <View style={[{ flex: 1 }, styles.secondaryCont]}>
                <View style={{ width: '100%' }}>
                  <Input
                  id='password'
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    keyboardType="default"
                    label="Password"
                    secureTextEntry
                    errorText={
                      touched.password && errors.password ? errors.password : ''
                    }
                  />
                  <Input
                  id='confirmPassword'
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    keyboardType="default"
                    label="Confirm Password"
                    secureTextEntry
                    errorText={
                      touched.confirmPassword && errors.confirmPassword
                        ? errors.confirmPassword
                        : ''
                    }
                  />
                </View>
                <View style={{ width: '100%' }}>
                  <Button
                    disabled={
                      !(
                        values.password &&
                        values.confirmPassword &&
                        !errors.password &&
                        !errors.confirmPassword
                      )
                    }
                    title="Complete"
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
          buttonTitle="Go to dashboard"
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
  secondaryCont: {
    flexDirection: 'column',
    marginTop: 15,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default SetNewPassword;
