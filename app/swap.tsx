import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getSwapCurrencies, getSwapQuote, getSwapPreview, ISwapCurrency, ISwapQuoteRequest } from '@/utils/queries/accountQueries';
import { getBuyCurrencies, ICryptoCurrency } from '@/utils/queries/accountQueries';
import { swapCrypto, ISwapCryptoRequest } from '@/utils/mutations/authMutations';
import { showTopToast } from '@/utils/helpers';
import { getImageUrl } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Swap = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    assetId?: string;
    assetName?: string;
    assetIcon?: string;
    wallet?: string;
    network?: string;
    receiveAssetId?: string;
    receiveAssetName?: string;
    receiveAssetIcon?: string;
    receiveWallet?: string;
    receiveNetwork?: string;
    forReceive?: string;
    selectedCurrency?: string;
    selectedNetwork?: string;
    currencySymbol?: string;
  }>();

  // Fetch swap currencies (currencies user can swap FROM - only those with balance > 0)
  const {
    data: swapCurrenciesData,
    isLoading: swapCurrenciesLoading,
    refetch: refetchSwapCurrencies,
  } = useQuery({
    queryKey: ['swapCurrencies'],
    queryFn: () => getSwapCurrencies(token),
    enabled: !!token,
  });

  // Fetch buy currencies (for selecting "You Receive" asset)
  const {
    data: buyCurrenciesData,
    isLoading: buyCurrenciesLoading,
  } = useQuery({
    queryKey: ['buyCurrencies'],
    queryFn: () => getBuyCurrencies(token),
    enabled: !!token,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [payAsset, setPayAsset] = useState<ISwapCurrency | null>(null);
  const [receiveAsset, setReceiveAsset] = useState<ICryptoCurrency | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('0');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [receiveAssetModalVisible, setReceiveAssetModalVisible] = useState(false);

  // Initialize pay asset from params or first available currency
  useEffect(() => {
    if (swapCurrenciesData?.data?.currencies && swapCurrenciesData.data.currencies.length > 0) {
      if (params.assetId && params.assetName) {
        // Find currency by ID
        const found = swapCurrenciesData.data.currencies.find(
          (c) => c.id.toString() === params.assetId
        );
        if (found) {
          setPayAsset(found);
        } else {
          setPayAsset(swapCurrenciesData.data.currencies[0]);
        }
      } else {
        setPayAsset(swapCurrenciesData.data.currencies[0]);
      }
    }
  }, [swapCurrenciesData, params.assetId, params.assetName]);

  // Update pay asset when coming back from selectasset (for swap flow)
  useFocusEffect(
    React.useCallback(() => {
      if (params.assetId && params.assetName && swapCurrenciesData?.data?.currencies) {
        const found = swapCurrenciesData.data.currencies.find(
          (c) => c.id.toString() === params.assetId
        );
        if (found) {
          setPayAsset(found);
        }
      }
    }, [params.assetId, params.assetName, swapCurrenciesData])
  );

  // Note: Receive asset selection is now handled via modal, not navigation

  // Get quote function - memoized with useCallback
  const getQuote = useCallback(async () => {
    if (!payAsset || !receiveAsset || !payAmount || parseFloat(payAmount) <= 0) {
      setReceiveAmount('0');
      return;
    }

    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      setReceiveAmount('0');
      return;
    }

    setIsGettingQuote(true);
    try {
      const quoteRequest: ISwapQuoteRequest = {
        fromAmount: amount,
        fromCurrency: payAsset.currency,
        fromBlockchain: payAsset.blockchain,
        toCurrency: receiveAsset.currency,
        toBlockchain: receiveAsset.blockchain,
      };

      console.log('Getting swap quote with request:', quoteRequest);
      const response = await getSwapQuote(token, quoteRequest);
      if (response?.data) {
        console.log('Swap quote response:', response.data);
        setReceiveAmount(response.data.toAmount || '0');
      }
    } catch (error: any) {
      console.error('Error getting swap quote:', error);
      // Don't show toast for rate errors, just log
      if (!error?.message?.includes('rate') && !error?.message?.includes('Rate')) {
        // showTopToast({
        //   type: 'error',
        //   text1: 'Error',
        //   text2: error?.message || 'Failed to get swap quote',
        // });
      }
      setReceiveAmount('0');
    } finally {
      setIsGettingQuote(false);
    }
  }, [payAsset, receiveAsset, payAmount, token]);

  // Get quote when payAmount, payAsset, or receiveAsset changes
  useEffect(() => {
    if (!payAsset || !receiveAsset || !payAmount || parseFloat(payAmount) <= 0) {
      setReceiveAmount('0');
      return;
    }

    const timeoutId = setTimeout(() => {
      getQuote();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [payAmount, payAsset, receiveAsset, getQuote]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchSwapCurrencies();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchSwapCurrencies]);

  // Get asset icon helper
  const getAssetIcon = (symbol?: string, currency?: string, name?: string) => {
    if (symbol) {
      if (symbol.startsWith('http')) {
        return { uri: symbol };
      } else {
        return { uri: getImageUrl(symbol) };
      }
    }
    const nameLower = (name || currency || '').toLowerCase();
    if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return icons.btc;
    if (nameLower.includes('ethereum') || nameLower.includes('eth')) return icons.eth;
    if (nameLower.includes('tether') || nameLower.includes('usdt')) return icons.usdt;
    if (nameLower.includes('solana') || nameLower.includes('sol')) return icons.solana;
    if (nameLower.includes('bnb') || nameLower.includes('bsc')) return icons.bnb;
    if (nameLower.includes('shiba')) return icons.shibaInu;
    if (nameLower.includes('doge')) return icons.dogeCoin;
    if (nameLower.includes('usdc')) return icons.dollarCoin || icons.usdt;
    if (nameLower.includes('ton')) return icons.tonCoin;
    if (nameLower.includes('tron')) return icons.tron;
    return icons.eth;
  };

  const handlePayAssetPress = () => {
    // Navigate to select asset for swap currencies
    navigate('selectasset', { forSwap: 'true' });
  };

  const handleReceiveAssetPress = () => {
    setReceiveAssetModalVisible(true);
  };

  const handleSelectReceiveAsset = (currency: ICryptoCurrency) => {
    console.log('Selecting receive asset:', {
      currency: currency.currency,
      name: currency.name,
      blockchain: currency.blockchain,
      currentPayAsset: payAsset?.currency,
      currentPayAmount: payAmount,
    });
    setReceiveAsset(currency);
    setReceiveAssetModalVisible(false);
    // Reset receive amount when asset changes - will be recalculated by useEffect
    setReceiveAmount('0');
    // The useEffect will automatically trigger quote calculation when receiveAsset changes
    // No need to manually call getQuote here as useEffect handles it
  };

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: (data: ISwapQuoteRequest) => getSwapPreview(token, data),
    onSuccess: (response) => {
      if (response?.data) {
        // Validate preview data before showing modal
        if (!response.data.hasSufficientBalance) {
          showTopToast({
            type: 'error',
            text1: 'Insufficient Balance',
            text2: 'You do not have sufficient balance to complete this swap',
          });
          return;
        }
        if (!response.data.canProceed) {
          showTopToast({
            type: 'error',
            text1: 'Cannot Proceed',
            text2: 'This swap cannot be completed at this time',
          });
          return;
        }
        setPreviewData(response.data);
        setReviewModalVisible(true);
      }
    },
    onError: (error: any) => {
      console.error('Error getting swap preview:', error);
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to get swap preview',
      });
    },
  });

  // Swap mutation
  const swapMutation = useMutation({
    mutationFn: (data: ISwapCryptoRequest) => {
      console.log('Calling swap API with data:', data);
      return swapCrypto(token, data);
    },
    onSuccess: (response) => {
      console.log('Swap API response:', response);
      setReviewModalVisible(false);
      // Reset form
      setPayAmount('');
      setReceiveAmount('0');
      setPreviewData(null);
      // Invalidate queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ['swapCurrencies'] });
      queryClient.invalidateQueries({ queryKey: ['buyCurrencies'] });
      queryClient.invalidateQueries({ queryKey: ['cryptoAssets'] });
      queryClient.invalidateQueries({ queryKey: ['walletOverview'] });
      queryClient.invalidateQueries({ queryKey: ['cryptoTransactions'] });
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Swap completed successfully',
      });
      router.push({
        pathname: '/swapsuccess',
        params: {
          payAsset: payAsset?.displayName || payAsset?.name || '',
          receiveAsset: receiveAsset?.displayName || receiveAsset?.name || '',
          transactionId: response?.data?.transactionId || '',
        },
      });
    },
    onError: (error: any) => {
      console.error('Error executing swap:', error);
      // Check for specific error types
      if (error?.statusCode === 400) {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'Invalid request. Please check your inputs and balance.',
        });
      } else if (error?.statusCode === 401) {
        showTopToast({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Please log in again',
        });
      } else if (error?.statusCode === 404) {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: 'Virtual account not found. Please try again.',
        });
      } else {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'Failed to execute swap. Please try again.',
        });
      }
    },
  });

  const handleSwap = () => {
    if (!receiveAsset || !payAsset || !payAmount || parseFloat(payAmount) <= 0) return;

    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    // Validate amount doesn't exceed available balance
    if (parseFloat(payAsset.availableBalance) < amount) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Insufficient balance',
      });
      return;
    }

    const previewRequest: ISwapQuoteRequest = {
      fromAmount: amount,
      fromCurrency: payAsset.currency,
      fromBlockchain: payAsset.blockchain,
      toCurrency: receiveAsset.currency,
      toBlockchain: receiveAsset.blockchain,
    };

    previewMutation.mutate(previewRequest);
  };

  const handleComplete = () => {
    if (!receiveAsset || !payAsset || !payAmount || !previewData) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please complete all required fields',
      });
      return;
    }

    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    // Validate that we have all required fields
    if (!payAsset.currency || !payAsset.blockchain || !receiveAsset.currency || !receiveAsset.blockchain) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please select both assets and networks',
      });
      return;
    }

    const swapRequest: ISwapCryptoRequest = {
      fromAmount: amount,
      fromCurrency: payAsset.currency,
      fromBlockchain: payAsset.blockchain,
      toCurrency: receiveAsset.currency,
      toBlockchain: receiveAsset.blockchain,
    };

    console.log('Executing swap with request:', swapRequest);
    swapMutation.mutate(swapRequest);
  };

  // Calculate transaction details from preview data
  const transactionData = useMemo(() => {
    if (previewData) {
      return {
        amount: `${previewData.fromAmount} ${previewData.fromCurrency} ~ $${previewData.fromAmountUsd}`,
        payAsset: payAsset?.displayName || payAsset?.name || '',
        payNetwork: previewData.fromBlockchain,
        receiveAsset: receiveAsset?.displayName || receiveAsset?.name || '',
        receiveNetwork: previewData.toBlockchain,
        receiveAmount: `${previewData.toAmount} ${previewData.toCurrency} ~ $${previewData.toAmountUsd}`,
        gasFee: `${previewData.gasFee} ${previewData.fromCurrency} ~ $${previewData.gasFeeUsd}`,
        total: `${previewData.totalAmount} ${previewData.fromCurrency} ~ $${previewData.totalAmountUsd}`,
      };
    }
    return {
      amount: `${payAmount} ${payAsset?.currency || ''} ~ $0`,
      payAsset: payAsset?.displayName || payAsset?.name || '',
      payNetwork: payAsset?.blockchain || '',
      receiveAsset: receiveAsset?.displayName || receiveAsset?.name || '',
      receiveNetwork: receiveAsset?.blockchain || '',
      receiveAmount: `${receiveAmount} ${receiveAsset?.currency || ''} ~ $0`,
      gasFee: '0 ~ $0',
      total: `${payAmount} ${payAsset?.currency || ''} ~ $0`,
    };
  }, [previewData, payAsset, receiveAsset, payAmount, receiveAmount]);

  const transactionRows = useMemo(() => [
    { label: 'Amount', value: transactionData.amount },
    { label: 'Asset (to pay)', value: transactionData.payAsset },
    { label: 'Network (to pay)', value: transactionData.payNetwork },
    { label: 'Asset (to Receive)', value: transactionData.receiveAsset },
    { label: 'Network (to Receive)', value: transactionData.receiveNetwork },
    { label: 'You will receive', value: transactionData.receiveAmount },
    { label: 'Transaction gas fee', value: transactionData.gasFee },
    { label: 'Total', value: transactionData.total },
  ], [transactionData]);

  const payAssetIcon = payAsset ? getAssetIcon(payAsset.symbol, payAsset.currency, payAsset.name) : icons.eth;
  const receiveAssetIcon = receiveAsset ? getAssetIcon(receiveAsset.symbol, receiveAsset.currency, receiveAsset.name) : icons.usdt;

  // Check if proceed button should be enabled
  const isProceedButtonEnabled = useMemo(() => {
    const hasPayAsset = !!payAsset;
    const hasReceiveAsset = !!receiveAsset;
    // Trim and validate payAmount - handle empty strings and whitespace
    const trimmedAmount = payAmount?.trim() || '';
    const parsedAmount = parseFloat(trimmedAmount);
    const hasValidAmount = trimmedAmount !== '' && !isNaN(parsedAmount) && parsedAmount > 0 && isFinite(parsedAmount);
    const isNotLoading = !previewMutation.isPending;
    
    const enabled = hasPayAsset && hasReceiveAsset && hasValidAmount && isNotLoading;
    
    // Debug logging to help identify issues
    console.log('Button enable check:', {
      hasPayAsset,
      hasReceiveAsset,
      payAmount: trimmedAmount,
      parsedAmount,
      hasValidAmount,
      isNotLoading,
      enabled,
      payAssetCurrency: payAsset?.currency,
      receiveAssetCurrency: receiveAsset?.currency,
    });
    
    return enabled;
  }, [payAsset, receiveAsset, payAmount, previewMutation.isPending]);

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
            style={[styles.backIcon, dark ? { tintColor: COLORS.black } : { tintColor: COLORS.black }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
          Swap {payAsset?.name || 'Crypto'}
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
          />
        }
      >
        {swapCurrenciesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Loading currencies...
            </Text>
          </View>
        ) : !swapCurrenciesData?.data?.currencies || swapCurrenciesData.data.currencies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              No currencies available for swapping
            </Text>
            <Text style={[styles.emptySubtext, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              You need to have a balance greater than 0 to swap
            </Text>
          </View>
        ) : (
          <>
            {/* Crypto Limit and Available Balance */}
            <View style={styles.infoSection}>
              <View style={styles.limitSection}>
                <Text style={styles.limitLabel}>Remaining crypto limit for today:</Text>
                <Text style={styles.limitValue}>NGN500,000</Text>
              </View>
              {payAsset && (
                <View style={styles.balanceSection}>
                  <View style={styles.balanceLeft}>
                    <Image
                      source={payAssetIcon}
                      style={styles.balanceIcon}
                      contentFit="contain"
                    />
                    <View>
                      <Text style={[styles.balanceAssetName, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                        {payAsset.displayName || payAsset.name}
                      </Text>
                      <Text style={styles.balanceAssetSymbol}>{payAsset.currency}</Text>
                    </View>
                  </View>
                  <View style={styles.balanceRight}>
                    <Text style={[styles.balanceLabel, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                      Available Balance
                    </Text>
                    <Text style={styles.balanceValue}>
                      {parseFloat(payAsset.availableBalance || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} {payAsset.currency}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* You Pay Section */}
            <View style={[styles.card, { marginBottom: 16 }, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: 'transparent' }]}>
              <Text style={[styles.cardLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                You Pay
              </Text>
              <View style={styles.cardContent}>
                <TouchableOpacity
                  style={[styles.assetSelector, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#EFEFEF' }]}
                  onPress={handlePayAssetPress}
                >
                  {payAsset ? (
                    <>
                      <View style={styles.iconContainer}>
                        <Image
                          source={payAssetIcon}
                          style={styles.selectorIcon}
                          contentFit="contain"
                        />
                        <View style={styles.networkIconOverlay}>
                          <Image
                            source={getAssetIcon(undefined, payAsset.blockchain, payAsset.blockchainName)}
                            style={styles.networkIcon}
                            contentFit="contain"
                          />
                        </View>
                      </View>
                      <View style={styles.selectorInfo}>
                        <Text style={[styles.selectorName, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                          {payAsset.displayName || payAsset.name}
                        </Text>
                        <Text style={[styles.selectorSubtext, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                          {payAsset.blockchainName || payAsset.blockchain}
                        </Text>
                      </View>
                      <Image
                        source={icons.arrowDown}
                        style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                      />
                    </>
                  ) : (
                    <>
                      <Text style={[styles.placeholderText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        Asset & Network
                      </Text>
                      <Image
                        source={icons.arrowDown}
                        style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                      />
                    </>
                  )}
                </TouchableOpacity>
                <View style={styles.amountSection}>
                  <View style={styles.amountTop}>
                    <Text style={[styles.amountLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                      {previewData ? `$${previewData.fromAmountUsd}` : '$0'}
                    </Text>
                    <TouchableOpacity style={styles.refreshButton}>
                      <Image
                        source={images.vector46}
                        style={styles.refreshIcon}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.amountValue, styles.amountInput, dark ? { color: COLORS.black } : { color: COLORS.black }]}
                    value={payAmount}
                    onChangeText={setPayAmount}
                    placeholder="0"
                    placeholderTextColor={dark ? COLORS.greyscale500 : COLORS.greyscale600}
                    keyboardType="decimal-pad"
                    maxLength={20}
                  />
                </View>
              </View>
            </View>

            <View style={styles.swapIconContainer}>
              <TouchableOpacity style={styles.swapIconButton}>
                <Image
                  source={icons.fourthicon}
                  style={styles.swapIcon}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>

            {/* You Receive Section */}
            <View style={[styles.card, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: 'transparent' }]}>
              <Text style={[styles.cardLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                You Receive
              </Text>
              <View style={styles.cardContent}>
                <TouchableOpacity
                  style={[styles.assetSelector, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#EFEFEF' }]}
                  onPress={handleReceiveAssetPress}
                >
                  {receiveAsset ? (
                    <>
                      <View style={styles.iconContainer}>
                        <Image
                          source={receiveAssetIcon}
                          style={styles.selectorIcon}
                          contentFit="contain"
                        />
                        <View style={styles.networkIconOverlay}>
                          <Image
                            source={getAssetIcon(undefined, receiveAsset.blockchain, receiveAsset.blockchainName)}
                            style={styles.networkIcon}
                            contentFit="contain"
                          />
                        </View>
                      </View>
                      <View style={styles.selectorInfo}>
                        <Text style={[styles.selectorName, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                          {receiveAsset.displayName || receiveAsset.name}
                        </Text>
                        <Text style={[styles.selectorSubtext, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                          {receiveAsset.blockchainName || receiveAsset.blockchain}
                        </Text>
                      </View>
                      <Image
                        source={icons.arrowDown}
                        style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                      />
                    </>
                  ) : (
                    <>
                      <Text style={[styles.placeholderText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        Asset & Network
                      </Text>
                      <Image
                        source={icons.arrowDown}
                        style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                      />
                    </>
                  )}
                </TouchableOpacity>
                <View style={styles.amountSection}>
                  <View style={styles.amountTop}>
                    <Text style={[styles.amountLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                      {isGettingQuote ? '...' : previewData ? `$${previewData.toAmountUsd}` : '$0'}
                    </Text>
                    <TouchableOpacity style={styles.refreshButton}>
                      <Image
                        source={images.vector46}
                        style={styles.refreshIcon}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  <Text 
                    style={[styles.amountValue, dark ? { color: COLORS.black } : { color: COLORS.black }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.7}
                  >
                    {isGettingQuote ? '...' : receiveAmount}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Proceed to Swap Button */}
      <TouchableOpacity
        style={[
          styles.proceedButton, 
          !isProceedButtonEnabled && styles.proceedButtonDisabled
        ]}
        onPress={handleSwap}
        disabled={!isProceedButtonEnabled}
      >
        {previewMutation.isPending ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.proceedButtonText}>Proceed to swap</Text>
        )}
      </TouchableOpacity>

      {/* Review Transaction Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setReviewModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <SafeAreaView
              style={[
                styles.modalContainer,
                dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
              ]}
              edges={['top', 'bottom']}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandleContainer}>
                <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
              </View>

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalHeaderTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  REVIEW TRANSACTION
                </Text>
              </View>

              {/* Transaction Details - Scrollable */}
              <ScrollView 
                style={styles.detailsScrollView}
                contentContainerStyle={styles.detailsContainer}
                showsVerticalScrollIndicator={false}
              >
                {transactionRows.map((row, index) => (
                  <View key={index}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        {row.label}
                      </Text>
                      <Text style={[styles.detailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        {row.value}
                      </Text>
                    </View>
                    {index < transactionRows.length - 1 && (
                      <View
                        style={[
                          styles.detailSeparator,
                          dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' },
                        ]}
                      />
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Complete Button - Fixed at bottom */}
              <View style={[
                styles.buttonContainer,
                dark ? { borderTopColor: COLORS.greyScale800 } : { borderTopColor: '#E5E5E5' }
              ]}>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleComplete}
                  disabled={swapMutation.isPending}
                >
                  {swapMutation.isPending ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.completeButtonText}>Complete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Receive Asset Selection Modal */}
      <Modal
        visible={receiveAssetModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReceiveAssetModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setReceiveAssetModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <SafeAreaView
              style={[
                styles.receiveAssetModalContainer,
                dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
              ]}
              edges={[]}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandleContainer}>
                <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
              </View>

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalHeaderTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  SELECT ASSET TO RECEIVE
                </Text>
                <TouchableOpacity onPress={() => setReceiveAssetModalVisible(false)}>
                  <Image
                    source={icons.arrowBack}
                    style={[styles.closeIcon, dark ? { tintColor: COLORS.white } : { tintColor: COLORS.black }]}
                  />
                </TouchableOpacity>
              </View>

              {/* Assets List */}
              {buyCurrenciesLoading ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={[styles.modalLoadingText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                    Loading assets...
                  </Text>
                </View>
              ) : !buyCurrenciesData?.data?.currencies || buyCurrenciesData.data.currencies.length === 0 ? (
                <View style={styles.modalEmptyContainer}>
                  <Text style={[styles.modalEmptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                    No assets available
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={buyCurrenciesData.data.currencies}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const assetIcon = getAssetIcon(item.symbol, item.currency, item.name);
                    const isSelected = receiveAsset?.id === item.id;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.receiveAssetItem,
                          dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' },
                          isSelected && { backgroundColor: dark ? COLORS.primary + '20' : COLORS.primary + '10' },
                        ]}
                        onPress={() => handleSelectReceiveAsset(item)}
                      >
                        <View style={styles.receiveAssetLeft}>
                          <View style={styles.iconContainer}>
                            <Image
                              source={assetIcon}
                              style={styles.receiveAssetIcon}
                              contentFit="contain"
                            />
                            <View style={styles.networkIconOverlay}>
                              <Image
                                source={getAssetIcon(undefined, item.blockchain, item.blockchainName)}
                                style={styles.networkIcon}
                                contentFit="contain"
                              />
                            </View>
                          </View>
                          <View style={styles.receiveAssetInfo}>
                            <Text style={[styles.receiveAssetName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                              {item.displayName || item.name}
                            </Text>
                            <Text style={[styles.receiveAssetSubtext, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                              {item.blockchainName || item.blockchain}
                            </Text>
                          </View>
                        </View>
                        {isSelected && (
                          <Image
                            source={icons.tickMarked}
                            style={styles.selectedIcon}
                            contentFit="contain"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={styles.receiveAssetListContent}
                />
              )}
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Swap;

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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    marginRight: 40,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    minHeight: 300,
  },
  loadingText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    minHeight: 300,
  },
  emptyText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  limitSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  limitLabel: {
    fontSize: isTablet ? 14 : 12,
    color: COLORS.greyscale600,
  },
  limitValue: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    color: COLORS.black,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  balanceAssetName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  balanceAssetSymbol: {
    fontSize: isTablet ? 14 : 12,
    color: COLORS.greyscale600,
  },
  balanceRight: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: isTablet ? 14 : 12,
    color: COLORS.greyscale600,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2D9EC',
    zIndex: 1,
  },
  cardLabel: {
    fontSize: isTablet ? 14 : 12,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 147,
    backgroundColor: 'transparent',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    minHeight: 44,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 8,
  },
  selectorIcon: {
    width: 32,
    height: 32,
  },
  networkIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  networkIcon: {
    width: 12,
    height: 12,
  },
  selectorInfo: {
    flex: 1,
  },
  selectorName: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectorSubtext: {
    fontSize: isTablet ? 12 : 10,
  },
  placeholderText: {
    fontSize: isTablet ? 14 : 12,
    flex: 1,
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
  amountSection: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 0, // Allows flex items to shrink below their content size
  },
  amountTop: {
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  amountLabel: {
    fontSize: isTablet ? 12 : 10,
  },
  refreshButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    width: 10,
    height: 10,
  },
  amountValue: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 1,
    maxWidth: '100%',
  },
  amountInput: {
    width: '100%',
    textAlign: 'right',
  },
  swapIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -25,
    zIndex: 10,
  },
  swapIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  swapIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  proceedButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 0,
    maxHeight: '85%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalHeaderTitle: {
    fontSize: isTablet ? 16 : 13,
    fontWeight: '400',
    color: '#8A8A8A',
    textTransform: 'uppercase',
  },
  detailsScrollView: {
    flex: 1,
  },
  detailsContainer: {
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  detailLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
  },
  detailValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
  detailSeparator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  buttonContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 17,
    fontWeight: '700',
  },
  receiveAssetModalContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  receiveAssetListContent: {
    paddingBottom: 20,
  },
  receiveAssetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  receiveAssetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  receiveAssetIcon: {
    width: 40,
    height: 40,
  },
  receiveAssetInfo: {
    marginLeft: 12,
    flex: 1,
  },
  receiveAssetName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  receiveAssetSubtext: {
    fontSize: isTablet ? 12 : 10,
  },
  selectedIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.primary,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  modalLoadingText: {
    fontSize: isTablet ? 14 : 12,
    marginTop: 16,
  },
  modalEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  modalEmptyText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
});
