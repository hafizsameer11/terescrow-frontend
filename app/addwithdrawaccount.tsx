import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { createBankAccount, updateBankAccount, ICreateBankAccountRequest, IUpdateBankAccountRequest } from '@/utils/mutations/authMutations';
import { showTopToast } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const AddWithdrawAccount = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    accountId?: string;
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    bankCode?: string;
    isEdit?: string;
  }>();

  const isEdit = params.isEdit === 'true';
  const [accountName, setAccountName] = useState(params.accountName || '');
  const [accountNumber, setAccountNumber] = useState(params.accountNumber || '');
  const [bankName, setBankName] = useState(params.bankName || '');
  const [bankCode, setBankCode] = useState(params.bankCode || '');

  // Create account mutation
  const { mutate: createAccount, isPending: isCreating } = useMutation({
    mutationFn: (data: ICreateBankAccountRequest) => createBankAccount(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Bank account added successfully',
      });
      router.back();
    },
    onError: (error: any) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to add bank account',
      });
    },
  });

  // Update account mutation
  const { mutate: updateAccount, isPending: isUpdating } = useMutation({
    mutationFn: (data: IUpdateBankAccountRequest) => {
      const accountId = params.accountId ? parseInt(params.accountId, 10) : 0;
      return updateBankAccount(token, accountId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Bank account updated successfully',
      });
      router.back();
    },
    onError: (error: any) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to update bank account',
      });
    },
  });

  const handleSave = () => {
    if (!accountName || !accountNumber || !bankName || !bankCode) {
      showTopToast({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (isEdit) {
      // Update existing account
      const updateData: IUpdateBankAccountRequest = {
        accountName,
        accountNumber,
        bankName,
        bankCode,
      };
      updateAccount(updateData);
    } else {
      // Create new account
      const createData: ICreateBankAccountRequest = {
        accountName,
        accountNumber,
        bankName,
        bankCode,
        isDefault: false, // New accounts are not default by default
      };
      createAccount(createData);
    }
  };

  const isSaving = isCreating || isUpdating;

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
          {isEdit ? 'Edit Account' : 'Add New'}
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

        {/* Bank Code */}
        <View style={styles.inputSection}>
          <Input
            label="Bank Code"
            keyboardType="numeric"
            value={bankCode}
            onChangeText={setBankCode}
            id="bankCode"
            variant="signin"
            placeholder="Bank Code (e.g., 044 for Access Bank)"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton, 
          (!accountName || !accountNumber || !bankName || !bankCode || isSaving) && styles.saveButtonDisabled
        ]}
        onPress={handleSave}
        disabled={!accountName || !accountNumber || !bankName || !bankCode || isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
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

