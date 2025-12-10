import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';
import { useAuth } from '@/contexts/authContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getWalletOverview } from '@/utils/queries/accountQueries';
import { showTopToast } from '@/utils/helpers';
import { verifyBillPaymentAccount } from '@/utils/mutations/authMutations';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Airtime = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    selectedProvider?: string;
    selectedBillerId?: string;
    selectedPlan?: string;
    selectedItemId?: string;
  }>();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(params.selectedProvider || null);
  const [selectedBillerId, setSelectedBillerId] = useState<string | null>(params.selectedBillerId || null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(params.selectedPlan || null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(params.selectedItemId || null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });

  // Fetch wallet balance
  const { data: walletData, isLoading: walletLoading, refetch: refetchWallet } = useQuery({
    queryKey: ['walletOverview'],
    queryFn: () => getWalletOverview(token),
    enabled: !!token,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchWallet();
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWallet]);

  // Account verification mutation
  const { mutate: verifyAccount, isPending: isVerifying } = useMutation({
    mutationKey: ['verifyBillPaymentAccount'],
    mutationFn: (data: { sceneCode: 'airtime' | 'data'; rechargeAccount: string; billerId: string; itemId?: string }) =>
      verifyBillPaymentAccount(data, token),
    onSuccess: (data) => {
      if (data.data?.valid) {
        setVerificationStatus({
          isValid: true,
          message: data.data.biller ? `Valid ${data.data.biller} number` : 'Valid number',
        });
      } else {
        setVerificationStatus({
          isValid: false,
          message: 'Invalid number. Please check and try again.',
        });
      }
    },
    onError: (error: any) => {
      setVerificationStatus({
        isValid: false,
        message: error.message || 'Unable to verify number. Please try again.',
      });
    },
  });

  // Debounced verification when mobile number changes
  React.useEffect(() => {
    if (!mobileNumber || mobileNumber.length < 10 || !selectedBillerId) {
      setVerificationStatus({ isValid: null, message: '' });
      return;
    }

    const timeoutId = setTimeout(() => {
      if (mobileNumber && selectedBillerId) {
        verifyAccount({
          sceneCode: 'airtime',
          rechargeAccount: mobileNumber,
          billerId: selectedBillerId,
          itemId: selectedItemId || undefined,
        });
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [mobileNumber, selectedBillerId, selectedItemId, verifyAccount]);

  const totalBalance = walletData?.data?.totalBalance || 0;
  const currency = walletData?.data?.currency || 'NGN';
  const balance = currency === 'NGN' 
    ? `N${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalBalance)}`
    : `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalBalance)}`;

  // Track previous billerId to detect provider changes
  const prevBillerIdRef = React.useRef<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      // If provider changed, clear the selected plan
      if (params.selectedBillerId && params.selectedBillerId !== prevBillerIdRef.current && prevBillerIdRef.current !== null) {
        setSelectedPlan(null);
        setSelectedItemId(null);
      }
      prevBillerIdRef.current = params.selectedBillerId || null;

      if (params.selectedProvider) {
        setSelectedProvider(params.selectedProvider);
      }
      if (params.selectedBillerId) {
        setSelectedBillerId(params.selectedBillerId);
      }
      if (params.selectedPlan) {
        setSelectedPlan(params.selectedPlan);
      }
      if (params.selectedItemId) {
        setSelectedItemId(params.selectedItemId);
      }
    }, [params.selectedProvider, params.selectedBillerId, params.selectedPlan, params.selectedItemId])
  );

  const handleSelectProvider = () => {
    navigate('providermodal' as any, {
      selectedProvider: selectedProvider || '',
      selectedBillerId: selectedBillerId || '',
      returnTo: 'airtime',
      sceneCode: 'airtime',
    });
  };

  const handleSelectPlan = () => {
    if (!selectedBillerId) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a provider first',
      });
      return;
    }
    navigate('plantypemodal' as any, {
      selectedPlan: selectedPlan || '',
      selectedItemId: selectedItemId || '',
      sceneCode: 'airtime',
      billerId: selectedBillerId,
    });
  };

  const handleBuyAirtime = () => {
    if (!selectedProvider || !selectedBillerId || !mobileNumber || !amount) {
      return;
    }
    console.log('Navigating to PIN modal with:', {
      sceneCode: 'airtime',
      billerId: selectedBillerId,
      provider: selectedProvider,
      mobileNumber: mobileNumber,
      amount: amount,
      itemId: selectedItemId || undefined,
    });
    // Navigate to PIN modal with order details
    navigate('pinmodal' as any, {
      sceneCode: 'airtime',
      billerId: selectedBillerId,
      provider: selectedProvider,
      mobileNumber: mobileNumber,
      amount: amount,
      itemId: selectedItemId || undefined, // itemId from API for airtime plans
      type: 'airtime',
    });
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
          Airtime
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Select Provider */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          {/* <Text style={styles.providerLabel}>Select Provider</Text> */}
          <TouchableOpacity
            style={styles.providerSelector}
            onPress={handleSelectProvider}
          >
            {selectedProvider ? (
              <Text style={styles.selectorValue}>
                {selectedProvider}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Provider
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Select Plan */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={styles.providerSelector}
            onPress={handleSelectPlan}
          >
            {selectedPlan ? (
              <Text style={styles.selectorValue}>
                {selectedPlan}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Plan
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Mobile Number */}
        <View style={styles.inputSection}>
          <Input
            label="Mobile Number"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            id="mobileNumber"
            variant="signin"
            placeholder="Mobile Number"
          />
          {isVerifying && (
            <View style={styles.verificationContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={[styles.verificationText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Verifying...
              </Text>
            </View>
          )}
          {!isVerifying && verificationStatus.message && (
            <View style={styles.verificationContainer}>
              <Text
                style={[
                  styles.verificationText,
                  verificationStatus.isValid
                    ? { color: COLORS.primary }
                    : { color: COLORS.red },
                ]}
              >
                {verificationStatus.message}
              </Text>
            </View>
          )}
        </View>

        {/* Amount in Naira */}
        <View style={styles.inputSection}>
          <Input
            label="Amount in Naira"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            id="amount"
            variant="signin"
            placeholder="Amount in Naira"
          />
        </View>

        {/* Balance and Topup */}
        <View style={styles.balanceContainer}>
          {walletLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[styles.balanceText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Balance: {balance}
            </Text>
          )}
          <TouchableOpacity 
            style={styles.topupButton}
            onPress={() => navigate('fundwalletmodal' as any)}
          >
            <Text style={styles.topupButtonText}>Topup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Buy Airtime Button */}
      <TouchableOpacity
        style={[styles.buyButton, (!selectedProvider || !selectedBillerId || !mobileNumber || !amount) && styles.buyButtonDisabled]}
        onPress={handleBuyAirtime}
        disabled={!selectedProvider || !selectedBillerId || !mobileNumber || !amount}
      >
        <Text style={styles.buyButtonText}>Buy airtime</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Airtime;

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
  inputSection: {
    // marginBottom: 20,
  },
  providerLabel: {
    fontSize: 12,
    color: '#989898',
    marginBottom: 4,
    paddingLeft: 4,
  },
  providerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    backgroundColor: '#FEFEFE',
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1e1e1e',
    flex: 1,
  },
  selectorPlaceholder: {
    fontSize: 16,
    fontWeight: '400',
    color: '#989898',
    flex: 1,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#989898',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: isTablet ? 16 : 12,
    fontWeight: '400',
  },
  topupButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topupButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 14 : 10,
    fontWeight: '400',
  },
  buyButton: {
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
  buyButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
  },
  verificationText: {
    fontSize: 12,
    marginLeft: 8,
  },
});

