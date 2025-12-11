import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
  Pressable,
  PanResponder,
  Animated,
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
import { getBuyQuote, IBuyQuoteRequest } from '@/utils/queries/accountQueries';
import { buyCrypto, IBuyCryptoRequest } from '@/utils/mutations/authMutations';
import { getWalletOverview } from '@/utils/queries/accountQueries';
import { showTopToast } from '@/utils/helpers';
import { getImageUrl } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BuyCrypto = () => {
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
  }>();

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(params.selectedNetwork || null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(params.selectedCurrency || null);
  const [quantity, setQuantity] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountLocal, setAmountLocal] = useState('');
  const [quoteData, setQuoteData] = useState<any>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  const assetName = params.assetName || 'USDT';
  const assetId = params.assetId || '1';
  const currencySymbol = params.currencySymbol || '';

  // Drag animation for summary modal
  const dragY = useRef(new Animated.Value(0)).current;
  const modalHeight = useRef(0);

  // Fetch wallet balance
  const { data: walletData } = useQuery({
    queryKey: ['walletOverview'],
    queryFn: () => getWalletOverview(token),
    enabled: !!token,
  });

  const totalBalance = walletData?.data?.totalBalance || 0;
  const currency = walletData?.data?.currency || 'NGN';

  // Auto-fill currency and network from params
  useEffect(() => {
    if (params.selectedNetwork) {
      setSelectedNetwork(params.selectedNetwork);
    }
    if (params.selectedCurrency) {
      setSelectedCurrency(params.selectedCurrency);
    }
  }, [params.selectedNetwork, params.selectedCurrency]);

  // Reset drag animation when modal opens/closes
  useEffect(() => {
    if (showSummaryModal) {
      dragY.setValue(0);
    }
  }, [showSummaryModal]);

  // Get quote when quantity changes
  const getQuote = useCallback(async (qty: string) => {
    if (!qty || parseFloat(qty) <= 0 || !selectedCurrency || !selectedNetwork) {
      setQuoteData(null);
      setAmountUSD('');
      setAmountLocal('');
      return;
    }

    setIsGettingQuote(true);
    try {
      const quoteRequest: IBuyQuoteRequest = {
        amount: parseFloat(qty),
        currency: selectedCurrency,
        blockchain: selectedNetwork,
      };
      const response = await getBuyQuote(token, quoteRequest);
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
    } finally {
      setIsGettingQuote(false);
    }
  }, [selectedCurrency, selectedNetwork, token]);

  // Debounce quote call
  useEffect(() => {
    const timer = setTimeout(() => {
      if (quantity) {
        getQuote(quantity);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [quantity, getQuote]);

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

  // Buy mutation
  const { mutate: executeBuy, isPending: isBuying } = useMutation({
    mutationFn: (data: IBuyCryptoRequest) => buyCrypto(token, data),
    onSuccess: (response) => {
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Cryptocurrency purchased successfully',
      });
      // Navigate to transactions tab
      router.replace('/(tabs)/transactions' as any);
    },
    onError: (error: any) => {
      console.error('Buy error:', error);
      if (error?.message?.toLowerCase().includes('insufficient') || error?.statusCode === 400) {
        setInsufficientBalance(true);
      } else {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'Failed to purchase cryptocurrency',
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

    if (!quoteData || !amountLocal) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please wait for quote calculation',
      });
      return;
    }

    // Check balance
    const requiredAmount = parseFloat(amountLocal.replace(/,/g, ''));
    if (totalBalance < requiredAmount) {
      setInsufficientBalance(true);
      return;
    }

    // Show summary modal instead of directly buying
    setShowSummaryModal(true);
  };

  const handleComplete = () => {
    if (!selectedNetwork || !selectedCurrency || !quantity || !quoteData) {
      return;
    }

    const buyRequest: IBuyCryptoRequest = {
      amount: parseFloat(quantity),
      currency: selectedCurrency,
      blockchain: selectedNetwork,
    };

    setShowSummaryModal(false);
    executeBuy(buyRequest);
  };

  // Pan responder for drag to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        dragY.setOffset((dragY as any)._value);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        dragY.flattenOffset();
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Close modal if dragged down significantly
          Animated.timing(dragY, {
            toValue: modalHeight.current,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setShowSummaryModal(false);
            dragY.setValue(0);
          });
        } else {
          // Snap back to original position
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
            <View style={styles.quoteLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={[styles.quoteLoadingText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Calculating quote...
              </Text>
            </View>
          )}
        </View>

        {/* Enter amount in USD */}
        <View style={[styles.inputSection, { marginBottom: 0 }]}>
          <Input
            label="Enter amount in USD"
            keyboardType="decimal-pad"
            value={amountUSD}
            onChangeText={() => {}} // Read-only, calculated from quote
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
            onChangeText={() => {}} // Read-only, calculated from quote
            id="amountLocal"
            variant="signin"
            placeholder="Amount in NGN"
            isEditable={false}
          />
        </View>

        {/* Payment Method - Fiat Wallet */}
        <View style={styles.inputSection }>
          <Text style={[styles.label, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Payment Method
          </Text>
          <View style={[styles.selector, { opacity: 0.7 }]}>
            <Text style={styles.selectorValue}>
              Fiat Wallet ({currency} {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </Text>
          </View>
        </View>

        {/* View Rate Bar */}
        {quoteData && (
          <View style={[styles.rateBar, dark ? { backgroundColor: '#FFF9E6' } : { backgroundColor: 'transparent' }]}>
            <Text style={styles.rateLabel}>View rate</Text>
            <View style={styles.rateValueContainer}>
              <Text style={styles.rateValue}>
                $1 = NGN {parseFloat(quoteData.rateNgnToUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, (!selectedNetwork || !selectedCurrency || !quantity || !quoteData || isBuying) && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!selectedNetwork || !selectedCurrency || !quantity || !quoteData || isBuying}
      >
        {isBuying ? (
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
          <Animated.View
            style={[
              styles.summaryModalContent,
              {
                transform: [{ translateY: dragY }],
              },
            ]}
            onLayout={(event) => {
              modalHeight.current = event.nativeEvent.layout.height;
            }}
            {...panResponder.panHandlers}
          >
            <Pressable 
              onPress={(e) => e.stopPropagation()}
            >
              <SafeAreaView
                style={[
                  styles.summaryContainer,
                  dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
                ]}
                edges={['top', 'bottom']}
              >
                {/* Drag Handle */}
                <View style={styles.dragHandleContainer}>
                  <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
                </View>

              {/* Header */}
              <View style={styles.summaryHeader}>
                <View style={styles.summaryHeaderContent}>
                  <Text style={[styles.summaryHeaderTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                    Summary
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowSummaryModal(false)}
                    style={[
                      styles.summaryCloseButton,
                      dark ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                    ]}
                  >
                    <Text style={[
                      styles.summaryCloseIconText,
                      { color: dark ? COLORS.white : COLORS.black }
                    ]}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Summary Details */}
              {quoteData && (
                <>
                  <View style={styles.summaryDetailsContainer}>
                    <View style={styles.summaryDetailRow}>
                      <Text style={[styles.summaryDetailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        Amount
                      </Text>
                      <Text style={[styles.summaryDetailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        {quantity} {selectedCurrency} ~ ${parseFloat(quoteData.amountUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        {quantity} {selectedCurrency} ~ ${parseFloat(quoteData.amountUsd || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>

                  {/* Total Amount to Pay */}
                  <View style={[styles.summaryTotalContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.summaryTotalLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                      Total Amount to Pay
                    </Text>
                    <Text style={[styles.summaryTotalValue, { color: COLORS.primary }]}>
                      N{amountLocal || '0.00'}
                    </Text>
                  </View>

                  {/* Complete Button */}
                  <TouchableOpacity 
                    style={[styles.completeButton, isBuying && styles.completeButtonDisabled]} 
                    onPress={handleComplete}
                    disabled={isBuying}
                  >
                    {isBuying ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.completeButtonText}>Complete</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
              </SafeAreaView>
            </Pressable>
          </Animated.View>
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
              Your current balance is {currency} {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, but you need {currency} {amountLocal || '0.00'} to complete this purchase.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButtonSecondary, dark ? { borderColor: COLORS.greyScale800 } : { borderColor: '#E5E5E5' }]}
                onPress={() => setInsufficientBalance(false)}
              >
                <Text style={[styles.modalButtonSecondaryText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setInsufficientBalance(false);
                  navigate('fundwalletmodal' as any);
                }}
              >
                <Text style={styles.modalButtonText}>Topup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BuyCrypto;

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
    borderRadius:35,
    alignItems: 'center',
  },
  assetIcon: {
    width: 120,
    height: 120,
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
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
    // backgroundColor: '#FFF9E6',
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
  quoteLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  quoteLoadingText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '400',
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
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
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
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonSecondaryText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
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
    paddingBottom: 0,
    maxHeight: '100%',
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
  },
  summaryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryHeaderTitle: {
    fontSize: isTablet ? 18 : 13,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  summaryCloseButton: {
    marginLeft: 'auto',
    borderRadius: 20,
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  summaryCloseIconText: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '300',
    lineHeight: isTablet ? 40 : 36,
    textAlign: 'center',
    includeFontPadding: false,
    height: isTablet ? 40 : 36,
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
});

