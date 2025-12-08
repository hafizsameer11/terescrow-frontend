import React, { useState, useCallback } from 'react';
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
import { getCryptoAssets, ICryptoAsset } from '@/utils/queries/accountQueries';
import { getImageUrl } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const AllAssets = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();

  // Fetch crypto assets from API
  const {
    data: assetsData,
    isLoading: assetsLoading,
    isError: assetsError,
    refetch: refetchAssets,
    isFetching: assetsFetching,
  } = useQuery({
    queryKey: ['cryptoAssets'],
    queryFn: () => getCryptoAssets(token),
    enabled: !!token,
  });

  const assets: ICryptoAsset[] = assetsData?.data?.assets || [];
  const totals = assetsData?.data?.totals || { totalUsd: '0', totalNaira: '0' };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    try {
      await refetchAssets();
    } catch (error) {
      console.log('Error refreshing assets:', error);
    }
  }, [refetchAssets]);

  const handleAssetPress = (asset: ICryptoAsset) => {
    navigate('assetdetail', {
      assetId: asset.id.toString(),
      assetName: asset.name,
    });
  };

  // Get icon for asset based on currency
  const getAssetIcon = (currency: string, symbol?: string) => {
    const currencyUpper = currency.toUpperCase();
    switch (currencyUpper) {
      case 'BTC':
        return icons.btc;
      case 'ETH':
        return icons.eth;
      case 'USDT':
        return icons.usdt;
      case 'BNB':
        return icons.bnb;
      case 'SOL':
        return icons.solana;
      default:
        // If symbol is provided, try to use it as image URL
        if (symbol) {
          return { uri: getImageUrl(symbol) };
        }
        return icons.btc; // Default fallback
    }
  };

  // Format price change (mock for now, as API doesn't provide this)
  const getPriceChange = () => {
    return { change: '+0.00%', changeType: 'positive' as const };
  };

  const renderAssetItem = ({ item }: { item: ICryptoAsset }) => {
    const priceChange = getPriceChange();
    const assetIcon = getAssetIcon(item.currency, item.symbol);

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
              source={assetIcon}
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
              {item.name}
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
          <Text
            style={[
              styles.assetQuantity,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {parseFloat(item.balance || '0').toLocaleString()}
          </Text>
          <Text
            style={[
              styles.assetValue,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            ${parseFloat(item.balanceUsd || '0').toLocaleString()} ≈ N{parseFloat(item.balanceNaira || '0').toLocaleString()}
          </Text>
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
          ${parseFloat(totals.totalUsd || '0').toLocaleString()} ≈ N{parseFloat(totals.totalNaira || '0').toLocaleString()}
        </Text>
      </ImageBackground>

      {/* Assets List */}
      <View style={styles.contentSection}>
        <Text
          style={[
            styles.sectionTitle,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          Crypto Assets
        </Text>
        {assetsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Loading assets...
            </Text>
          </View>
        ) : assetsError ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Error loading assets
            </Text>
          </View>
        ) : (
          <FlatList
            data={assets}
            renderItem={renderAssetItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={assetsFetching}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  No assets found
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
});
