import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter } from 'expo-router';
import Input from '@/components/CustomInput';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { initiateDeposit, getDepositStatus, IInitiateDepositRequest } from '@/utils/mutations/authMutations';
import { useAuth } from '@/contexts/authContext';
import { showTopToast } from '@/utils/helpers';
import { ApiError } from '@/utils/customApiCalls';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const FundWalletModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [topupAmount, setTopupAmount] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(true);
  const [virtualAccount, setVirtualAccount] = useState<{
    accountType: number;
    bankName: string;
    accountName: string;
    accountNumber: string;
  } | null>(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initiate deposit mutation
  const { mutate: handleInitiateDeposit, isPending: isInitiating } = useMutation({
    mutationFn: (data: IInitiateDepositRequest) => initiateDeposit(data, token),
    onSuccess: async (response) => {
      if (response?.data) {
        // Clear any previous errors
        setAmountError(null);
        
        setTransactionId(response.data.transactionId);
        
        // Store virtual account details if available
        if (response.data.virtualAccount) {
          setVirtualAccount(response.data.virtualAccount);
          setShowAccountDetails(true);
        }
        
        // Store checkout URL if available
        if (response.data.checkoutUrl) {
          setCheckoutUrl(response.data.checkoutUrl);
        }
        
        // Start polling for deposit status
        setIsPolling(true);
        startPollingDepositStatus(response.data.transactionId);
      }
    },
    onError: (error: ApiError) => {
      const errorMessage = error.message || 'Failed to initiate deposit';
      setAmountError(errorMessage);
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    },
  });

  // Poll deposit status
  const startPollingDepositStatus = (txId: string) => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await getDepositStatus(txId, token);
        if (statusResponse?.data) {
          const status = statusResponse.data.status?.toLowerCase();
          
          if (status === 'completed' || status === 'successful') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setIsPolling(false);
            showTopToast({
              type: 'success',
              text1: 'Success',
              text2: 'Deposit completed successfully',
            });
            // Invalidate wallet queries to refresh balance
            queryClient.invalidateQueries({ queryKey: ['walletOverview'] });
            setTimeout(() => {
              router.back();
            }, 2000);
          } else if (status === 'failed' || status === 'cancelled') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setIsPolling(false);
            showTopToast({
              type: 'error',
              text1: 'Deposit Failed',
              text2: 'Your deposit was not completed',
            });
          }
          // Continue polling if status is 'pending' or 'processing'
        }
      } catch (error) {
        console.error('Error checking deposit status:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setIsPolling(false);
    }, 300000);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleProceed = () => {
    // Clear previous errors
    setAmountError(null);

    if (!topupAmount || topupAmount.trim() === '') {
      const errorMsg = 'Please enter an amount';
      setAmountError(errorMsg);
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
      });
      return;
    }

    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount <= 0) {
      const errorMsg = 'Please enter a valid amount';
      setAmountError(errorMsg);
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
      });
      return;
    }

    // Check minimum amount (100 NGN)
    const MINIMUM_AMOUNT = 100;
    if (amount < MINIMUM_AMOUNT) {
      const errorMsg = `Minimum amount is ${MINIMUM_AMOUNT.toFixed(2)} NGN`;
      setAmountError(errorMsg);
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
      });
      return;
    }

    // Initiate PalmPay deposit
    handleInitiateDeposit({
      amount: amount,
      currency: 'NGN',
    });
  };

  const handleAmountChange = (text: string) => {
    setTopupAmount(text);
    // Clear error when user starts typing
    if (amountError) {
      setAmountError(null);
    }
  };

  const handleCopyAccountNumber = async () => {
    if (virtualAccount?.accountNumber) {
      await Clipboard.setStringAsync(virtualAccount.accountNumber);
      showTopToast({
        type: 'success',
        text1: 'Copied',
        text2: 'Account number copied to clipboard',
      });
    }
  };

  const handleCopyAccountName = async () => {
    if (virtualAccount?.accountName) {
      await Clipboard.setStringAsync(virtualAccount.accountName);
      showTopToast({
        type: 'success',
        text1: 'Copied',
        text2: 'Account name copied to clipboard',
      });
    }
  };


  const handleCloseWebView = () => {
    setShowWebView(false);
    setCheckoutUrl(null);
    // Stop polling if webview is closed
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
    // Show payment modal again with account details
    if (transactionId && virtualAccount) {
      setShowPaymentModal(true);
      setShowAccountDetails(true);
    } else {
      router.back();
    }
  };

  const handleClosePaymentModal = () => {
    // Reset all state
    setShowPaymentModal(false);
    setShowAccountDetails(false);
    setVirtualAccount(null);
    setTopupAmount('');
    setTransactionId(null);
    setCheckoutUrl(null);
    // Stop polling if active
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
    router.back();
  };

  return (
    <>
      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClosePaymentModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClosePaymentModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <SafeAreaView
              style={[
                styles.container,
                dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
              ]}
              edges={['top', 'bottom']}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandleContainer}>
                <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={[styles.headerTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                    PAYMENT METHOD
                  </Text>
                  <TouchableOpacity
                    onPress={handleClosePaymentModal}
                    style={[
                      styles.closeButton,
                      dark ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
                    ]}
                  >
                    <Text style={[
                      styles.closeIconText,
                      { color: dark ? COLORS.white : COLORS.black }
                    ]}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Scrollable Content */}
              <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
              >
                {!showAccountDetails ? (
                  <>
                    {/* Top-up Amount Input */}
                    <View style={styles.inputSection}>
                      <Input
                        label="Enter Amount"
                        keyboardType="decimal-pad"
                        value={topupAmount}
                        onChangeText={handleAmountChange}
                        id="topupAmount"
                        variant="signin"
                        placeholder=""
                        errorText={amountError || undefined}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    {/* Virtual Account Details Section */}
                    <View style={styles.accountDetailsSection}>
                      <Text style={[styles.sectionTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        Transfer to this account
                      </Text>
                      <Text style={[styles.sectionSubtitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                        Transfer the exact amount from your bank to the account below
                      </Text>

                      {/* Account Details Card */}
                      <View style={[styles.accountCard, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' }]}>
                        {/* Bank Name */}
                        <View style={styles.accountDetailRow}>
                          <Text style={[styles.accountDetailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                            Bank Name
                          </Text>
                          <Text style={[styles.accountDetailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                            {virtualAccount?.bankName || 'N/A'}
                          </Text>
                        </View>

                        {/* Account Name */}
                        <View style={styles.accountDetailRow}>
                          <Text style={[styles.accountDetailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                            Account Name
                          </Text>
                          <View style={styles.accountDetailValueContainer}>
                            <Text style={[styles.accountDetailValue, dark ? { color: COLORS.white } : { color: COLORS.black }, { flex: 1 }]}>
                              {virtualAccount?.accountName || 'N/A'}
                            </Text>
                            <TouchableOpacity onPress={handleCopyAccountName} style={styles.copyButton}>
                              <Image source={icons.copy} style={styles.copyIcon} contentFit="contain" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Account Number */}
                        <View style={styles.accountDetailRow}>
                          <Text style={[styles.accountDetailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                            Account Number
                          </Text>
                          <View style={styles.accountDetailValueContainer}>
                            <Text style={[styles.accountDetailValue, dark ? { color: COLORS.white } : { color: COLORS.black }, styles.accountNumberText, { flex: 1 }]}>
                              {virtualAccount?.accountNumber || 'N/A'}
                            </Text>
                            <TouchableOpacity onPress={handleCopyAccountNumber} style={styles.copyButton}>
                              <Image source={icons.copy} style={styles.copyIcon} contentFit="contain" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Amount to Transfer */}
                        <View style={[styles.amountHighlight, dark ? { backgroundColor: COLORS.dark1 } : { backgroundColor: '#E8F8F3' }]}>
                          <Text style={[styles.amountLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                            Amount to Transfer
                          </Text>
                          <Text style={[styles.amountValue, { color: COLORS.primary }]}>
                            NGN {parseFloat(topupAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>

              {/* Fixed Button Container at Bottom */}
              {!showAccountDetails && (
                <View style={[
                  styles.buttonContainer,
                  dark ? { borderTopColor: COLORS.greyScale800 } : { borderTopColor: '#E5E5E5' }
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.proceedButton, 
                      (!topupAmount || isInitiating) && styles.proceedButtonDisabled
                    ]}
                    onPress={handleProceed}
                    disabled={!topupAmount || isInitiating}
                  >
                    {isInitiating ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.proceedButtonText}>Proceed</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>

    {/* WebView Modal for Checkout */}
    <Modal
      visible={showWebView}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCloseWebView}
    >
      <SafeAreaView
        style={[
          styles.webViewContainer,
          dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
        ]}
        edges={['top']}
      >
        {/* WebView Header */}
        <View style={[
          styles.webViewHeader,
          dark ? { backgroundColor: COLORS.dark2, borderBottomColor: COLORS.greyScale800 } : { backgroundColor: COLORS.white, borderBottomColor: '#E5E5E5' },
        ]}>
          <Text style={[styles.webViewTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            PalmPay Checkout
          </Text>
          <TouchableOpacity
            onPress={handleCloseWebView}
            style={[
              styles.webViewCloseButton,
              dark ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
            ]}
          >
            <Text style={[
              styles.webViewCloseIconText,
              { color: dark ? COLORS.white : COLORS.black }
            ]}>
              ×
            </Text>
          </TouchableOpacity>
        </View>

        {/* WebView */}
        {checkoutUrl && (
          <WebView
            source={{ uri: checkoutUrl }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={[
                styles.webViewLoadingContainer,
                dark ? { backgroundColor: 'rgba(250, 243, 243, 0.9)' } : { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
              ]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            )}
            onNavigationStateChange={(navState) => {
              // You can handle navigation changes here if needed
              console.log('Navigation state changed:', navState.url);
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error: ', nativeEvent);
              showTopToast({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load checkout page',
              });
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
    </>
  );
};

export default FundWalletModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 12,
    maxHeight: '90%',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 4,
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  header: {
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: isTablet ? 16 : 13,
    fontWeight: '400',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    marginLeft: 'auto',
    borderRadius: 20,
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  closeIconText: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '300',
    lineHeight: isTablet ? 40 : 36,
    textAlign: 'center',
    includeFontPadding: false,
    height: isTablet ? 40 : 36,
  },
  webViewContainer: {
    flex: 1,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  webViewTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  webViewCloseButton: {
    marginLeft: 'auto',
    borderRadius: 20,
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  webViewCloseIconText: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '300',
    lineHeight: isTablet ? 40 : 36,
    textAlign: 'center',
    includeFontPadding: false,
    height: isTablet ? 40 : 36,
  },
  webView: {
    flex: 1,
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSection: {
    marginBottom: 0,
  },
  paymentMethodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    marginBottom: 8,
    paddingLeft: 4,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: '#D4D4D4',
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '400',
    color: COLORS.greyscale600,
  },
  radioButtonContainer: {
    marginLeft: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  buttonContainer: {
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 8,
  },
  proceedButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
  accountDetailsSection: {
    marginBottom: 0,
  },
  sectionSubtitle: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    marginBottom: 12,
    paddingLeft: 4,
  },
  accountCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  accountDetailRow: {
    marginBottom: 12,
  },
  accountDetailLabel: {
    fontSize: isTablet ? 12 : 11,
    fontWeight: '400',
    marginBottom: 6,
  },
  accountDetailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountDetailValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  accountNumberText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
  },
  copyIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.primary,
  },
  amountHighlight: {
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: isTablet ? 12 : 11,
    fontWeight: '400',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
  },
});

