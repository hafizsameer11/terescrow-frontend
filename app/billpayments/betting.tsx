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
import { useQuery } from '@tanstack/react-query';
import { getWalletOverview } from '@/utils/queries/accountQueries';
import { showTopToast } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Betting = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    selectedBettingSite?: string;
    selectedProvider?: string; // Provider modal uses this param name
    selectedBillerId?: string;
    selectedPlan?: string;
    selectedItemId?: string;
  }>();
  // Handle both selectedBettingSite and selectedProvider (provider modal uses selectedProvider)
  const [selectedBettingSite, setSelectedBettingSite] = useState<string | null>(
    params.selectedBettingSite || params.selectedProvider || null
  );
  const [selectedBillerId, setSelectedBillerId] = useState<string | null>(params.selectedBillerId || null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(params.selectedPlan || null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(params.selectedItemId || null);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');

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

      // Handle both selectedBettingSite and selectedProvider (provider modal uses selectedProvider)
      if (params.selectedBettingSite || params.selectedProvider) {
        setSelectedBettingSite(params.selectedBettingSite || params.selectedProvider || null);
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
    }, [params.selectedBettingSite, params.selectedProvider, params.selectedBillerId, params.selectedPlan, params.selectedItemId])
  );

  const handleSelectBettingSite = () => {
    navigate('providermodal' as any, {
      selectedProvider: selectedBettingSite || '',
      selectedBillerId: selectedBillerId || '',
      returnTo: 'betting',
      sceneCode: 'betting',
    });
  };

  const handleSelectPlan = () => {
    if (!selectedBillerId) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a betting site first',
      });
      return;
    }
    navigate('plantypemodal' as any, {
      selectedPlan: selectedPlan || '',
      selectedItemId: selectedItemId || '',
      sceneCode: 'betting',
      billerId: selectedBillerId,
    });
  };

  const handleProceed = () => {
    if (!selectedBettingSite || !selectedBillerId || !userId || !amount) {
      return;
    }
    console.log('Navigating to PIN modal with:', {
      sceneCode: 'betting',
      billerId: selectedBillerId,
      provider: selectedBettingSite,
      mobileNumber: userId,
      amount: amount,
      itemId: selectedItemId || undefined,
    });
    // Navigate to PIN modal with order details
    navigate('pinmodal' as any, {
      sceneCode: 'betting',
      billerId: selectedBillerId,
      provider: selectedBettingSite,
      mobileNumber: userId, // For betting, userId is the rechargeAccount
      amount: amount,
      itemId: selectedItemId || undefined, // itemId from API for betting plans
      type: 'betting',
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
          Betting
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
        {/* Select Betting Site */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={styles.providerSelector}
            onPress={handleSelectBettingSite}
          >
            {selectedBettingSite ? (
              <Text style={styles.selectorValue}>
                {selectedBettingSite}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Betting Site
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

        {/* USER ID */}
        <View style={styles.inputSection}>
          <Input
            label="USER ID"
            keyboardType="default"
            value={userId}
            onChangeText={setUserId}
            id="userId"
            variant="signin"
            placeholder="USER ID"
          />
        </View>

        {/* Enter Amount */}
        <View style={styles.inputSection}>
          <Input
            label="Enter Amount"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            id="amount"
            variant="signin"
            placeholder="Enter Amount"
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
          <TouchableOpacity style={styles.topupButton}>
            <Text style={styles.topupButtonText}>Topup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, (!selectedBettingSite || !selectedBillerId || !userId || !amount) && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!selectedBettingSite || !selectedBillerId || !userId || !amount}
      >
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Betting;

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

