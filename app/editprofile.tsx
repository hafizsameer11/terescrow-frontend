import { COLORS, icons, images } from '@/constants';
import { validationEditProfile } from '@/utils/validation';
import { Image } from 'expo-image';
import { Formik } from 'formik';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/CustomInput';
import { useNavigation } from 'expo-router';
import Button from '@/components/Button';
import { useTheme } from '@/contexts/themeContext';
import { useAuth } from '@/contexts/authContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { editUser } from '@/utils/mutations/authMutations';
import { ApiError } from '@/utils/customApiCalls';
import { getImageUrl, showTopToast } from '@/utils/helpers';
import { useEffect, useState, useCallback } from 'react';
import * as ImagePicker from "expo-image-picker";
import { getPrivacyPageLinks } from '@/utils/queries/quickActionQueries';
import CustomSelect from '@/components/CustomSelect';
import { GENDERS, COUNTRIES } from '@/utils/dummyTrans';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const EditProfile = () => {
  const dummyData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'Y9lR0@example.com',
    country: 'Nigeria',
    mobileNumber: '1234567890',
    gender: 'Male',
    userName: 'johndoe',
  };
  const { userData } = useAuth();
  const { dark } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setProfileImage(userData?.profilePicture || null)
    console.log("prpfo;e [octire", userData?.profilePicture)
  }, [userData])
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access media is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      console.log("Selected Profile Image:", imageUri); // Log directly
    }
  };

  const { goBack } = useNavigation();
  const themeStyles = {
    background: COLORS.white,
    normalText: COLORS.black,
  };
  const { token } = useAuth();

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh profile image from userData
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfileImage(userData?.profilePicture || null);
    } catch (error) {
      console.log("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, [userData]);

  const { mutate: edit, isPending } = useMutation({
    mutationKey: ['editProfile'],
    mutationFn: (values: any) => editUser(values, token), // Pass values when calling mutate
    onSuccess: async (data) => {
      showTopToast({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });
    },
    onError: (error: ApiError) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Something went wrong',
      });
    },
  });
  const handleSubmit = (values: any) => {
    const formData = new FormData();
    
    // Convert gender ID back to string format for API
    const genderId = values.gender;
    let genderString = '';
    
    if (genderId !== undefined && genderId !== null && genderId !== '') {
      const genderNum = Number(genderId);
      const foundGender = GENDERS.find(g => g.id === genderNum);
      genderString = foundGender?.title || '';
    }
    
    console.log('Form values:', values);
    console.log('Gender ID:', genderId, 'Gender String:', genderString);
    
    // Convert country ID back to string format for API
    const countryId = values.country;
    let countryString = '';
    
    if (countryId !== undefined && countryId !== null && countryId !== '') {
      const countryNum = Number(countryId);
      const foundCountry = COUNTRIES.find(c => c.id === countryNum);
      countryString = foundCountry?.title || '';
    }

    Object.entries(values).forEach(([key, value]) => {
      // Skip fields that should not be changed: email, userName, phoneNumber
      // Also skip gender, country, and profileImage, we'll add them separately
      if (key === 'gender' || 
          key === 'country' ||
          key === 'profileImage' || 
          key === 'email' || 
          key === 'userName' || 
          key === 'phoneNumber') return;
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    // Append gender as string
    if (genderString) {
      formData.append('gender', genderString);
    } else {
      console.error('Gender string is empty, cannot submit');
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a gender',
      });
      return;
    }

    // Append country as string
    if (countryString) {
      formData.append('country', countryString);
    } else {
      console.error('Country string is empty, cannot submit');
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a country',
      });
      return;
    }

    // Append profile picture if available
    if (profileImage && !profileImage.startsWith('http')) {
      formData.append("profilePicture", {
        uri: profileImage,
        type: "image/jpeg",
        name: "profile.jpg",
      } as unknown as Blob);
    }
    
    console.log('Submitting form data...');
    edit(formData);
  }
  return (
    <SafeAreaView style={{ backgroundColor: themeStyles.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
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
            Edit Profile
          </Text>
        </View>
        <View style={{ padding: 20, height: '100%' }}>
          <Formik
            initialValues={{
              firstName: userData?.firstname || '',
              lastName: userData?.lastname || '',
              email: userData?.email || '',
              country: (() => {
                // Convert country string to ID for CustomSelect
                if (!userData?.country) return '';
                const countryStr = String(userData.country);
                const found = COUNTRIES.find(c => c.title.toLowerCase() === countryStr.toLowerCase());
                return found ? found.id : '';
              })(),
              phoneNumber: userData?.phoneNumber || '',
              gender: (() => {
                // Convert gender string to ID for CustomSelect
                if (!userData?.gender) return '';
                const genderLower = userData.gender.toLowerCase();
                const found = GENDERS.find(g => g.title.toLowerCase() === genderLower);
                return found ? found.id : '';
              })(),
              userName: userData?.username || '',
              profileImage: userData?.profilePicture,
            }}
            enableReinitialize={true}  // Ensures prefilled data works correctly

            validationSchema={validationEditProfile}
            onSubmit={(values) => {
              handleSubmit(values)
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              touched,
              errors,
              setFieldValue,
            }) => {
              // Convert gender value to ID string for CustomSelect display
              const getGenderId = (genderValue: string | number | undefined): string => {
                if (!genderValue && genderValue !== 0) return '';
                // If it's already a number, convert to string
                if (typeof genderValue === 'number') return genderValue.toString();
                // If it's a string, find matching ID from GENDERS
                const genderLower = String(genderValue).toLowerCase();
                const found = GENDERS.find(g => g.title.toLowerCase() === genderLower);
                return found ? found.id.toString() : '';
              };

              // Convert country string to ID for CustomSelect display
              const getCountryId = (countryValue: string | number | undefined): string => {
                if (!countryValue && countryValue !== 0) return '';
                // If it's already a number, convert to string
                if (typeof countryValue === 'number') return countryValue.toString();
                // If it's a string, find matching ID from COUNTRIES
                const countryStr = String(countryValue);
                const found = COUNTRIES.find(c => c.title.toLowerCase() === countryStr.toLowerCase());
                return found ? found.id.toString() : '';
              };

              // Handle gender selection - ensure value is set as number
              const handleGenderSelect = (field: string, value: any) => {
                // CustomSelect with isSignup passes the ID as number
                // Ensure it's stored as a number for validation
                const numValue = typeof value === 'string' ? Number(value) : value;
                console.log('Setting gender field:', field, 'with value:', numValue, 'type:', typeof numValue);
                setFieldValue(field, numValue, false); // false = don't validate immediately
                // Trigger validation after setting
                setTimeout(() => {
                  setFieldValue(field, numValue, true);
                }, 0);
              };

              // Handle country selection - ensure value is set as number
              const handleCountrySelect = (field: string, value: any) => {
                // CustomSelect with isSignup passes the ID as number
                // Ensure it's stored as a number
                const numValue = typeof value === 'string' ? Number(value) : value;
                console.log('Setting country field:', field, 'with value:', numValue, 'type:', typeof numValue);
                setFieldValue(field, numValue, false);
                // Trigger validation after setting
                setTimeout(() => {
                  setFieldValue(field, numValue, true);
                }, 0);
              };

              return (

              <View>
                <TouchableOpacity
                  onPress={handleImagePicker}
                  style={{
                    alignItems: "center",
                    marginVertical: 20,
                  }}
                >
                  <View>
                    <Image
                      source={
                        profileImage
                          ? { uri: getImageUrl(profileImage) }
                          : images.userProfile
                      }
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        marginBottom: 10,
                      }}
                    />
                    <View style={styles.editIcon}>
                      <Image
                        style={{ width: 23, height: 23 }}
                        source={icons.edit}
                      />
                    </View>
                  </View>
                  <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
                    {profileImage
                      ? "Change Profile Picture"
                      : "Add Profile Picture"}
                  </Text>
                </TouchableOpacity>
                <Input
                  label="First Name"
                  keyboardType="default"
                  prefilledValue={values.firstName}
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  id="firstName"
                  variant="signin"
                  errorText={
                    touched.firstName && errors.firstName
                      ? errors.firstName
                      : ''
                  }
                />
                <Input
                  label="Last Name"
                  keyboardType="default"
                  prefilledValue={values.lastName}
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  id="lastName"
                  variant="signin"
                  errorText={
                    touched.lastName && errors.lastName ? errors.lastName : ''
                  }
                />
                <Input
                  label="Email Address"
                  keyboardType="email-address"
                  prefilledValue={values.email}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  id="email"
                  variant="signin"
                  isEditable={false}
                  showLock={true}
                  errorText={touched.email && errors.email ? errors.email : ''}
                />
                <View style={{ marginTop: 20 }}>
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#989898', 
                    marginBottom: 5,
                    marginLeft: 2 
                  }}>
                    Country
                  </Text>
                  <CustomSelect
                    options={COUNTRIES}
                    currValue={getCountryId(values.country)}
                    error={errors.country}
                    touched={touched.country}
                    placeholder="Select Country"
                    id="country"
                    setFieldValue={handleCountrySelect}
                    key={`country-${getCountryId(values.country)}-${values.country}`}
                    modalLabel="Country"
                    isSignup={true}
                    variant="signin"
                  />
                  {errors.country && touched.country && (
                    <Text style={{ 
                      color: COLORS.red, 
                      marginTop: 5, 
                      fontSize: 12,
                      marginLeft: 2 
                    }}>
                      {errors.country}
                    </Text>
                  )}
                </View>
                <Input
                  label="Mobile Number"
                  keyboardType="phone-pad"
                  prefilledValue={values.phoneNumber}
                  value={values.phoneNumber}
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  id="phoneNumber"
                  variant="signin"
                  isEditable={false}
                  showLock={true}
                  errorText={
                    touched.phoneNumber && errors.phoneNumber
                      ? errors.phoneNumber
                      : ''
                  }
                />
                <View style={{ marginTop: 20 }}>
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#989898', 
                    marginBottom: 5,
                    marginLeft: 2 
                  }}>
                    Gender
                  </Text>
                  <CustomSelect
                    options={GENDERS}
                    currValue={getGenderId(values.gender)}
                    error={errors.gender}
                    touched={touched.gender}
                    placeholder="Select Gender"
                    id="gender"
                    setFieldValue={handleGenderSelect}
                    key={`gender-${getGenderId(values.gender)}-${values.gender}`}
                    modalLabel="Gender"
                    isSignup={true}
                    variant="signin"
                  />
                  {errors.gender && touched.gender && (
                    <Text style={{ 
                      color: COLORS.red, 
                      marginTop: 5, 
                      fontSize: 12,
                      marginLeft: 2 
                    }}>
                      {errors.gender}
                    </Text>
                  )}
                </View>
                <Input
                  label="Username"
                  keyboardType="default"
                  prefilledValue={`@${values.userName}`}
                  value={`@${values.userName}`}
                  onChangeText={(text) => handleChange('userName')(text.replace('@', ''))}
                  onBlur={handleBlur('userName')}
                  id="userName"
                  variant="signin"
                  isEditable={false}
                  showLock={true}
                  errorText={
                    touched.userName && errors.userName ? errors.userName : ''
                  }
                />
                <View style={{ marginTop: 25 }}>
                  <Button
                    title="Save Changes"
                    onPress={handleSubmit as () => void}
                    disabled={
                      false
                    }
                  // style={{
                  //   opacity: !(
                  //     values.firstName &&
                  //     values.lastName &&
                  //     values.email &&
                  //     values.country &&
                  //     values.mobileNumber &&
                  //     values.gender &&
                  //     values.userName &&
                  //     !errors.firstName &&
                  //     !errors.lastName &&
                  //     !errors.email &&
                  //     !errors.country &&
                  //     !errors.mobileNumber &&
                  //     !errors.gender &&
                  //     !errors.userName
                  //   )
                  //     ? 0.5
                  //     : 1,
                  // }}
                  />
                </View>
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
    paddingVertical: 20,
  },
  editIcon: {
    width: 35,
    height: 35,
    position: "absolute",
    bottom: 10,
    right: 0,
    backgroundColor: COLORS.warning,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EditProfile;
