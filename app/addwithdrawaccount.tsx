import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const AddWithdrawAccount = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    accountId?: string;
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    isEdit?: string;
  }>();

  const isEdit = params.isEdit === 'true';
  const [accountName, setAccountName] = useState(params.accountName || '');
  const [accountNumber, setAccountNumber] = useState(params.accountNumber || '');
  const [bankName, setBankName] = useState(params.bankName || '');

  const handleSave = () => {
    if (!accountName || !accountNumber || !bankName) {
      return;
    }
    // TODO: Save account logic
    router.back();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image
            source={icons.arrowBack}
            style={[styles.backIcon, dark ? { tintColor: COLORS.black } : { tintColor: COLORS.black }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
          Add New
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Name */}
        <View style={styles.inputSection}>
          <Input
            label="Account Name"
            keyboardType="default"
            value={accountName}
            onChangeText={setAccountName}
            id="accountName"
            variant="signin"
            placeholder="Account Name"
          />
        </View>

        {/* Account Number */}
        <View style={styles.inputSection}>
          <Input
            label="Account Number"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={setAccountNumber}
            id="accountNumber"
            variant="signin"
            placeholder="Account Number"
          />
        </View>

        {/* Bank Name */}
        <View style={styles.inputSection}>
          <Input
            label="Bank Name"
            keyboardType="default"
            value={bankName}
            onChangeText={setBankName}
            id="bankName"
            variant="signin"
            placeholder="Bank Name"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, (!accountName || !accountNumber || !bankName) && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!accountName || !accountNumber || !bankName}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddWithdrawAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  inputSection: {
    marginBottom: 20,
  },
  saveButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 100,
  },
  saveButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});

