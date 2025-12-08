import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getBuyCurrencies, getSellCurrencies, getCryptoAssets, getSwapCurrencies, ICryptoCurrency, ICryptoAsset, ISwapCurrency } from '@/utils/queries/accountQueries';
import { getImageUrl } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Map currency symbol to local icon
const getCurrencyIcon = (symbol: string, currency: string): any => {
  const symbolLower = symbol.toLowerCase();
  const currencyLower = currency.toLowerCase();
  
  if (currencyLower.includes('btc') || symbolLower.includes('btc')) return icons.btc;
  if (currencyLower.includes('eth') && !currencyLower.includes('usdt') && !currencyLower.includes('usdc')) return icons.eth;
  if (currencyLower.includes('usdt')) return icons.usdt;
  if (currencyLower.includes('usdc')) return icons.dollarCoin || icons.usdt;
  if (currencyLower.includes('sol')) return icons.solana;
  if (currencyLower.includes('bnb') || currencyLower.includes('bsc')) return icons.bnb;
  if (currencyLower.includes('tron') || currencyLower.includes('trx')) return icons.tron;
  if (currencyLower.includes('ltc')) return icons.btc; // Fallback
  if (currencyLower.includes('ton')) return icons.tonCoin;
  return icons.usdt; // Default fallback
};

const SelectAsset = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const { forReceive, fromTradeCrypto, forBuy, forSell, forSwap } = useLocalSearchParams<{ forReceive?: string; fromTradeCrypto?: string; forBuy?: string; forSell?: string; forSwap?: string }>();

  // Fetch currencies/assets based on flow
  const { data: buyCurrenciesData, isLoading: buyLoading, refetch: refetchBuy } = useQuery({
    queryKey: ['buyCurrencies'],
    queryFn: () => getBuyCurrencies(token),
    enabled: forBuy === 'true' && !!token,
  });

  const { data: sellCurrenciesData, isLoading: sellLoading, refetch: refetchSell } = useQuery({
    queryKey: ['sellCurrencies'],
    queryFn: () => getSellCurrencies(token),
    enabled: forSell === 'true' && !!token,
  });

  const { data: receiveAssetsData, isLoading: receiveLoading, refetch: refetchReceive } = useQuery({
    queryKey: ['cryptoAssets'],
    queryFn: () => getCryptoAssets(token),
    enabled: forReceive === 'true' && !!token,
  });

  const { data: swapCurrenciesData, isLoading: swapLoading, refetch: refetchSwap } = useQuery({
    queryKey: ['swapCurrencies'],
    queryFn: () => getSwapCurrencies(token),
    enabled: forSwap === 'true' && !!token,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (forBuy === 'true') {
        await refetchBuy();
      } else if (forSell === 'true') {
        await refetchSell();
      } else if (forReceive === 'true') {
        await refetchReceive();
      } else if (forSwap === 'true') {
        await refetchSwap();
      }
    } catch (error) {
      console.error('Error refreshing currencies:', error);
    } finally {
      setRefreshing(false);
    }
  }, [forBuy, forSell, forReceive, forSwap, refetchBuy, refetchSell, refetchReceive, refetchSwap]);

  // Get currencies/assets based on flow
  const currencies: (ICryptoCurrency | ICryptoAsset | ISwapCurrency)[] = React.useMemo(() => {
    if (forBuy === 'true' && buyCurrenciesData?.data?.currencies) {
      return buyCurrenciesData.data.currencies;
    } else if (forSell === 'true' && sellCurrenciesData?.data?.currencies) {
      return sellCurrenciesData.data.currencies;
    } else if (forReceive === 'true' && receiveAssetsData?.data?.assets) {
      // Convert assets to currency-like format for rendering
      return receiveAssetsData.data.assets.map((asset) => ({
        id: asset.id,
        currency: asset.currency,
        blockchain: asset.blockchain,
        name: asset.name,
        symbol: asset.symbol,
        price: asset.price,
        nairaPrice: asset.nairaPrice,
        isToken: false, // Assets don't have this field
        tokenType: null,
        blockchainName: asset.blockchain,
        displayName: asset.name,
        availableBalance: asset.balance,
      }));
    } else if (forSwap === 'true' && swapCurrenciesData?.data?.currencies) {
      // Swap currencies already have the right format
      return swapCurrenciesData.data.currencies;
    }
    return [];
  }, [forBuy, forSell, forReceive, forSwap, buyCurrenciesData, sellCurrenciesData, receiveAssetsData, swapCurrenciesData]);

  const isLoading = (forBuy === 'true' && buyLoading) || (forSell === 'true' && sellLoading) || (forReceive === 'true' && receiveLoading) || (forSwap === 'true' && swapLoading);

  const handleAssetPress = (currency: ICryptoCurrency | ICryptoAsset | ISwapCurrency) => {
    // Helper to get display name
    const getDisplayName = (item: ICryptoCurrency | ICryptoAsset) => {
      if ('displayName' in item) return item.displayName || item.name;
      return item.name;
    };

    // Helper to get available balance
    const getAvailableBalance = (item: ICryptoCurrency | ICryptoAsset) => {
      if ('availableBalance' in item) return item.availableBalance || '0';
      if ('balance' in item) return item.balance || '0';
      return '0';
    };

    // Helper to get blockchain name
    const getBlockchainName = (item: ICryptoCurrency | ICryptoAsset) => {
      if ('blockchainName' in item) return item.blockchainName || item.blockchain;
      return item.blockchain;
    };

    // If coming from receive flow, navigate to receive crypto screen with virtual account ID
    if (forReceive === 'true') {
      navigate('receivecrypto' as any, {
        assetId: currency.id.toString(), // This is the virtualAccountId
        assetName: getDisplayName(currency),
        selectedNetwork: currency.blockchain,
        currencySymbol: currency.symbol,
      });
    } else if (forSell === 'true') {
      // If coming from sell flow, navigate to sell crypto screen
      navigate('sellcrypto' as any, {
        assetId: currency.id.toString(),
        assetName: getDisplayName(currency),
        selectedCurrency: currency.currency,
        selectedNetwork: currency.blockchain,
        currencySymbol: currency.symbol,
        availableBalance: getAvailableBalance(currency),
      });
    } else if (forBuy === 'true') {
      // If coming from buy flow, navigate to buy crypto screen with currency and blockchain
      navigate('buycrypto' as any, {
        assetId: currency.id.toString(),
        assetName: getDisplayName(currency),
        selectedCurrency: currency.currency,
        selectedNetwork: currency.blockchain,
        currencySymbol: currency.symbol,
      });
    } else if (fromTradeCrypto === 'true') {
      // If coming from trade crypto, navigate to asset detail instead of asset network modal
      navigate('assetdetail', {
        assetId: currency.id.toString(),
        assetName: getDisplayName(currency),
      });
    } else if (forSwap === 'true') {
      // If coming from swap flow, navigate back to swap screen with selected currency
      const swapCurrency = currency as ISwapCurrency;
      navigate('swap' as any, {
        assetId: currency.id.toString(),
        assetName: swapCurrency.displayName || swapCurrency.name || currency.name,
        assetIcon: currency.symbol,
        wallet: swapCurrency.blockchainName || currency.blockchain,
        network: currency.blockchain,
      });
    } else {
      // Open Asset & Network modal (for other flows)
      navigate('assetnetwork', {
        assetId: currency.id.toString(),
        assetName: getDisplayName(currency),
        assetIcon: currency.symbol,
        wallet: getBlockchainName(currency),
        forReceive: forReceive || 'false',
      });
    }
  };

  const renderAssetItem = ({ item }: { item: ICryptoCurrency | ICryptoAsset }) => {
    const currencyIcon = getCurrencyIcon(item.symbol, item.currency);
    const iconSource = item.symbol && item.symbol.startsWith('http') 
      ? { uri: item.symbol } 
      : item.symbol 
        ? { uri: getImageUrl(item.symbol) }
        : currencyIcon;

    // Helper functions to safely access properties
    const getDisplayName = () => {
      if ('displayName' in item) return item.displayName || item.name;
      return item.name;
    };

    const getBlockchainName = () => {
      if ('blockchainName' in item) return item.blockchainName || item.blockchain;
      return item.blockchain;
    };

    const getAvailableBalance = () => {
      if ('availableBalance' in item) return item.availableBalance;
      if ('balance' in item) return item.balance;
      return undefined;
    };

    // For sell/receive flow, show balance instead of price
    const showBalance = (forSell === 'true' || forReceive === 'true') && getAvailableBalance() !== undefined;
    const balanceValue = getAvailableBalance();
    const displayValue = showBalance && balanceValue
      ? `${parseFloat(balanceValue || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${item.currency}`
      : `$${parseFloat(item.price || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
      <TouchableOpacity
        style={[
          styles.assetCard,
          dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' },
        ]}
        onPress={() => handleAssetPress(item)}
      >
        {/* Top Right: Price/Balance Pill */}
        <View style={styles.topRightContainer}>
          <View
            style={[
              styles.valueTag,
              dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E8E8E8' },
            ]}
          >
            <Text
              style={[
                styles.valueText,
                dark ? { color: COLORS.white } : { color: COLORS.black },
                showBalance && { fontSize: isTablet ? 10 : 8 },
              ]}
            >
              {displayValue}
            </Text>
          </View>
        </View>

        {/* Left Side: Icon and Text */}
        <View style={styles.assetLeft}>
          <Image
            source={iconSource}
            style={styles.assetIcon}
            contentFit="contain"
          />
          <View style={styles.assetInfo}>
            <Text
              style={[
                styles.assetName,
                dark ? { color: COLORS.white } : { color: COLORS.black },
              ]}
            >
              {getDisplayName()}
            </Text>
            <Text
              style={[
                styles.assetWallet,
                dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
              ]}
            >
              {getBlockchainName()}
            </Text>
          </View>
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
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={icons.arrowBack}
            style={[styles.backIcon, dark ? { tintColor: COLORS.white } : { tintColor: COLORS.black }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
          {forSell === 'true' ? 'Sell Asset' : forBuy === 'true' ? 'Buy Asset' : forReceive === 'true' ? 'Receive Asset' : forSwap === 'true' ? 'Select Asset to Swap' : 'Select Asset'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Assets Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : currencies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            {forBuy === 'true' || forSell === 'true' 
              ? 'No currencies available' 
              : 'No assets found'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currencies}
          renderItem={renderAssetItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SelectAsset;

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
    // marginRight: 10,
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  assetCard: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    marginBottom: 12,
    position: 'relative',
  },
  topRightContainer: {
    position: 'absolute',
    top: 28,
    right: 0,
    zIndex: 1,
  },
  valueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderRadius: 20,
    borderTopLeftRadius:10,
    borderBottomLeftRadius:10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#E5E5E5',
    gap: 4,
  },
  walletIcon: {
    width: 10,
    height: 10,
  },
  valueText: {
    fontSize: isTablet ? 12 : 8,
    fontWeight: '600',
    marginRight: 4,
  },
  changeText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '500',
  },
  assetLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  assetIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 5,
  },
  assetWallet: {
    fontSize: isTablet ? 12 : 12,
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
  },
});

