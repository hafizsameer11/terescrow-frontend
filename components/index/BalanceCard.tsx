import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ImageBackground, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useAuth } from '@/contexts/authContext';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getWalletOverview, getCryptoAssets, getAllCryptoRates } from '@/utils/queries/accountQueries';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const WALLET_STORAGE_KEY = 'selectedWallet';

const BalanceCard = () => {
  const { dark } = useTheme();
  const { userData, token } = useAuth();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<string>('naira');

  // Load saved wallet selection
  useEffect(() => {
    const loadWalletSelection = async () => {
      try {
        const saved = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
        if (saved) {
          setSelectedWallet(saved);
        }
      } catch (error) {
        console.log('Error loading wallet selection:', error);
      }
    };
    loadWalletSelection();

    // Listen for wallet selection changes
    const interval = setInterval(loadWalletSelection, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch wallet overview (fiat balance)
  const { 
    data: walletData, 
    isLoading: walletLoading,
    isError: walletError,
  } = useQuery({
    queryKey: ['walletOverview'],
    queryFn: () => getWalletOverview(token),
    enabled: !!token,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch crypto assets (always fetch to show secondary balance)
  const { 
    data: cryptoAssetsData, 
    isLoading: cryptoLoading,
  } = useQuery({
    queryKey: ['cryptoAssets'],
    queryFn: () => getCryptoAssets(token),
    enabled: !!token,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch crypto rates for USD to NGN conversion
  const {
    data: ratesData,
  } = useQuery({
    queryKey: ['cryptoRates'],
    queryFn: () => getAllCryptoRates(token),
    enabled: !!token,
    staleTime: 60000, // Cache for 1 minute
  });

  // Extract balances
  const nairaBalance = walletData?.data?.totalBalance || 0;
  const currency = walletData?.data?.currency || 'NGN';
  const cryptoTotalUsd = parseFloat(cryptoAssetsData?.data?.totals?.totalUsd || '0');
  const cryptoTotalNaira = parseFloat(cryptoAssetsData?.data?.totals?.totalNaira || '0');

  // Get USD to NGN rate from BUY rates (use first active rate)
  const buyRates = ratesData?.data?.BUY || [];
  const activeBuyRate = buyRates.find(rate => rate.isActive);
  const usdToNgnRate = activeBuyRate ? parseFloat(activeBuyRate.rate) : 1500; // Fallback to 1500 if no rate found

  // Determine which balance to show based on selected wallet
  const isCryptoWallet = selectedWallet === 'crypto';
  
  // For crypto wallet: show USD as main, NGN as secondary
  // For naira wallet: show NGN as main, USD as secondary
  const mainBalance = isCryptoWallet ? cryptoTotalUsd : nairaBalance;
  // Calculate secondary balance using the rate from API
  const secondaryBalance = isCryptoWallet 
    ? (cryptoTotalNaira > 0 ? cryptoTotalNaira : (cryptoTotalUsd * usdToNgnRate))
    : (nairaBalance / usdToNgnRate);
  
  const mainLabel = isCryptoWallet ? 'Crypto Balance' : 'Naira Balance';
  const mainCurrency = isCryptoWallet ? '$' : 'N';
  const secondaryCurrency = isCryptoWallet ? 'N' : '$';
  const isLoading = isCryptoWallet ? (cryptoLoading || walletLoading) : walletLoading;

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <ImageBackground
      source={images.balanceBackground}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>{mainLabel}</Text>
          <TouchableOpacity
            onPress={() => navigate('switchwalletmodal' as any)}
          >
            <Image
              source={icons.arrowDown}
              style={[styles.chevronIcon, { tintColor: '#FFFFFF' }]}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => setBalanceVisible(!balanceVisible)}
          style={styles.eyeButton}
        >
          <Image
            source={balanceVisible ? icons.eyecloseup : icons.hide}
            style={styles.eyeIcon}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Balance Amount */}
      <View style={styles.balanceSection}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading balance...</Text>
          </View>
        ) : walletError && !isCryptoWallet ? (
          <Text style={styles.nairaBalance}>
            {balanceVisible ? `${mainCurrency}0.00` : `${mainCurrency}••••••`}
          </Text>
        ) : (
          <>
            <Text style={styles.nairaBalance}>
              {balanceVisible ? `${mainCurrency}${formatBalance(mainBalance)}` : `${mainCurrency}••••••`}
            </Text>
            {/* <Text style={styles.dollarBalance}>
              {balanceVisible ? `≈ ${secondaryCurrency}${formatBalance(secondaryBalance)}` : `= ${secondaryCurrency}••••••`}
            </Text> */}
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigate('fundwalletmodal' as any)}
        >
          <Image
            source={icons.balanceicon1}
            style={styles.buttonIcon}
            contentFit="contain"
          />
          <Text style={styles.buttonText}>Fund Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigate('withdraw' as any, { paymentMethod: 'Bank Transfer' })}
        >
          <Image
            source={icons.balanceicon2}
            style={styles.buttonIcon}
            contentFit="contain"
          />
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default BalanceCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  backgroundImage: {
    borderRadius: 16,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 14,
    fontWeight: '500',
  },
  chevronIcon: {
    width: isTablet ? 20 : 16,
    height: isTablet ? 20 : 16,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    width: isTablet ? 24 : 20,
    height: isTablet ? 24 : 20,
    tintColor: '#FFFFFF',
  },
  balanceSection: {
    marginBottom: 24,
    flexDirection: 'row',
  },
  nairaBalance: {
    color: '#FFFFFF',
    fontSize: isTablet ? 36 : 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  dollarBalance: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 14,
    fontWeight: '400',
    opacity: 0.9,
    marginTop:15,
    marginLeft:10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEFEFE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonIcon: {
    width: isTablet ? 20 : 16,
    height: isTablet ? 20 : 16,
  },
  buttonText: {
    color: '#000',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    marginLeft: 8,
  },
});

