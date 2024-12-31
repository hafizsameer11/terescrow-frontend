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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/CustomInput';
import { useNavigation } from 'expo-router';
import Button from '@/components/Button';
import { useTheme } from '@/contexts/themeContext';
import { useAuth } from '@/contexts/authContext';
import { useMutation } from '@tanstack/react-query';
import { editUser } from '@/utils/mutations/authMutations';
import { ApiError } from '@/utils/customApiCalls';
import { showTopToast } from '@/utils/helpers';
import { useEffect, useState } from 'react';
import * as ImagePicker from "expo-image-picker";

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

  useEffect(() => {
    setProfileImage(userData?.profilePicture)
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
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Append profile picture if available
    if (profileImage) {
      formData.append("profilePicture", {
        uri: profileImage,
        type: "image/jpeg",
        name: "profile.jpg",
      } as unknown as Blob);
    }
    edit(formData);
  }
  return (
    <SafeAreaView style={{ backgroundColor: themeStyles.background }}>
      <ScrollView>
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
              country: userData?.country || '',
              phoneNumber: userData?.phoneNumber || '',
              gender: userData?.gender || '',
              userName: userData?.username || '',
              profileImage: profileImage || '',
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
            }) => (

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
                          ? { uri: profileImage }
                          : images.userProfile
                      }
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        marginBottom: 10,
                      }}
                    />
                    {profileImage && (
                      <View style={styles.editIcon}>
                        <Image
                          style={{ width: 23, height: 23 }}
                          source={icons.edit}
                        />
                      </View>
                    )}
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
                  errorText={touched.email && errors.email ? errors.email : ''}
                />
                <Input
                  label="Country"
                  keyboardType="default"
                  prefilledValue={values.country}
                  value={values.country}
                  onChangeText={handleChange('country')}
                  onBlur={handleBlur('country')}
                  id="country"
                  errorText={
                    touched.country && errors.country ? errors.country : ''
                  }
                />
                <Input
                  label="Mobile Number"
                  keyboardType="phone-pad"
                  prefilledValue={values.phoneNumber}
                  value={values.phoneNumber}
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  id="phoneNumber"
                  errorText={
                    touched.phoneNumber && errors.phoneNumber
                      ? errors.phoneNumber
                      : ''
                  }
                />
                <Input
                  label="Gender"
                  keyboardType="default"
                  prefilledValue={values.gender}
                  value={values.gender}
                  onChangeText={handleChange('gender')}
                  onBlur={handleBlur('gender')}
                  id="gender"
                  errorText={
                    touched.gender && errors.gender ? errors.gender : ''
                  }
                />
                <Input
                  label="Username"
                  keyboardType="default"
                  prefilledValue={values.userName}
                  value={values.userName}
                  onChangeText={handleChange('userName')}
                  onBlur={handleBlur('userName')}
                  id="userName"
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
            )}
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
