import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getSellQuote, getSellPreview, ISellQuoteRequest, ISellPreviewRequest } from '@/utils/queries/accountQueries';
import { sellCrypto, ISellCryptoRequest } from '@/utils/mutations/authMutations';
import { showTopToast } from '@/utils/helpers';
import { getImageUrl } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const SellCrypto = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    assetName?: string;
    assetId?: string;
    selectedNetwork?: string;
    selectedCurrency?: string;
    currencySymbol?: string;
    availableBalance?: string;
  }>();

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(params.selectedNetwork || null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(params.selectedCurrency || null);
  const [quantity, setQuantity] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountLocal, setAmountLocal] = useState('');
  const [quoteData, setQuoteData] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [isGettingPreview, setIsGettingPreview] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  
  const assetName = params.assetName || 'USDT';
  const assetId = params.assetId || '1';
  const currencySymbol = params.currencySymbol || '';
  const availableBalance = parseFloat(params.availableBalance || '0');

  // Auto-fill currency and network from params
  useEffect(() => {
    if (params.selectedNetwork) {
      setSelectedNetwork(params.selectedNetwork);
    }
    if (params.selectedCurrency) {
      setSelectedCurrency(params.selectedCurrency);
    }
  }, [params.selectedNetwork, params.selectedCurrency]);

  // Get quote when quantity changes (for real-time calculation)
  const getQuote = useCallback(async (qty: string) => {
    if (!qty || parseFloat(qty) <= 0 || !selectedCurrency || !selectedNetwork) {
      setQuoteData(null);
      setAmountUSD('');
      setAmountLocal('');
      return;
    }

    const qtyNum = parseFloat(qty);
    
    // Validate quantity doesn't exceed available balance
    if (availableBalance > 0 && qtyNum > availableBalance) {
      setQuoteData(null);
      setAmountUSD('');
      setAmountLocal('');
      return;
    }

    setIsGettingQuote(true);
    try {
      const quoteRequest: ISellQuoteRequest = {
        amount: qtyNum,
        currency: selectedCurrency,
        blockchain: selectedNetwork,
      };
      const response = await getSellQuote(token, quoteRequest);
      if (response?.data) {
        setQuoteData(response.data);
        setAmountUSD(response.data.amountUsd);
        setAmountLocal(parseFloat(response.data.amountNgn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    } catch (error: any) {
      console.error('Error getting quote:', error);
      setQuoteData(null);
      setAmountUSD('');
      setAmountLocal('');
      
      // Handle specific error cases
      const errorMessage = error?.message || '';
      if (errorMessage.toLowerCase().includes('rate') || errorMessage.toLowerCase().includes('no rate')) {
        // Don't show toast for rate errors as they might be temporary
        console.log('Rate not available for sell transaction');
      } else {
        // Only show toast for unexpected errors
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: errorMessage || 'Failed to calculate quote. Please try again.',
        });
      }
    } finally {
      setIsGettingQuote(false);
    }
  }, [selectedCurrency, selectedNetwork, token, availableBalance]);

  // Debounce quote call
  useEffect(() => {
    const timer = setTimeout(() => {
      if (quantity) {
        getQuote(quantity);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [quantity, getQuote]);

  // Get preview when user clicks proceed (for summary modal)
  const getPreview = useCallback(async () => {
    if (!quantity || parseFloat(quantity) <= 0 || !selectedCurrency || !selectedNetwork) {
      showTopToast({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid quantity',
      });
      return;
    }

    setIsGettingPreview(true);
    setInsufficientBalance(false); // Reset insufficient balance state
    
    try {
      const previewRequest: ISellPreviewRequest = {
        amount: parseFloat(quantity),
        currency: selectedCurrency,
        blockchain: selectedNetwork,
      };
      const response = await getSellPreview(token, previewRequest);
      if (response?.data) {
        setPreviewData(response.data);
        
        // Check if user has sufficient balance
        if (!response.data.hasSufficientBalance || !response.data.canProceed) {
          setInsufficientBalance(true);
          setIsGettingPreview(false);
          return;
        }
        
        // Show summary modal if preview is successful
        setShowSummaryModal(true);
      }
    } catch (error: any) {
      console.error('Error getting preview:', error);
      const errorMessage = error?.message || '';
      if (errorMessage.toLowerCase().includes('insufficient')) {
        setInsufficientBalance(true);
      } else if (errorMessage.toLowerCase().includes('rate') || errorMessage.toLowerCase().includes('no rate')) {
        showTopToast({
          type: 'error',
          text1: 'Rate Not Available',
          text2: 'Sell rate is not configured at this time. Please contact support or try again later.',
        });
      } else if (error?.statusCode === 400) {
        showTopToast({
          type: 'error',
          text1: 'Validation Error',
          text2: errorMessage || 'Invalid transaction parameters. Please check your inputs.',
        });
      } else {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: errorMessage || 'Failed to get preview. Please try again.',
        });
      }
    } finally {
      setIsGettingPreview(false);
    }
  }, [quantity, selectedCurrency, selectedNetwork, token]);

  // Map asset name to icon
  const getAssetIcon = (name: string, symbol?: string) => {
    if (symbol && symbol.startsWith('http')) {
      return { uri: symbol };
    } else if (symbol) {
      return { uri: getImageUrl(symbol) };
    }
    const nameLower = name.toLowerCase();
    if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return icons.btc;
    if (nameLower.includes('ethereum') || nameLower.includes('eth')) return icons.eth;
    if (nameLower.includes('tether') || nameLower.includes('usdt')) return icons.usdt;
    if (nameLower.includes('solana') || nameLower.includes('sol')) return icons.solana;
    if (nameLower.includes('bnb')) return icons.bnb;
    if (nameLower.includes('shiba')) return icons.shibaInu;
    if (nameLower.includes('doge')) return icons.dogeCoin;
    if (nameLower.includes('usdc')) return icons.dollarCoin || icons.usdt;
    if (nameLower.includes('ton')) return icons.tonCoin;
    if (nameLower.includes('tron')) return icons.tron;
    return icons.usdt;
  };

  const assetIcon = getAssetIcon(assetName, currencySymbol);

  // Sell mutation
  const { mutate: executeSell, isPending: isSelling } = useMutation({
    mutationFn: (data: ISellCryptoRequest) => sellCrypto(token, data),
    onSuccess: (response) => {
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Cryptocurrency sold successfully',
      });
      // Invalidate wallet and assets queries to refresh balance
      router.back();
    },
    onError: (error: any) => {
      console.error('Sell error:', error);
      if (error?.message?.toLowerCase().includes('insufficient') || error?.statusCode === 400) {
        setInsufficientBalance(true);
      } else {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'Failed to sell cryptocurrency',
        });
      }
    },
  });

  const handleProceed = () => {
    if (!selectedNetwork || !selectedCurrency || !quantity || parseFloat(quantity) <= 0) {
      showTopToast({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid quantity',
      });
      return;
    }

    // Validate quantity is a valid number
    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showTopToast({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid quantity',
      });
      return;
    }

    // Validate quantity doesn't exceed available balance
    if (availableBalance > 0 && qtyNum > availableBalance) {
      showTopToast({
        type: 'error',
        text1: 'Insufficient Balance',
        text2: `You can only sell up to ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${selectedCurrency}`,
      });
      return;
    }

    // Get preview to show summary modal with balance validation
    // Preview will handle rate errors and show appropriate messages
    getPreview();
  };

  const handleComplete = () => {
    if (!selectedNetwork || !selectedCurrency || !quantity || !previewData) {
      return;
    }

    const sellRequest: ISellCryptoRequest = {
      amount: parseFloat(quantity),
      currency: selectedCurrency,
      blockchain: selectedNetwork,
    };

    setShowSummaryModal(false);
    executeSell(sellRequest);
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
          {assetName}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Asset Icon */}
        <View style={styles.assetIconContainer}>
          <Image
            source={assetIcon}
            style={styles.assetIcon}
            contentFit="contain"
          />
        </View>

        {/* Select Currency */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <Text style={[styles.label, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Currency
          </Text>
          <View style={[styles.selector, { opacity: 0.7 }]}>
            <Text style={styles.selectorValue}>
              {selectedCurrency || 'Not selected'}
            </Text>
          </View>
        </View>

        {/* Select Network */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <Text style={[styles.label, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Network
          </Text>
          <View style={[styles.selector, { opacity: 0.7 }]}>
            <Text style={styles.selectorValue}>
              {selectedNetwork || 'Not selected'}
            </Text>
          </View>
        </View>

        {/* Available Balance */}
        {availableBalance > 0 && (
          <View style={[styles.inputSection, { marginBottom: 12 }]}>
            <View style={[styles.balanceContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' }]}>
              <Text style={[styles.balanceLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Available Balance
              </Text>
              <Text style={[styles.balanceValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                {availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} {selectedCurrency}
              </Text>
            </View>
          </View>
        )}

        {/* Quantity */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <Input
            label="Quantity"
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
            id="quantity"
            variant="signin"
            placeholder=""
          />
          {isGettingQuote && (
            <View style={styles.previewLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={[styles.previewLoadingText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Calculating quote...
              </Text>
            </View>
          )}
          {quantity && parseFloat(quantity) > availableBalance && availableBalance > 0 && (
            <Text style={[styles.errorText, { color: '#FF0000', marginTop: 4, fontSize: 12 }]}>
              Quantity exceeds available balance
            </Text>
          )}
        </View>

        {/* Enter amount in USD */}
        <View style={[styles.inputSection, { marginBottom: 0 }]}>
          <Input
            label="Enter amount in USD"
            keyboardType="decimal-pad"
            value={amountUSD}
            onChangeText={() => {}} // Read-only, calculated from preview
            id="amountUSD"
            variant="signin"
            placeholder="Enter amount in USD"
            isEditable={false}
          />
        </View>

        {/* Amount in local currency */}
        <View style={[styles.inputSection, { marginBottom: 0 }]}>
          <Input
            label="Amount in NGN"
            keyboardType="decimal-pad"
            value={amountLocal}
            onChangeText={() => {}} // Read-only, calculated from preview
            id="amountLocal"
            variant="signin"
            placeholder="Amount in NGN"
            isEditable={false}
          />
        </View>

        {/* View Rate Bar */}
        {quoteData && (
          <View style={[styles.rateBar, dark ? { backgroundColor: '#FFF9E6' } : { backgroundColor: 'transparent' }]}>
            <Text style={styles.rateLabel}>View rate</Text>
            <View style={styles.rateValueContainer}>
              <Text style={styles.rateValue}>
                $1 = NGN {parseFloat(quoteData.rateUsdToNgn || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, (!selectedNetwork || !selectedCurrency || !quantity || parseFloat(quantity) <= 0 || isSelling || isGettingPreview) && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!selectedNetwork || !selectedCurrency || !quantity || parseFloat(quantity) <= 0 || isSelling || isGettingPreview}
      >
        {isSelling || isGettingPreview ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.proceedButtonText}>Proceed</Text>
        )}
      </TouchableOpacity>

      {/* Summary Modal */}
      <Modal
        visible={showSummaryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSummaryModal(false)}
      >
        <Pressable 
          style={styles.summaryModalOverlay} 
          onPress={() => setShowSummaryModal(false)}
        >
          <Pressable 
            style={styles.summaryModalContent} 
            onPress={(e) => e.stopPropagation()}
          >
            <SafeAreaView
              style={[
                styles.summaryContainer,
                dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
              ]}
              edges={['top']}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandleContainer}>
                <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
              </View>

              {/* Header */}
              <View style={styles.summaryHeader}>
                <Text style={[styles.summaryHeaderTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Summary
                </Text>
              </View>

              {/* Summary Details */}
              {previewData && (
                <>
                  <View style={styles.summaryDetailsContainer}>
                    <View style={styles.summaryDetailRow}>
                      <Text style={[styles.summaryDetailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        Amount
                      </Text>
                      <Text style={[styles.summaryDetailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        {quantity} {selectedCurrency} ~ ${parseFloat(previewData.amountUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={[styles.summarySeparator, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
                    
                    <View style={styles.summaryDetailRow}>
                      <Text style={[styles.summaryDetailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        Token
                      </Text>
                      <Text style={[styles.summaryDetailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        {selectedCurrency}
                      </Text>
                    </View>
                    <View style={[styles.summarySeparator, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
                    
                    <View style={styles.summaryDetailRow}>
                      <Text style={[styles.summaryDetailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        Network
                      </Text>
                      <Text style={[styles.summaryDetailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        {selectedNetwork}
                      </Text>
                    </View>
                    <View style={[styles.summarySeparator, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
                    
                    <View style={styles.summaryDetailRow}>
                      <Text style={[styles.summaryDetailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        Transaction gas fee
                      </Text>
                      <Text style={[styles.summaryDetailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        0 {selectedCurrency} ~ $0
                      </Text>
                    </View>
                    <View style={[styles.summarySeparator, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
                    
                    <View style={styles.summaryDetailRow}>
                      <Text style={[styles.summaryDetailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        Total
                      </Text>
                      <Text style={[styles.summaryDetailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        {quantity} {selectedCurrency} ~ ${parseFloat(previewData.amountUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>

                  {/* Total Amount to Receive */}
                  <View style={[styles.summaryTotalContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.summaryTotalLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                      Total Amount to Receive
                    </Text>
                    <Text style={[styles.summaryTotalValue, { color: COLORS.primary }]}>
                      N{parseFloat(previewData.amountNgn || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>

                  {/* Complete Button */}
                  <TouchableOpacity 
                    style={[styles.completeButton, isSelling && styles.completeButtonDisabled]} 
                    onPress={handleComplete}
                    disabled={isSelling}
                  >
                    {isSelling ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.completeButtonText}>Complete</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Insufficient Balance Modal */}
      <Modal
        visible={insufficientBalance}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInsufficientBalance(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white }]}>
            <Text style={[styles.modalTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Insufficient Balance
            </Text>
            <Text style={[styles.modalMessage, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              You don't have sufficient {selectedCurrency} balance to complete this sale. Your current balance is {previewData?.cryptoBalanceBefore || '0'} {selectedCurrency}.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setInsufficientBalance(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SellCrypto;

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
    alignItems: 'center',
  },
  assetIconContainer: {
    width: '100%',
    height: 195,
    marginBottom: 24,
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 35,
    alignItems: 'center',
  },
  assetIcon: {
    width: 120,
    height: 120,
  },
  inputSection: {
    width: '100%',
    // marginBottom: 20,
  },
  label: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    marginBottom: 8,
    paddingLeft: 4,
  },
  selector: {
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
  quantityContainer: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1e1e1e',
  },
  rateBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFA500',
    paddingVertical: 8,
    marginTop: 8,
  },
  rateLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    color: '#FFA500',
  },
  rateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateValue: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    color: '#FFA500',
  },
  rateArrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#1e1e1e',
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
  previewLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  previewLoadingText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '400',
  },
  summaryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  summaryModalContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  summaryContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
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
  summaryHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryHeaderTitle: {
    fontSize: isTablet ? 18 : 13,
    fontWeight: '700',
  },
  summaryDetailsContainer: {
    marginBottom: 24,
  },
  summaryDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryDetailLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
  },
  summaryDetailValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
  summarySeparator: {
    height: 1,
  },
  summaryTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 10,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: '#D4D4D4',
  },
  summaryTotalLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
  },
  summaryTotalValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
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
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
  balanceContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
  },
  balanceLabel: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '400',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
  errorText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '400',
  },
});

