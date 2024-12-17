import { COLORS, icons } from '@/constants';
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
import { Formik } from 'formik';
import { validationChangePassword } from '@/utils/validation';
import Toast from 'react-native-toast-message';
import Input from '../components/CustomInput';
import Button from '@/components/Button';
import { useNavigation, router } from 'expo-router';
import { useState } from 'react';
import { chnagePassword } from '@/utils/mutations/authMutations';
import { useAuth } from '@/contexts/authContext';

interface IChangePasswordReq {
  oldPassword: string;
  newPassword: string;
}

const ChangePassword = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const themeStyles = {
    backgroundCont: dark ? COLORS.dark1 : COLORS.white,
    primaryText: dark ? COLORS.white : COLORS.dark1,
  };

  const showSuccessToast = () => {
    Toast.show({
      type: 'success',
      text1: 'Password Changed',
      text2: 'Your password has been successfully updated.',
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });

    setTimeout(() => {
      router.canGoBack() ? router.back() : router.push('/profilesecurity');
    }, 3000);
  };

  const handlePasswordChange = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      setIsSubmitting(true);

      const payload: IChangePasswordReq = {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      const response = await chnagePassword(payload, token);
      
      if (response.status === 'success') {
        showSuccessToast();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to change password',
        });
      }
    } catch (error) {
      console.error('Password change failed', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.backgroundCont }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goBack}
            style={{ position: 'absolute', left: 0 }}
          >
            <Image
              source={icons.arrowBack}
              style={{
                width: 20,
                height: 20,
                tintColor: themeStyles.primaryText,
              }}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeStyles.primaryText }]}>
            Change Password
          </Text>
        </View>
        <View style={{ flex: 1}}>
          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            validationSchema={validationChangePassword}
            onSubmit={handlePasswordChange}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                <Input
                id="oldPassword"
                  label="Current Password"
                  secureTextEntry
                  onChangeText={handleChange('currentPassword')}
                  onBlur={handleBlur('currentPassword')}
                  value={values.currentPassword}
                  errorText={
                    errors.currentPassword && touched.currentPassword
                      ? errors.currentPassword
                      : ''
                  }
                />

                <Input
                  label="New Password"
                  secureTextEntry
                  onChangeText={handleChange('newPassword')}
                  onBlur={handleBlur('newPassword')}
                  value={values.newPassword}
                  errorText={
                    errors.newPassword && touched.newPassword
                      ? errors.newPassword
                      : ''
                  }
                  id='newPassword'
                />

                <Input
                  label="Re-enter Password"
                  secureTextEntry
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                  errorText={
                    errors.confirmPassword && touched.confirmPassword
                      ? errors.confirmPassword
                      : ''
                  }
                  id='confirmPassword'
                />

                <Button
                  title="Save changes"
                 
                  onPress={() => handleSubmit()}

                />
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flex: 1,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
  },
  formContainer: {
    // justifyContent: 'space-between',
    flex: 1,
  },
});

export default ChangePassword;
