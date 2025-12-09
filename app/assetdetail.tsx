import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getCryptoAssetById, ICryptoAssetDetail, ICryptoTransaction } from '@/utils/queries/accountQueries';
import { getImageUrl } from '@/utils/helpers';
import { showTopToast } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const AssetDetail = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const { assetId, assetName } = useLocalSearchParams<{ assetId: string; assetName: string }>();
  const [insufficientBalanceModalVisible, setInsufficientBalanceModalVisible] = useState(false);

  // Fetch asset details from API
  const {
    data: assetData,
    isLoading: assetLoading,
    isError: assetError,
    refetch: refetchAsset,
    isFetching: assetFetching,
  } = useQuery({
    queryKey: ['cryptoAsset', assetId],
    queryFn: () => getCryptoAssetById(token, parseInt(assetId || '0')),
    enabled: !!token && !!assetId,
  });

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    try {
      await refetchAsset();
    } catch (error) {
      console.log('Error refreshing asset:', error);
    }
  }, [refetchAsset]);

  const assetDetail: ICryptoAssetDetail | undefined = assetData?.data;
  const transactions: ICryptoTransaction[] = assetDetail?.transactions || [];

  // Get asset icon from API symbol or fallback
  const getAssetIcon = (symbol?: string, currency?: string, name?: string) => {
    if (symbol) {
      return { uri: getImageUrl(symbol) };
    }
    const currencyUpper = (currency || name || '').toUpperCase();
    if (currencyUpper.includes('BTC') || currencyUpper.includes('BITCOIN')) return icons.btc;
    if (currencyUpper.includes('ETH') || currencyUpper.includes('ETHEREUM')) return icons.eth;
    if (currencyUpper.includes('USDT') || currencyUpper.includes('TETHER')) return icons.usdt;
    if (currencyUpper.includes('SOL') || currencyUpper.includes('SOLANA')) return icons.solana;
    if (currencyUpper.includes('BNB')) return icons.bnb;
    return icons.usdt; // Default
  };

  const assetIcon = assetDetail
    ? getAssetIcon(assetDetail.symbol, assetDetail.currency, assetDetail.name)
    : getAssetIcon(undefined, undefined, assetName);

  // Check if balance is sufficient
  const hasBalance = () => {
    if (!assetDetail) return false;
    const balance = parseFloat(assetDetail.availableBalance || '0');
    return balance > 0;
  };

  // Handle action button press with balance validation
  const handleActionPress = (actionId: string) => {
    // Actions that require balance: send, swap, sell
    const requiresBalance = ['send', 'swap', 'sell'];
    
    if (requiresBalance.includes(actionId) && !hasBalance()) {
      setInsufficientBalanceModalVisible(true);
      return;
    }

    const asset = {
      id: assetDetail?.id?.toString() || assetId || '0',
      name: assetDetail?.name || assetName || 'USDT',
      currency: assetDetail?.currency || 'USDT',
      virtualAccountId: assetDetail?.id || parseInt(assetId || '0'),
    };

    if (actionId === 'send') {
      router.push({
        pathname: '/sendcrypto',
        params: {
          assetName: asset.name,
          assetId: asset.id,
          currency: asset.currency,
          virtualAccountId: asset.virtualAccountId.toString(),
        },
      });
    } else if (actionId === 'buy') {
      navigate('buycrypto' as any, {
        assetName: asset.name,
        assetId: asset.id,
        currency: asset.currency,
        virtualAccountId: asset.virtualAccountId.toString(),
      });
    } else if (actionId === 'sell') {
      navigate('sellcrypto' as any, {
        assetName: asset.name,
        assetId: asset.id,
        currency: asset.currency,
        virtualAccountId: asset.virtualAccountId.toString(),
      });
    } else if (actionId === 'receive') {
      navigate('receivecrypto' as any, {
        assetName: asset.name,
        assetId: asset.id,
        accountId: asset.virtualAccountId.toString(),
      });
    } else if (actionId === 'swap') {
      router.push({
        pathname: '/swap',
        params: {
          assetId: asset.id,
          assetName: asset.name,
          currency: asset.currency,
        },
      });
    }
  };

  const actionButtons = [
    { id: 'sell', label: 'Sell', icon: images.discountCircle },
    { id: 'receive', label: 'Receive', icon: images.assetReceive },
    { id: 'buy', label: 'Buy', icon: icons.secondicon },
    { id: 'swap', label: 'Swap', icon: icons.fourthicon },
    { id: 'send', label: 'Send', icon: images.assetSend },
  ];

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'BUY':
        return icons.secondicon;
      case 'SELL':
        return images.discountCircle;
      case 'SWAP':
        return icons.fourthicon;
      case 'SEND':
        return images.assetSend;
      case 'RECEIVE':
        return images.assetReceive;
      default:
        return images.discountCircle;
    }
  };

  // Format transaction amount
  const formatTransactionAmount = (transaction: ICryptoTransaction) => {
    if (transaction.type === 'SWAP' && transaction.fromAmount && transaction.toAmount) {
      return `${transaction.fromAmount} ${transaction.fromCurrency || ''} → ${transaction.toAmount} ${transaction.toCurrency || ''}`;
    }
    return `${transaction.amount} ${transaction.currency || ''}`;
  };

  // Format transaction USD value
  const formatTransactionUsdValue = (transaction: ICryptoTransaction) => {
    // For swap transactions, show both amounts in USD if available
    if (transaction.type === 'SWAP') {
      return `~$${parseFloat(transaction.amount || '0').toFixed(2)}`;
    }
    return `~$${parseFloat(transaction.amount || '0').toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const renderTransaction = ({ item }: { item: ICryptoTransaction }) => (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' },
      ]}
      onPress={() => {
        // Navigate to transaction detail based on type
        const routeMap: { [key: string]: string } = {
          BUY: '/cryptobought',
          SELL: '/cryptosold',
          SWAP: '/swapsuccess',
        };
        const route = routeMap[item.type?.toUpperCase() || ''];
        if (route) {
          router.push({
            pathname: route as any,
            params: { id: item.id },
          });
        }
      }}
    >
      <View style={styles.transactionLeft}>
        <View style={styles.transactionIconContainer}>
          <Image
            source={getTransactionIcon(item.type)}
            style={styles.transactionIcon}
            contentFit="contain"
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text
            style={[
              styles.transactionType,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {item.type || 'Transaction'}
          </Text>
          <Text
            style={[
              styles.transactionDate,
              dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
            ]}
          >
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
          numberOfLines={1}
        >
          {formatTransactionAmount(item)}
        </Text>
        <Text
          style={[
            styles.transactionValue,
            dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
          ]}
        >
          {formatTransactionUsdValue(item)}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Balance</Text>
        <View style={styles.headerRight} />
      </View>

      {assetLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Loading asset details...
          </Text>
        </View>
      ) : assetError ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Error loading asset details
          </Text>
        </View>
      ) : assetDetail ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={assetFetching}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* Balance Section */}
          <ImageBackground
            source={images.maskGroup2}
            style={styles.balanceSection}
            imageStyle={styles.balanceBackgroundImage}
            resizeMode="cover"
          >
            <View style={styles.assetIconLargeContainer}>
              <Image
                source={assetIcon}
                style={styles.assetIconLarge}
                contentFit="contain"
              />
            </View>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <Text style={styles.balanceAmount}>
              {parseFloat(assetDetail.availableBalance || '0').toLocaleString()} {assetDetail.name || assetDetail.currency}
            </Text>
            <Text style={styles.balanceEquivalent}>
              ~${parseFloat(assetDetail.availableBalanceUsd || '0').toLocaleString()}, ~N{parseFloat(assetDetail.availableBalanceNaira || '0').toLocaleString()}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              {actionButtons.map((action) => {
                const requiresBalance = ['send', 'swap', 'sell'].includes(action.id);
                const isDisabled = requiresBalance && !hasBalance();
                
                return (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionButton,
                      isDisabled && styles.actionButtonDisabled,
                    ]}
                    onPress={() => handleActionPress(action.id)}
                    disabled={isDisabled}
                  >
                    <View style={[
                      styles.actionButtonIconContainer,
                      isDisabled && styles.actionButtonIconContainerDisabled,
                    ]}>
                      <Image
                        source={action.icon}
                        style={[
                          styles.actionButtonIcon,
                          isDisabled && { opacity: 0.5 },
                        ]}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={[
                      styles.actionButtonLabel,
                      isDisabled && styles.actionButtonLabelDisabled,
                    ]}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ImageBackground>

          {/* Transactions Section */}
          <View style={[
            styles.transactionsSection,
            dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
          ]}>
            <Text
              style={[
                styles.transactionsTitle,
                dark ? { color: COLORS.white } : { color: COLORS.black },
              ]}
            >
              Transactions
            </Text>
            {transactions.length > 0 ? (
              <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.transactionsList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  No transactions found
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}

      {/* Insufficient Balance Modal */}
      <Modal
        visible={insufficientBalanceModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInsufficientBalanceModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setInsufficientBalanceModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Insufficient Balance
            </Text>
            <Text style={[styles.modalMessage, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              You don't have enough balance to perform this action. Please add funds to your wallet first.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setInsufficientBalanceModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default AssetDetail;

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
    paddingTop:40,
    backgroundColor: COLORS.primary,
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
    fontWeight: '400',
    color: COLORS.white,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  balanceSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  balanceBackgroundImage: {
    resizeMode: 'cover',
  },
  assetIconLargeContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 2,
  },
  assetIconLarge: {
    width: 60,
    height: 60,
  },
  balanceLabel: {
    fontSize: isTablet ? 16 : 10,
    color: COLORS.white,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: isTablet ? 32 : 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  balanceEquivalent: {
    fontSize: isTablet ? 16 : 12,
    color: COLORS.white,
    marginBottom: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    // paddingHorizontal: 12,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionButtonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonIcon: {
    width: 20,
    height: 20,
  },
  actionButtonLabel: {
    fontSize: isTablet ? 14 : 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  transactionsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // marginTop: -20,
  },
  transactionsTitle: {
    fontSize: isTablet ? 20 : 14,
    fontWeight: '400',
    marginBottom: 16,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F7F7F7',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: '#557314',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIcon: {
    width: 24,
    height: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: isTablet ? 14 : 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionValue: {
    fontSize: isTablet ? 14 : 12,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
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
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonIconContainerDisabled: {
    opacity: 0.5,
  },
  actionButtonLabelDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 100,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
});

