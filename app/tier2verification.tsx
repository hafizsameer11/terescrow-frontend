import React, { useState } from 'react';
import { COLORS, icons } from '@/constants';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/themeContext';
import { useNavigation } from 'expo-router';
import { Formik } from 'formik';
import Input from '@/components/CustomInput';
import CustomSelect from '@/components/CustomSelect';
import Button from '@/components/Button';
import { submitTier2Kyc } from '@/utils/mutations/authMutations';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { router } from 'expo-router';
import { showTopToast } from '@/utils/helpers';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { COUNTRIES } from '@/utils/dummyTrans';
import * as Yup from 'yup';

// Document types for Tier 2
const DOCUMENT_TYPES = [
  { id: 1, title: 'Drivers License' },
  { id: 2, title: 'International Passport' },
];

// Validation schema for Tier 2
const tier2ValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .max(25, 'First name can\'t be longer than 25 characters'),
  surName: Yup.string()
    .required('Surname is required')
    .max(25, 'Surname can\'t be longer than 25 characters'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Phone must be numeric'),
  address: Yup.string()
    .required('Address is required'),
  dob: Yup.string()
    .required('Date of birth is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  nin: Yup.string()
    .required('NIN number is required')
    .matches(/^\d+$/, 'NIN must be numeric')
    .min(11, 'NIN must be 11 digits')
    .max(11, 'NIN must be 11 digits'),
  bvn: Yup.string()
    .required('BVN is required')
    .matches(/^\d+$/, 'BVN must be numeric')
    .min(11, 'BVN must be 11 digits')
    .max(11, 'BVN must be 11 digits'),
  country: Yup.mixed()
    .required('Country is required'),
  documentType: Yup.mixed()
    .required('Document type is required'),
  documentNumber: Yup.string()
    .required('Document number is required'),
  idDocument: Yup.mixed()
    .required('ID document is required'),
  selfie: Yup.mixed()
    .required('Selfie is required'),
});

type Step = 1 | 2 | 3;

const Tier2Verification = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const { token, userData } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ninDocumentUri, setNinDocumentUri] = useState<string | null>(null);
  const [idDocumentUri, setIdDocumentUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
    verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
  };

  const { mutate: submitTier2, isPending: isSubmitting } = useMutation({
    mutationKey: ['submitTier2'],
    mutationFn: (formData: FormData) => submitTier2Kyc(formData, token),
    onSuccess: (data) => {
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Tier 2 verification submitted successfully. An OTP will be sent to your BVN registered number.',
      });
      router.push('/updatekyclevel');
    },
    onError: (error: any) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to submit Tier 2 verification',
      });
    },
  });

  const handleImagePicker = async (type: 'ninDocument' | 'idDocument' | 'selfie') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'ninDocument') {
        setNinDocumentUri(result.assets[0].uri);
      } else if (type === 'idDocument') {
        setIdDocumentUri(result.assets[0].uri);
      } else {
        setSelfieUri(result.assets[0].uri);
      }
    }
  };

  const getCountryId = (countryName: string | number | undefined): number => {
    if (!countryName) return 0;
    if (typeof countryName === 'number') return countryName;
    const country = COUNTRIES.find(c => c.title.toLowerCase() === countryName.toLowerCase());
    return country?.id || 0;
  };

  const getDocumentTypeId = (docType: string | number | undefined): number => {
    if (!docType) return 0;
    if (typeof docType === 'number') return docType;
    const doc = DOCUMENT_TYPES.find(d => d.title.toLowerCase() === docType.toLowerCase());
    return doc?.id || 0;
  };

  const handleStepSubmit = (values: any, errors: any) => {
    console.log('handleStepSubmit called for step:', currentStep);
    console.log('Values:', values);
    console.log('Errors:', errors);
    
    // Check for validation errors relevant to current step
    if (currentStep === 1) {
      // Validate step 1 fields
      const step1Fields = ['firstName', 'surName', 'phone', 'address', 'dob', 'email', 'nin', 'bvn', 'country'];
      const hasStep1Errors = step1Fields.some(field => errors[field]);
      
      if (hasStep1Errors) {
        const firstError = step1Fields.find(field => errors[field]);
        showTopToast({
          type: 'error',
          text1: 'Validation Error',
          text2: errors[firstError!] || 'Please fill in all required fields correctly',
        });
        return;
      }
      
      if (!values.firstName || !values.surName || !values.phone || !values.address || !values.dob || !values.email || !values.nin || !values.bvn || !values.country) {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: 'Please fill in all required fields',
        });
        return;
      }
      console.log('Step 1 validation passed, moving to step 2');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate step 2 - NIN document upload
      if (!ninDocumentUri) {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: 'Please upload your NIN document',
        });
        return;
      }
      console.log('Step 2 validation passed, moving to step 3');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validate step 3 - document selection and selfie upload
      if (errors.documentType || errors.documentNumber) {
        const errorMsg = errors.documentType || errors.documentNumber;
        showTopToast({
          type: 'error',
          text1: 'Validation Error',
          text2: errorMsg || 'Please fill in all required fields correctly',
        });
        return;
      }
      
      if (!values.documentType || !values.documentNumber) {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: 'Please select document type and enter document number',
        });
        return;
      }
      if (!selfieUri) {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: 'Please upload your selfie',
        });
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      
      // Convert country ID to string
      const countryId = typeof values.country === 'number' ? values.country : getCountryId(values.country);
      const countryName = COUNTRIES.find(c => c.id === countryId)?.title || values.country;
      
      // Convert document type ID to string
      const docTypeId = typeof values.documentType === 'number' ? values.documentType : getDocumentTypeId(values.documentType);
      const docTypeName = DOCUMENT_TYPES.find(d => d.id === docTypeId)?.title || values.documentType;

      // Append text fields
      formData.append('firstName', values.firstName);
      formData.append('surName', values.surName);
      formData.append('dob', values.dob);
      formData.append('address', values.address);
      formData.append('country', countryName);
      formData.append('nin', values.nin);
      formData.append('bvn', values.bvn);
      formData.append('documentType', docTypeName);
      formData.append('documentNumber', values.documentNumber);
      
      // Append NIN document (idDocument)
      if (ninDocumentUri) {
        formData.append('idDocument', {
          uri: ninDocumentUri,
          type: 'image/jpeg',
          name: 'nin-document.jpg',
        } as unknown as Blob);
      }
      
      // Append selfie
      if (selfieUri) {
        formData.append('selfie', {
          uri: selfieUri,
          type: 'image/jpeg',
          name: 'selfie.jpg',
        } as unknown as Blob);
      }

      console.log('Submitting Tier 2 KYC with FormData...');
      console.log('FormData fields:', {
        firstName: values.firstName,
        surName: values.surName,
        dob: values.dob,
        address: values.address,
        country: countryName,
        nin: values.nin,
        bvn: values.bvn,
        documentType: docTypeName,
        documentNumber: values.documentNumber,
        hasIdDocument: !!ninDocumentUri,
        hasSelfie: !!selfieUri,
      });
      submitTier2(formData);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.formContainer}>
          <Formik
            initialValues={{
              firstName: userData?.firstname || '',
              surName: userData?.lastname || '',
              phone: userData?.phoneNumber || '',
              address: '',
              dob: '',
              email: userData?.email || '',
              nin: '',
              bvn: '',
              country: '',
              documentType: '',
              documentNumber: '',
            }}
            validationSchema={tier2ValidationSchema}
            onSubmit={(values) => {
              // This will be called by Formik's handleSubmit after validation passes
              // But we handle step navigation in our custom handleStepSubmit
              console.log('Formik onSubmit called with values:', values);
            }}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit: formikHandleSubmit,
              values,
              setFieldValue,
              errors,
              touched,
            }) => {
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
              const today = new Date();
              today.setHours(23, 59, 59, 999); // Set to end of today
              // Default to 18 years ago for date of birth
              const defaultDate = new Date();
              defaultDate.setFullYear(defaultDate.getFullYear() - 18);
              const datePickerValue = values.dob 
                ? new Date(values.dob)
                : defaultDate;

              return (
                <View>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <>
                      <Input
                        id="firstName"
                        label="Full Name"
                        onChangeText={handleChange('firstName')}
                        keyboardType="default"
                        onBlur={handleBlur('firstName')}
                        value={values.firstName || ''}
                        errorText={touched.firstName && errors.firstName ? errors.firstName : ''}
                        variant="signin"
                      />
                      
                      <Input
                        id="surName"
                        label="Surname"
                        onChangeText={handleChange('surName')}
                        keyboardType="default"
                        onBlur={handleBlur('surName')}
                        value={values.surName || ''}
                        errorText={touched.surName && errors.surName ? errors.surName : ''}
                        variant="signin"
                      />
                      
                      <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 12, color: '#989898', marginBottom: 5, marginLeft: 2 }}>
                          Country
                        </Text>
                        <CustomSelect
                          options={COUNTRIES}
                          currValue={getCountryId(values.country).toString()}
                          error={errors.country}
                          touched={touched.country}
                          placeholder="Select Country"
                          id="country"
                          setFieldValue={(field, value) => {
                            const country = COUNTRIES.find(c => c.id === Number(value));
                            setFieldValue('country', country?.title || '');
                          }}
                          modalLabel="Country"
                          isSignup={true}
                          variant="signin"
                        />
                        {errors.country && touched.country && (
                          <Text style={{ color: COLORS.red, marginTop: 5, fontSize: 12, marginLeft: 2 }}>
                            {errors.country}
                          </Text>
                        )}
                      </View>

                      <Input
                        id="phone"
                        label="Phone"
                        onChangeText={handleChange('phone')}
                        keyboardType="phone-pad"
                        onBlur={handleBlur('phone')}
                        value={values.phone || ''}
                        errorText={touched.phone && errors.phone ? errors.phone : ''}
                        variant="signin"
                      />

                      <Input
                        id="address"
                        label="Address"
                        onChangeText={handleChange('address')}
                        keyboardType="default"
                        onBlur={handleBlur('address')}
                        value={values.address || ''}
                        errorText={touched.address && errors.address ? errors.address : ''}
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
                          {displayDate || 'Date of birth (mm/dd/yyyy)'}
                        </Text>
                        {displayDate && (
                          <Text style={{ fontSize: 12, color: COLORS.gray, marginTop: 2 }}>
                            Date of birth (mm/dd/yyyy)
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
                          maximumDate={today}
                          onChange={(event, date) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (date && event.type !== 'dismissed') {
                              // Ensure date is not in the future
                              const selectedDate = new Date(date);
                              const maxDate = new Date();
                              maxDate.setHours(23, 59, 59, 999);
                              
                              if (selectedDate > maxDate) {
                                showTopToast({
                                  type: 'error',
                                  text1: 'Error',
                                  text2: 'Cannot select future date',
                                });
                                return;
                              }
                              
                              const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                              setFieldValue('dob', formattedDate);
                            }
                            if (Platform.OS === 'android') {
                              setShowDatePicker(false);
                            }
                          }}
                        />
                      )}

                      <Input
                        id="email"
                        label="Email"
                        onChangeText={handleChange('email')}
                        keyboardType="email-address"
                        onBlur={handleBlur('email')}
                        value={values.email || ''}
                        errorText={touched.email && errors.email ? errors.email : ''}
                        variant="signin"
                      />

                      <Input
                        id="nin"
                        label="NIN Number"
                        onChangeText={handleChange('nin')}
                        keyboardType="numeric"
                        onBlur={handleBlur('nin')}
                        value={values.nin || ''}
                        errorText={touched.nin && errors.nin ? errors.nin : ''}
                        variant="signin"
                      />

                      <Input
                        id="bvn"
                        label="BVN Number"
                        onChangeText={handleChange('bvn')}
                        keyboardType="numeric"
                        onBlur={handleBlur('bvn')}
                        value={values.bvn || ''}
                        errorText={touched.bvn && errors.bvn ? errors.bvn : ''}
                        variant="signin"
                      />

                      <Text style={[styles.footerText, { color: themeStyles.normalText }]}>
                        An OTP will be sent to the number registered on your BVN
                      </Text>
                    </>
                  )}

                  {/* Step 2: Upload NIN Document */}
                  {currentStep === 2 && (
                    <>
                      <Text style={[styles.uploadTitle, { color: themeStyles.normalText, marginBottom: 20 }]}>
                        Upload your NIN
                      </Text>
                      
                      <TouchableOpacity
                        onPress={() => handleImagePicker('ninDocument')}
                        style={styles.uploadBox}
                      >
                        {ninDocumentUri ? (
                          <Image
                            source={{ uri: ninDocumentUri }}
                            style={styles.uploadedImage}
                          />
                        ) : (
                          <>
                            <Image
                              source={icons.chat}
                              style={styles.uploadIcon}
                            />
                            <Text style={styles.uploadText}>Upload your NIN</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Step 3: Document Selection and Selfie Upload */}
                  {currentStep === 3 && (
                    <>
                      <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 12, color: '#989898', marginBottom: 5, marginLeft: 2 }}>
                          Select Document type
                        </Text>
                        <CustomSelect
                          options={DOCUMENT_TYPES}
                          currValue={getDocumentTypeId(values.documentType).toString()}
                          error={errors.documentType}
                          touched={touched.documentType}
                          placeholder="Select Document type"
                          id="documentType"
                          setFieldValue={(field, value) => {
                            const docType = DOCUMENT_TYPES.find(d => d.id === Number(value));
                            setFieldValue('documentType', docType?.title || '');
                          }}
                          modalLabel="DOCUMENT TYPE"
                          isSignup={true}
                          variant="signin"
                        />
                        {errors.documentType && touched.documentType && (
                          <Text style={{ color: COLORS.red, marginTop: 5, fontSize: 12, marginLeft: 2 }}>
                            {errors.documentType}
                          </Text>
                        )}
                      </View>

                      <Input
                        id="documentNumber"
                        label="Document Number"
                        onChangeText={handleChange('documentNumber')}
                        keyboardType="default"
                        onBlur={handleBlur('documentNumber')}
                        value={values.documentNumber || ''}
                        errorText={touched.documentNumber && errors.documentNumber ? errors.documentNumber : ''}
                        variant="signin"
                      />

                      <Text style={[styles.uploadTitle, { color: themeStyles.normalText, marginTop: 20 }]}>
                        Upload Selfie
                      </Text>
                      
                      <TouchableOpacity
                        onPress={() => handleImagePicker('selfie')}
                        style={styles.uploadBox}
                      >
                        {selfieUri ? (
                          <Image
                            source={{ uri: selfieUri }}
                            style={styles.uploadedImage}
                          />
                        ) : (
                          <>
                            <Image
                              source={icons.chat}
                              style={styles.uploadIcon}
                            />
                            <Text style={styles.uploadText}>Upload your Selfie</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <Text style={[styles.footerText, { color: themeStyles.normalText }]}>
                        An OTP will be sent to the number registered on your BVN
                      </Text>
                    </>
                  )}

                  <Button
                    title={currentStep === 3 ? (isSubmitting ? 'Submitting...' : 'Continue') : 'Continue'}
                    onPress={() => {
                      console.log('Button pressed for step:', currentStep);
                      console.log('Current values:', values);
                      console.log('Current errors:', errors);
                      
                      // For step 3, use Formik's validation first, then submit
                      if (currentStep === 3) {
                        formikHandleSubmit();
                      } else {
                        // For steps 1 and 2, directly call handleStepSubmit
                        handleStepSubmit(values, errors);
                      }
                    }}
                    disabled={isSubmitting}
                  />
                </View>
              );
            }}
          </Formik>
        </View>
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
  footerText: {
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    fontSize: 12,
    marginTop: 10,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  uploadBox: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 40,
    height: 40,
    tintColor: COLORS.gray,
    marginBottom: 10,
  },
  uploadText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default Tier2Verification;

