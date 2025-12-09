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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter } from 'expo-router';
import Input from '@/components/CustomInput';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { initiateDeposit, getDepositStatus, IInitiateDepositRequest } from '@/utils/mutations/authMutations';
import { useAuth } from '@/contexts/authContext';
import { showTopToast } from '@/utils/helpers';
import { ApiError } from '@/utils/customApiCalls';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const paymentMethods = [
  {
    id: 'palmpay',
    name: 'PalmPay',
    description: 'Pay securely with PalmPay.',
    icon: images.vector50, // You can update this icon later
  },
  {
    id: 'card',
    name: 'Card',
    description: 'Pay with your debit or credit card.',
    icon: images.vector49, // You can update this icon later
  },
];

const FundWalletModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('palmpay');
  const [topupAmount, setTopupAmount] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initiate deposit mutation
  const { mutate: handleInitiateDeposit, isPending: isInitiating } = useMutation({
    mutationFn: (data: IInitiateDepositRequest) => initiateDeposit(data, token),
    onSuccess: async (response) => {
      if (response?.data) {
        setTransactionId(response.data.transactionId);
        
        // Open checkout URL in browser
        if (response.data.checkoutUrl) {
          const supported = await Linking.canOpenURL(response.data.checkoutUrl);
          if (supported) {
            await Linking.openURL(response.data.checkoutUrl);
            // Start polling for deposit status
            setIsPolling(true);
            startPollingDepositStatus(response.data.transactionId);
          } else {
            showTopToast({
              type: 'error',
              text1: 'Error',
              text2: 'Cannot open payment link',
            });
          }
        }
      }
    },
    onError: (error: ApiError) => {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to initiate deposit',
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
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount <= 0) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    if (selectedPaymentMethod === 'palmpay') {
      // Initiate PalmPay deposit
      handleInitiateDeposit({
        amount: amount,
        currency: 'NGN',
      });
    } else if (selectedPaymentMethod === 'card') {
      // TODO: Handle card payment
      // For now, show a message that card payment is coming soon
      showTopToast({
        type: 'info',
        text1: 'Coming Soon',
        text2: 'Card payment will be available soon',
      });
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={() => router.back()}
    >
      <Pressable style={styles.modalOverlay} onPress={() => router.back()}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView
            style={[
              styles.container,
              dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
            ]}
            edges={['top']}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                PAYMENT METHOD
              </Text>
            </View>

            {/* Top-up Amount Input */}
            <View style={styles.inputSection}>
              <Input
                label=""
                keyboardType="decimal-pad"
                value={topupAmount}
                onChangeText={setTopupAmount}
                id="topupAmount"
                variant="signin"
                placeholder="Enter topup amount"
              />
            </View>

            {/* Select Payment Method Section */}
            <View style={styles.paymentMethodSection}>
              <Text style={[styles.sectionTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Select Payment Method
              </Text>

              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                    selectedPaymentMethod === method.id && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  {/* Icon */}
                  <View style={[styles.iconContainer, { backgroundColor: COLORS.primary }]}>
                    <Image
                      source={method.icon}
                      style={styles.methodIcon}
                      contentFit="contain"
                    />
                  </View>

                  {/* Text Content */}
                  <View style={styles.methodTextContainer}>
                    <Text style={[styles.methodName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                      {method.name}
                    </Text>
                    <Text style={[styles.methodDescription, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                      {method.description}
                    </Text>
                  </View>

                  {/* Radio Button */}
                  <View style={styles.radioButtonContainer}>
                    <View
                      style={[
                        styles.radioButton,
                        selectedPaymentMethod === method.id
                          ? { borderColor: COLORS.primary, backgroundColor: COLORS.primary }
                          : { borderColor: '#E5E5E5', backgroundColor: COLORS.white },
                      ]}
                    >
                      {selectedPaymentMethod === method.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Proceed Button */}
            <TouchableOpacity
              style={[
                styles.proceedButton, 
                (!topupAmount || isInitiating || isPolling) && styles.proceedButtonDisabled
              ]}
              onPress={handleProceed}
              disabled={!topupAmount || isInitiating || isPolling}
            >
              {isInitiating || isPolling ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.proceedButtonText}>Proceed</Text>
              )}
            </TouchableOpacity>
            
            {/* Polling Status */}
            {isPolling && (
              <View style={styles.pollingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.pollingText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  Waiting for payment confirmation...
                </Text>
              </View>
            )}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
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
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '60%',
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? 16 : 13,
    fontWeight: '400',
    color: '#8A8A8A',
    textTransform: 'uppercase',
  },
  inputSection: {
    marginBottom: 24,
  },
  paymentMethodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    marginBottom: 16,
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
  proceedButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
  pollingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  pollingText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
  },
});

