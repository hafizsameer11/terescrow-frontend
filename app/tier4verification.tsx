import React, { useState } from 'react';
import { COLORS, icons } from '@/constants';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/themeContext';
import { useNavigation } from 'expo-router';
import Button from '@/components/Button';
import { submitTier4Kyc } from '@/utils/mutations/authMutations';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { router } from 'expo-router';
import { showTopToast } from '@/utils/helpers';
import * as ImagePicker from 'expo-image-picker';

const Tier4Verification = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const { token } = useAuth();
  const [proofOfFundsUri, setProofOfFundsUri] = useState<string | null>(null);

  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
    verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
  };

  const { mutate: submitTier4, isPending: isSubmitting } = useMutation({
    mutationKey: ['submitTier4'],
    mutationFn: (formData: FormData) => submitTier4Kyc(formData, token),
    onSuccess: (data) => {
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Tier 4 verification submitted successfully.',
      });
      router.push('/updatekyclevel');
    },
    onError: (error: any) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to submit Tier 4 verification',
      });
    },
  });

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProofOfFundsUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!proofOfFundsUri) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please upload proof of funds document',
      });
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    
    // Append proof of funds document
    formData.append('proofOfFunds', {
      uri: proofOfFundsUri,
      type: 'image/jpeg',
      name: 'proof-of-funds.jpg',
    } as unknown as Blob);

    console.log('Submitting Tier 4 KYC with FormData...');
    submitTier4(formData);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background }}>
      <View style={styles.container}>
        <TouchableOpacity
          style={{ position: 'absolute', left: 15, zIndex: 1 }}
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
          Tier 4 Verification
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: themeStyles.normalText }]}>
            Upload Proof of Funds
          </Text>
          
          <Text style={[styles.instructionText, { color: themeStyles.normalText }]}>
            You can use any of the following:
          </Text>

          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={[styles.listText, { color: themeStyles.normalText }]}>
                Salary Slip
              </Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={[styles.listText, { color: themeStyles.normalText }]}>
                Tax Documents
              </Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={[styles.listText, { color: themeStyles.normalText }]}>
                Sworn Affidavit of source of funds
              </Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={[styles.listText, { color: themeStyles.normalText }]}>
                Bank Statement (Last 3 months, name and address must be shown)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleImagePicker}
            style={styles.uploadBox}
          >
            {proofOfFundsUri ? (
              <Image
                source={{ uri: proofOfFundsUri }}
                style={styles.uploadedImage}
              />
            ) : (
              <>
                <Image
                  source={icons.chat}
                  style={styles.uploadIcon}
                />
                <Text style={styles.uploadText}>Upload Proof of Funds</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={isSubmitting ? 'Submitting...' : 'Continue'}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 16,
  },
  listContainer: {
    marginBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: 12,
  },
  listText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
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
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
});

export default Tier4Verification;

