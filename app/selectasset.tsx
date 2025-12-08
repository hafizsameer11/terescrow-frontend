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
import { getBuyCurrencies, getSellCurrencies, ICryptoCurrency } from '@/utils/queries/accountQueries';
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
  const { forReceive, fromTradeCrypto, forBuy, forSell } = useLocalSearchParams<{ forReceive?: string; fromTradeCrypto?: string; forBuy?: string; forSell?: string }>();

  // Fetch currencies based on flow
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

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (forBuy === 'true') {
        await refetchBuy();
      } else if (forSell === 'true') {
        await refetchSell();
      }
    } catch (error) {
      console.error('Error refreshing currencies:', error);
    } finally {
      setRefreshing(false);
    }
  }, [forBuy, forSell, refetchBuy, refetchSell]);

  // Get currencies based on flow
  const currencies: ICryptoCurrency[] = React.useMemo(() => {
    if (forBuy === 'true' && buyCurrenciesData?.data?.currencies) {
      return buyCurrenciesData.data.currencies;
    } else if (forSell === 'true' && sellCurrenciesData?.data?.currencies) {
      return sellCurrenciesData.data.currencies;
    }
    return [];
  }, [forBuy, forSell, buyCurrenciesData, sellCurrenciesData]);

  const isLoading = (forBuy === 'true' && buyLoading) || (forSell === 'true' && sellLoading);

  const handleAssetPress = (currency: ICryptoCurrency) => {
    // If coming from receive flow, navigate to receive crypto screen
    if (forReceive === 'true') {
      navigate('receivecrypto' as any, {
        assetId: currency.id.toString(),
        assetName: currency.displayName || currency.name,
      });
    } else if (forSell === 'true') {
      // If coming from sell flow, navigate to sell crypto screen
      navigate('sellcrypto' as any, {
        assetId: currency.id.toString(),
        assetName: currency.displayName || currency.name,
        selectedCurrency: currency.currency,
        selectedNetwork: currency.blockchain,
        currencySymbol: currency.symbol,
        availableBalance: currency.availableBalance || '0',
      });
    } else if (forBuy === 'true') {
      // If coming from buy flow, navigate to buy crypto screen with currency and blockchain
      navigate('buycrypto' as any, {
        assetId: currency.id.toString(),
        assetName: currency.displayName || currency.name,
        selectedCurrency: currency.currency,
        selectedNetwork: currency.blockchain,
        currencySymbol: currency.symbol,
      });
    } else if (fromTradeCrypto === 'true') {
      // If coming from trade crypto, navigate to asset detail instead of asset network modal
      navigate('assetdetail', {
        assetId: currency.id.toString(),
        assetName: currency.displayName || currency.name,
      });
    } else {
      // Open Asset & Network modal (for swap flow)
      navigate('assetnetwork', {
        assetId: currency.id.toString(),
        assetName: currency.displayName || currency.name,
        assetIcon: currency.symbol,
        wallet: currency.blockchainName,
        forReceive: forReceive || 'false',
      });
    }
  };

  const renderAssetItem = ({ item }: { item: ICryptoCurrency }) => {
    const currencyIcon = getCurrencyIcon(item.symbol, item.currency);
    const iconSource = item.symbol && item.symbol.startsWith('http') 
      ? { uri: item.symbol } 
      : item.symbol 
        ? { uri: getImageUrl(item.symbol) }
        : currencyIcon;

    // For sell flow, show available balance instead of price
    const showBalance = forSell === 'true' && item.availableBalance !== undefined;
    const displayValue = showBalance 
      ? `${parseFloat(item.availableBalance || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${item.currency}`
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
              {item.displayName || item.name}
            </Text>
            <Text
              style={[
                styles.assetWallet,
                dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
              ]}
            >
              {item.blockchainName || item.blockchain}
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
          {forSell === 'true' ? 'Sell Asset' : forBuy === 'true' ? 'Buy Asset' : forReceive === 'true' ? 'Receive Asset' : 'Select Asset'}
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

