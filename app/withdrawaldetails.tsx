import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const WithdrawalDetails = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    selectedNetwork?: string;
  }>();
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(params.selectedNetwork || null);
  const [amount, setAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (params.selectedNetwork) {
      setSelectedNetwork(params.selectedNetwork);
    }
  }, [params.selectedNetwork]);

  // Reset when component mounts if no network is selected
  useEffect(() => {
    if (!params.selectedNetwork) {
      setSelectedNetwork(null);
    }
  }, []);

  const handleSelectNetwork = () => {
    navigate('blockchainmodal', {
      selectedNetwork: selectedNetwork,
    });
  };

  const handleWithdraw = () => {
    if (!selectedNetwork || !amount) {
      return;
    }
    navigate('withdrawalsuccess', {
      amount: amount,
      network: selectedNetwork,
    });
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would refetch withdrawal data here
      // For now, we'll just refresh the selected network from params
      if (params.selectedNetwork) {
        setSelectedNetwork(params.selectedNetwork);
      }
    } catch (error) {
      console.log("Error refreshing withdrawal details:", error);
    } finally {
      setRefreshing(false);
    }
  }, [params.selectedNetwork]);

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
          Withdrawal Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Loading withdrawal details...
          </Text>
        </View>
      ) : (
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
        {/* Select Network */}
        <View style={styles.networkSelectorContainer}>
          {/* <Text style={styles.networkSelectorLabel}>Select Network</Text> */}
          <TouchableOpacity
            style={styles.networkSelector}
            onPress={handleSelectNetwork}
          >
            {selectedNetwork ? (
              <Text style={styles.selectorValue}>
                {selectedNetwork}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Network
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Enter Amount */}
        <View style={styles.amountSection}>
          <Input
            label="Enter amount in USD"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            id="amount"
            variant="signin"
          />
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Image
            source={icons.infoCircle}
            style={styles.warningIcon}
            contentFit="contain"
          />
          <Text style={styles.warningText}>
            Kindly note that minimum withdrawal amount is 100 USDT
          </Text>
        </View>
        </ScrollView>
      )}

      {/* Withdraw Button */}
      <TouchableOpacity
        style={[styles.withdrawButton, (!selectedNetwork || !amount) && styles.withdrawButtonDisabled]}
        onPress={handleWithdraw}
        disabled={!selectedNetwork || !amount}
      >
        <Text style={styles.withdrawButtonText}>Withdraw</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WithdrawalDetails;

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
  networkSelectorContainer: {
    marginBottom: 20,
  },
  networkSelectorLabel: {
    fontSize: 12,
    color: '#989898',
    marginBottom: 4,
    paddingLeft: 4,
  },
  networkSelector: {
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
  amountSection: {
    marginBottom: 20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA50033',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  warningIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFA500',
  },
  warningText: {
    flex: 1,
    fontSize: isTablet ? 14 : 12,
    color: '#000',
    lineHeight: 18,
  },
  withdrawButton: {
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
  withdrawButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  withdrawButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

