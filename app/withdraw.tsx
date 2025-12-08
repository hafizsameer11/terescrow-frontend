import React, { useState, useEffect, useRef } from 'react';
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
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import Input from '@/components/CustomInput';
import { getWalletOverview } from '@/utils/queries/accountQueries';
import { verifyBankAccount, initiatePayout, IInitiatePayoutReq } from '@/utils/mutations/authMutations';
import { getPayoutStatus } from '@/utils/queries/accountQueries';
import { showTopToast } from '@/utils/helpers';
import { ApiError } from '@/utils/customApiCalls';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Withdraw = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token, userData } = useAuth();
  const params = useLocalSearchParams<{
    paymentMethod?: string;
    selectedBankCode?: string;
    selectedBankName?: string;
  }>();

  const [amount, setAmount] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState<string>(params.selectedBankCode || '');
  const [selectedBankName, setSelectedBankName] = useState<string>(params.selectedBankName || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [verifiedAccountName, setVerifiedAccountName] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Get wallet balance
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['walletOverview'],
    queryFn: () => getWalletOverview(token),
    enabled: !!token,
  });

  const totalBalance = walletData?.data?.totalBalance || 0;
  const currency = walletData?.data?.currency || 'NGN';

  // Verify account mutation
  const { mutate: verifyAccount, isPending: isVerifying } = useMutation({
    mutationFn: (data: { bankCode: string; accountNumber: string }) =>
      verifyBankAccount(data, token),
    mutationKey: ['verifyBankAccount'],
    onSuccess: (data) => {
      if (data?.data?.isValid) {
        setVerificationStatus('valid');
        setVerifiedAccountName(data.data.accountName);
        showTopToast({
          type: 'success',
          text1: 'Account Verified',
          text2: `Account name: ${data.data.accountName}`,
        });
      } else {
        setVerificationStatus('invalid');
        setVerifiedAccountName('');
        showTopToast({
          type: 'error',
          text1: 'Verification Failed',
          text2: 'Invalid account number or bank combination',
        });
      }
    },
    onError: (error: ApiError) => {
      setVerificationStatus('invalid');
      setVerifiedAccountName('');
      showTopToast({
        type: 'error',
        text1: 'Verification Error',
        text2: error.message || 'Failed to verify account',
      });
    },
  });

  // Debounced account verification
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    if (accountNumber.length >= 10 && selectedBankCode) {
      setVerificationStatus('verifying');
      verificationTimeoutRef.current = setTimeout(() => {
        verifyAccount({
          bankCode: selectedBankCode,
          accountNumber: accountNumber,
        });
      }, 1000);
    } else {
      setVerificationStatus('idle');
      setVerifiedAccountName('');
    }

    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, [accountNumber, selectedBankCode]);

  // Update bank selection from params
  useEffect(() => {
    if (params.selectedBankCode) {
      setSelectedBankCode(params.selectedBankCode);
    }
    if (params.selectedBankName) {
      setSelectedBankName(params.selectedBankName);
    }
  }, [params.selectedBankCode, params.selectedBankName]);

  // Initiate payout mutation
  const { mutate: createPayout, isPending: isCreatingPayout } = useMutation({
    mutationFn: (data: IInitiatePayoutReq) => initiatePayout(data, token),
    mutationKey: ['initiatePayout'],
    onSuccess: (data) => {
      if (data?.data?.transactionId) {
        const txId = data.data.transactionId;
        setTransactionId(txId);
        // Check payout status
        setTimeout(() => {
          checkPayoutStatus(txId);
        }, 2000);
      } else {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to initiate payout',
        });
      }
    },
    onError: (error: ApiError) => {
      showTopToast({
        type: 'error',
        text1: 'Payout Failed',
        text2: error.message || 'Failed to initiate withdrawal',
      });
    },
  });

  // Check payout status
  const checkPayoutStatus = (txId: string) => {
    getPayoutStatus(token, txId)
      .then((data) => {
        if (data?.data?.status) {
          const status = data.data.status.toLowerCase();
          if (status === 'successful' || status === 'completed') {
            showTopToast({
              type: 'success',
              text1: 'Withdrawal Successful',
              text2: `N${parseFloat(amount).toLocaleString()} has been sent to your account`,
            });
            // Navigate to success screen or refresh
            router.back();
          } else if (status === 'pending' || status === 'processing') {
            // Poll again after 3 seconds
            setTimeout(() => {
              checkPayoutStatus(txId);
            }, 3000);
          } else {
            showTopToast({
              type: 'error',
              text1: 'Withdrawal Failed',
              text2: 'Transaction was not successful',
            });
          }
        }
      })
      .catch((error: ApiError) => {
        // If transaction not found, it might still be processing
        if (error.statusCode === 404) {
          setTimeout(() => {
            checkPayoutStatus(txId);
          }, 3000);
        } else {
          showTopToast({
            type: 'error',
            text1: 'Status Check Failed',
            text2: error.message || 'Failed to check transaction status',
          });
        }
      });
  };

  const handleSelectBank = () => {
    navigate('bankmodal' as any, {
      selectedBankCode,
      selectedBankName,
      returnTo: 'withdraw',
    });
  };

  const handleProceed = () => {
    if (!amount || !selectedBankCode || !accountNumber) {
      showTopToast({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    if (verificationStatus !== 'valid') {
      showTopToast({
        type: 'error',
        text1: 'Account Not Verified',
        text2: 'Please verify your account number before proceeding',
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showTopToast({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    if (amountNum > totalBalance) {
      showTopToast({
        type: 'error',
        text1: 'Insufficient Balance',
        text2: `Your balance is N${totalBalance.toLocaleString()}`,
      });
      return;
    }

    // Initiate payout
    createPayout({
      amount: amountNum,
      currency: 'NGN',
      bankCode: selectedBankCode,
      accountNumber: accountNumber,
      accountName: verifiedAccountName,
      phoneNumber: userData?.phoneNumber || userData?.email || '',
    });
  };

  const canProceed = amount && selectedBankCode && accountNumber && verificationStatus === 'valid' && !isCreatingPayout;

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
          Withdraw
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructional Text */}
        <Text style={[styles.instructionText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
          Withdraw directly into your Nigerian bank account
        </Text>

        {/* Amount Input */}
        <View style={styles.inputSection}>
          <Input
            label=""
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            id="amount"
            variant="signin"
            placeholder="Amount"
          />
        </View>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          {walletLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[styles.balanceLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Balance : {currency} {totalBalance.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Bank Selection */}
        <View style={styles.inputSection}>
          <TouchableOpacity onPress={handleSelectBank}>
            <View style={[styles.selectField, dark ? { borderColor: COLORS.greyscale300 } : { borderColor: '#e2d9ec' }]}>
              <Text style={[styles.selectText, !selectedBankName && { color: '#989898' }]}>
                {selectedBankName || 'Select Bank'}
              </Text>
              <Image
                source={icons.arrowDown}
                style={[styles.selectIcon, { tintColor: '#989898' }]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Number Input */}
        <View style={styles.inputSection}>
          <Input
            label=""
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={setAccountNumber}
            id="accountNumber"
            variant="signin"
            placeholder="Account Number"
            maxLength={10}
          />
        </View>

        {/* Verification Status */}
        {accountNumber.length >= 10 && selectedBankCode && (
          <View style={styles.verificationContainer}>
            {verificationStatus === 'verifying' || isVerifying ? (
              <View style={styles.verificationRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.verificationText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  Verifying account...
                </Text>
              </View>
            ) : verificationStatus === 'valid' ? (
              <View style={styles.verificationRow}>
                <Text style={[styles.verificationText, { color: COLORS.primary }]}>
                  ✓ {verifiedAccountName}
                </Text>
              </View>
            ) : verificationStatus === 'invalid' ? (
              <View style={styles.verificationRow}>
                <Text style={[styles.verificationText, { color: COLORS.error || '#FF0000' }]}>
                  Invalid account number
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, !canProceed && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!canProceed}
      >
        {isCreatingPayout ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.proceedButtonText}>Proceed</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Withdraw;

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
    paddingBottom: 100,
  },
  instructionText: {
    fontSize: isTablet ? 14 : 14,
    fontWeight: '400',
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 12,
  },
  balanceContainer: {
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
  },
  selectField: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: '#FEFEFE',
  },
  selectText: {
    fontSize: 16,
    color: '#1e1e1e',
  },
  selectIcon: {
    width: 20,
    height: 20,
  },
  verificationContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  verificationIcon: {
    width: 16,
    height: 16,
  },
  proceedButton: {
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
  proceedButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});
