import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getCryptoAssets, ICryptoAsset, getAllCryptoRates, getBuyCurrencies, getSellCurrencies, ICryptoCurrency } from '@/utils/queries/accountQueries';
import { getImageUrl } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const AllAssets = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'Buy' | 'Sell'>('Buy');

  // Fetch buy currencies - enabled immediately so data is ready
  const {
    data: buyCurrenciesData,
    isLoading: buyLoading,
    isError: buyError,
    refetch: refetchBuy,
    isFetching: buyFetching,
  } = useQuery({
    queryKey: ['buyCurrencies'],
    queryFn: () => getBuyCurrencies(token),
    enabled: !!token, // Always enabled so data loads immediately
  });

  // Fetch sell currencies - enabled immediately so data is ready when switching tabs
  const {
    data: sellCurrenciesData,
    isLoading: sellLoading,
    isError: sellError,
    refetch: refetchSell,
    isFetching: sellFetching,
  } = useQuery({
    queryKey: ['sellCurrencies'],
    queryFn: () => getSellCurrencies(token),
    enabled: !!token, // Always enabled so data is ready when switching tabs
  });

  // Fetch crypto assets for balance display
  const {
    data: assetsData,
    isLoading: assetsLoading,
  } = useQuery({
    queryKey: ['cryptoAssets'],
    queryFn: () => getCryptoAssets(token),
    enabled: !!token,
  });

  // Fetch crypto rates for USD to NGN conversion
  const {
    data: ratesData,
    isLoading: ratesLoading,
  } = useQuery({
    queryKey: ['cryptoRates'],
    queryFn: () => getAllCryptoRates(token),
    enabled: !!token,
    staleTime: 60000, // Cache for 1 minute
  });

  const totals = assetsData?.data?.totals || { totalUsd: '0', totalNaira: '0' };

  // Get currencies based on active tab
  const currencies: ICryptoCurrency[] = useMemo(() => {
    if (activeTab === 'Buy' && buyCurrenciesData?.data?.currencies) {
      return buyCurrenciesData.data.currencies;
    } else if (activeTab === 'Sell' && sellCurrenciesData?.data?.currencies) {
      return sellCurrenciesData.data.currencies;
    }
    return [];
  }, [activeTab, buyCurrenciesData, sellCurrenciesData]);

  const isLoading = (activeTab === 'Buy' && buyLoading) || (activeTab === 'Sell' && sellLoading);
  const isError = (activeTab === 'Buy' && buyError) || (activeTab === 'Sell' && sellError);
  const isFetching = (activeTab === 'Buy' && buyFetching) || (activeTab === 'Sell' && sellFetching);

  // Get USD to NGN rate from BUY rates (use first active rate) - same logic as BalanceCard
  const buyRates = ratesData?.data?.BUY || [];
  const activeBuyRate = buyRates.find(rate => rate.isActive);
  const usdToNgnRate = activeBuyRate ? parseFloat(activeBuyRate.rate) : 1500; // Fallback to 1500 if no rate found

  // Calculate NGN from USD using the rate - same as BalanceCard
  const calculateNgnFromUsd = (usdAmount: number) => {
    return usdAmount * usdToNgnRate;
  };

  // Format balance - same as BalanceCard
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    try {
      if (activeTab === 'Buy') {
        await refetchBuy();
      } else {
        await refetchSell();
      }
    } catch (error) {
      console.log('Error refreshing currencies:', error);
    }
  }, [activeTab, refetchBuy, refetchSell]);

  const handleAssetPress = (currency: ICryptoCurrency) => {
    if (activeTab === 'Buy') {
      // Navigate directly to buy crypto screen
      navigate('buycrypto' as any, {
        assetId: currency.id.toString(),
        assetName: currency.displayName || currency.name,
        selectedCurrency: currency.currency,
        selectedNetwork: currency.blockchain,
        currencySymbol: currency.symbol,
      });
    } else {
      // Navigate directly to sell crypto screen
      navigate('sellcrypto' as any, {
        assetId: currency.id.toString(),
        assetName: currency.displayName || currency.name,
        selectedCurrency: currency.currency,
        selectedNetwork: currency.blockchain,
        currencySymbol: currency.symbol,
        availableBalance: currency.availableBalance || '0',
      });
    }
  };

  // Get icon for currency based on currency name/symbol
  const getCurrencyIcon = (currency: ICryptoCurrency) => {
    const symbol = currency.symbol;
    const currencyUpper = currency.currency.toUpperCase();
    
    // If symbol is provided, try to use it as image URL
    if (symbol) {
      return { uri: getImageUrl(symbol) };
    }
    
    // Fallback to local icons
    switch (currencyUpper) {
      case 'BTC':
        return icons.btc;
      case 'ETH':
        return icons.eth;
      case 'USDT':
        return icons.usdt;
      case 'BNB':
      case 'BSC':
        return icons.bnb;
      case 'SOL':
        return icons.solana;
      default:
        return icons.btc; // Default fallback
    }
  };

  // Format price change (mock for now, as API doesn't provide this)
  const getPriceChange = () => {
    return { change: '+0.00%', changeType: 'positive' as const };
  };

  const renderAssetItem = ({ item }: { item: ICryptoCurrency }) => {
    const priceChange = getPriceChange();
    const currencyIcon = getCurrencyIcon(item);

    return (
      <TouchableOpacity
        style={[
          styles.assetItem,
          dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' },
        ]}
        onPress={() => handleAssetPress(item)}
      >
        <View style={styles.assetLeft}>
          <View style={styles.assetIconContainer}>
            <Image
              source={currencyIcon}
              style={styles.assetIcon}
              contentFit="contain"
            />
          </View>
          <View style={styles.assetInfo}>
            <Text
              style={[
                styles.assetName,
                dark ? { color: COLORS.white } : { color: COLORS.black },
              ]}
            >
              {item.displayName || item.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text
                style={[
                  styles.assetPrice,
                  dark ? { color: COLORS.white } : { color: COLORS.black },
                ]}
              >
                ${parseFloat(item.price || '0').toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.assetChange,
                  priceChange.changeType === 'positive' ? { color: '#46BE84' } : { color: '#FF0000' },
                ]}
              >
                {priceChange.change}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.assetRight}>
          {activeTab === 'Sell' && item.availableBalance ? (
            <>
              <Text
                style={[
                  styles.assetQuantity,
                  dark ? { color: COLORS.white } : { color: COLORS.black },
                ]}
              >
                {parseFloat(item.availableBalance || '0').toLocaleString()} {item.currency}
              </Text>
              <Text
                style={[
                  styles.assetValue,
                  dark ? { color: COLORS.white } : { color: COLORS.black },
                ]}
              >
                Available
              </Text>
            </>
          ) : (
            <Text
              style={[
                styles.assetValue,
                dark ? { color: COLORS.white } : { color: COLORS.black },
              ]}
            >
              {item.blockchainName || item.blockchain}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
      edges={[]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={icons.arrowBack}
            style={[styles.backIcon, { tintColor: COLORS.white }]}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Assets</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Balance Section */}
      <ImageBackground
        source={images.maskGroup3}
        style={styles.balanceSection}
        imageStyle={styles.balanceBackgroundImage}
        resizeMode="cover"
      >
        <View style={styles.balanceIconContainer}>
          <Image
            source={images.group}
            style={styles.balanceIcon}
            contentFit="contain"
          />
        </View>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceAmount}>
          ${formatBalance(parseFloat(totals.totalUsd || '0'))} ≈ N{formatBalance(calculateNgnFromUsd(parseFloat(totals.totalUsd || '0')))}
        </Text>
      </ImageBackground>

      {/* Buy/Sell Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segment,
              activeTab === 'Buy' && styles.segmentActive,
              activeTab === 'Buy' && { borderTopLeftRadius: 100, borderBottomLeftRadius: 100 },
            ]}
            onPress={() => setActiveTab('Buy')}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'Buy'
                  ? { color: COLORS.black }
                  : { color: COLORS.white },
              ]}
            >
              Buy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              activeTab === 'Sell' && styles.segmentActive,
              activeTab === 'Sell' && { borderTopRightRadius: 100, borderBottomRightRadius: 100 },
            ]}
            onPress={() => setActiveTab('Sell')}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'Sell'
                  ? { color: COLORS.black }
                  : { color: COLORS.white },
              ]}
            >
              Sell
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Assets List */}
      <View style={[styles.contentSection, { marginTop: 0 }]}>
        <Text
          style={[
            styles.sectionTitle,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          {activeTab === 'Buy' ? 'Buy Crypto' : 'Sell Crypto'}
        </Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Loading {activeTab === 'Buy' ? 'buy' : 'sell'} currencies...
            </Text>
          </View>
        ) : isError ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Error loading currencies
            </Text>
          </View>
        ) : (
          <FlatList
            data={currencies}
            renderItem={renderAssetItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  No {activeTab === 'Buy' ? 'buy' : 'sell'} currencies available
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default AllAssets;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    padding: 8,
    paddingTop: 25,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    paddingTop: 20,
    color: COLORS.white,
  },
  headerRight: {
    width: 40,
  },
  balanceSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  balanceBackgroundImage: {
    resizeMode: 'cover',
  },
  balanceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#28A563',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceIcon: {
    width: 30,
    height: 30,
  },
  balanceLabel: {
    fontSize: isTablet ? 16 : 10,
    color: COLORS.white,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 14,
    fontWeight: '400',
    color: '#00000080',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F7F7F7',
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetIcon: {
    width: 40,
    height: 40,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  assetPrice: {
    fontSize: isTablet ? 16 : 10,
    fontWeight: '400',
    marginBottom: 2,
  },
  assetChange: {
    fontSize: isTablet ? 14 : 10,
    fontWeight: '400',
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetQuantity: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  assetValue: {
    fontSize: isTablet ? 14 : 10,
    fontWeight: '400',
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.primary,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
    padding: 4,
    height: 44,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  segmentActive: {
    backgroundColor: COLORS.white,
  },
  segmentText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
});
