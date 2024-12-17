import { COLORS, icons } from '@/constants';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
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
// import { useMutation } from 'react-query';

const BvnVerification = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  // const token = 'your-auth-token'; // Replace with actual token
const {token,userData}=useAuth();
  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
    verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
  };

  const { mutate: submitBVN } = useMutation({
    mutationKey: ['submitBVN'],
    mutationFn: (values) => KyCRequest(values, token),
    onSuccess: (data) => {
      console.log('Submission Successful:', data);
      // Add success message or navigation here
    },
    onError: (error) => {
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
                  dateOfBirth: '',
                }}
                validationSchema={validationBVNValidation}
                onSubmit={(values) => submitBVN(values)}
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
                    <Input
                      id="dateOfBirth"
                      label="Date of Birth"
                      onChangeText={handleChange('dateOfBirth')}
                      keyboardType="default"
                      onBlur={handleBlur('dateOfBirth')}
                      value={values.dateOfBirth}
                      errorText={
                        touched.dateOfBirth && errors.dateOfBirth
                          ? errors.dateOfBirth
                          : ''
                      }
                    />
                    <Button
                      title={ 'Continue'}
                      onPress={() => handleSubmit()}
                      // disabled={isLoading}
                    />
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
          An OTP will be sent to the number registered to your BVN
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
});

export default BvnVerification;
