import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '@/contexts/authContext';
import { useMutation } from '@tanstack/react-query';
import { createBillPaymentOrder } from '@/utils/mutations/authMutations';
import { showTopToast } from '@/utils/helpers';
import { ApiError } from '@/utils/customApiCalls';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const PinModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    amount?: string;
    provider?: string;
    mobileNumber?: string;
    rechargeAccount?: string; // For betting, might be passed as rechargeAccount
    type?: string;
    sceneCode?: 'airtime' | 'data' | 'betting';
    billerId?: string;
    itemId?: string;
  }>();

  // Debug: Log params when component mounts or params change
  useEffect(() => {
    console.log('PIN Modal - Params received:', {
      sceneCode: params.sceneCode,
      billerId: params.billerId,
      itemId: params.itemId,
      mobileNumber: params.mobileNumber,
      amount: params.amount,
      type: params.type,
      provider: params.provider,
    });
  }, [params]);

  const [pin, setPin] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(true);
  const isProcessingRef = useRef(false);

  // Debug: Log params when component mounts or params change
  useEffect(() => {
    console.log('PIN Modal - Params received:', {
      sceneCode: params.sceneCode,
      billerId: params.billerId,
      itemId: params.itemId,
      mobileNumber: params.mobileNumber,
      amount: params.amount,
      type: params.type,
      provider: params.provider,
    });
  }, [params]);

  // Debug: Log params when component mounts or params change
  React.useEffect(() => {
    console.log('PIN Modal params received:', {
      sceneCode: params.sceneCode,
      billerId: params.billerId,
      itemId: params.itemId,
      mobileNumber: params.mobileNumber,
      amount: params.amount,
      type: params.type,
    });
  }, [params]);

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      setPin([...pin, digit]);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0 && !isProcessingRef.current) {
      setPin(pin.slice(0, -1));
    }
  };

  // Mutation for creating bill payment order
  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationKey: ['createBillPaymentOrder'],
    mutationFn: (orderData: {
      sceneCode: 'airtime' | 'data' | 'betting';
      billerId: string;
      itemId?: string;
      rechargeAccount: string;
      amount: number;
      pin: string;
    }) => createBillPaymentOrder(orderData, token),
    onSuccess: (data) => {
      isProcessingRef.current = false;
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Order created successfully',
      });
      // Close modal and navigate to success screen
      setModalVisible(false);
      router.back();
      setTimeout(() => {
        navigate('purchasesuccess' as any, {
          amount: params.amount,
          provider: params.provider,
          mobileNumber: params.mobileNumber,
          type: params.type || 'airtime',
        });
      }, 100);
    },
    onError: (error: ApiError) => {
      isProcessingRef.current = false;
      setPin([]);
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (error.statusCode === 401) {
        errorMessage = 'Invalid PIN. Please try again.';
      } else if (error.statusCode === 400) {
        errorMessage = error.message || 'Invalid request. Please check your details.';
      }
      
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    },
  });

  useEffect(() => {
    if (pin.length === 4 && !isProcessingRef.current) {
      isProcessingRef.current = true;
      
      // Check if this is a bill payment (airtime, data, betting)
      // For betting, rechargeAccount might be passed as mobileNumber or rechargeAccount
      const rechargeAccount = params.mobileNumber || params.rechargeAccount;
      
      if (params.sceneCode && params.billerId && params.amount && rechargeAccount) {
        const pinValue = pin.join('');
        const amountNum = parseFloat(params.amount);
        
        if (isNaN(amountNum) || amountNum <= 0) {
          showTopToast({
            type: 'error',
            text1: 'Error',
            text2: 'Invalid amount',
          });
          setPin([]);
          isProcessingRef.current = false;
          return;
        }

        // Validate required fields
        if (!params.billerId || !rechargeAccount || !params.amount) {
          showTopToast({
            type: 'error',
            text1: 'Error',
            text2: 'Missing required information',
          });
          setPin([]);
          isProcessingRef.current = false;
          return;
        }

        // Prepare order data according to API requirements
        // itemId is required by backend (can be empty string for airtime/betting)
        const orderData = {
          sceneCode: params.sceneCode as 'airtime' | 'data' | 'betting',
          billerId: params.billerId,
          itemId: params.itemId || '', // Always send itemId (empty string if not provided)
          rechargeAccount: rechargeAccount,
          amount: amountNum,
          pin: pinValue,
        };

        console.log('Creating order with data:', {
          sceneCode: orderData.sceneCode,
          billerId: orderData.billerId,
          itemId: orderData.itemId || '(empty string)',
          rechargeAccount: orderData.rechargeAccount,
          amount: orderData.amount,
          pin: '****', // Don't log PIN
        });

        // Create order
        createOrder(orderData);
      } else {
        // Legacy flow for other transaction types
        setTimeout(() => {
          setModalVisible(false);
          router.back();
          setTimeout(() => {
            if (params.type === 'cryptosend' || params.type === 'cryptobuy' || params.type === 'cryptosell') {
              router.push({
                pathname: '/billpayments/purchasesuccess',
                params: {
                  amount: params.amount,
                  provider: params.provider,
                  mobileNumber: params.mobileNumber,
                  type: params.type,
                },
              } as any);
            } else {
              navigate('purchasesuccess' as any, {
                amount: params.amount,
                provider: params.provider,
                mobileNumber: params.mobileNumber,
                type: params.type || 'airtime',
              });
            }
          }, 100);
        }, 500);
        isProcessingRef.current = false;
      }
    }
  }, [pin, params, createOrder, navigate, router]);

  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    textPrimary: COLORS.primary,
    textSecondary: dark ? COLORS.greyscale500 : COLORS.grayscale700,
    pinDot: 'transparent',
    pinDotBorder: dark ? COLORS.greyscale500 : COLORS.greyscale600,
    pinDotFilled: dark ? COLORS.primary : COLORS.primary,
    buttonBackground: dark ? COLORS.gray2 : '#F7F7F7',
    buttonText: dark ? COLORS.white : COLORS.black,
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setModalVisible(false);
        router.back();
      }}
    >
      <Pressable style={styles.modalOverlay} onPress={() => router.back()}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView
            style={[
              styles.container,
              { backgroundColor: themeStyles.background },
            ]}
            edges={['bottom']}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: themeStyles.buttonText }]}>
              Your PIN
            </Text>

            {/* PIN Dots */}
            <View style={styles.pinContainer}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor: pin[index]
                        ? themeStyles.pinDotFilled
                        : 'transparent',
                      borderColor: pin[index]
                        ? themeStyles.pinDotFilled
                        : themeStyles.pinDotBorder,
                      borderWidth: 1,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Loading Indicator */}
            {isCreatingOrder && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: themeStyles.buttonText }]}>
                  Processing...
                </Text>
              </View>
            )}

            {/* Number Pad */}
            <View style={styles.numberPad}>
              {/* Row 1: 1, 2, 3 */}
              {[1, 2, 3].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={[
                    styles.numberButton,
                    { backgroundColor: themeStyles.buttonBackground },
                  ]}
                  onPress={() => !isCreatingOrder && handlePress(digit.toString())}
                  disabled={isCreatingOrder}
                >
                  <Text
                    style={[
                      styles.numberButtonText,
                      { color: themeStyles.buttonText },
                    ]}
                  >
                    {digit}
                  </Text>
                </TouchableOpacity>
              ))}
              {/* Row 2: 4, 5, 6 */}
              {[4, 5, 6].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={[
                    styles.numberButton,
                    { backgroundColor: themeStyles.buttonBackground },
                  ]}
                  onPress={() => !isCreatingOrder && handlePress(digit.toString())}
                  disabled={isCreatingOrder}
                >
                  <Text
                    style={[
                      styles.numberButtonText,
                      { color: themeStyles.buttonText },
                    ]}
                  >
                    {digit}
                  </Text>
                </TouchableOpacity>
              ))}
              {/* Row 3: 7, 8, 9 */}
              {[7, 8, 9].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={[
                    styles.numberButton,
                    { backgroundColor: themeStyles.buttonBackground },
                  ]}
                  onPress={() => !isCreatingOrder && handlePress(digit.toString())}
                  disabled={isCreatingOrder}
                >
                  <Text
                    style={[
                      styles.numberButtonText,
                      { color: themeStyles.buttonText },
                    ]}
                  >
                    {digit}
                  </Text>
                </TouchableOpacity>
              ))}
              {/* Row 4: empty, 0, backspace */}
              <View style={styles.emptyButton} />
              <TouchableOpacity
                style={[
                  styles.numberButton,
                  { backgroundColor: 'transparent' },
                ]}
                onPress={() => !isCreatingOrder && handlePress('0')}
                disabled={isCreatingOrder}
              >
                <Text
                  style={[
                    styles.numberButtonText,
                    { color: themeStyles.buttonText },
                  ]}
                >
                  0
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.numberButton,
                ]}
                onPress={handleBackspace}
                disabled={isCreatingOrder}
              >
                <Text
                  style={[
                    styles.numberButtonText,
                    { color: themeStyles.buttonText },
                  ]}
                >
                  ←
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PinModal;

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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  title: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  numberButton: {
    width: isTablet ? 100 : (width - 80) / 3,
    height: isTablet ? 60 : 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#F7F7F7',
    marginBottom: 12,
  },
  numberButtonText: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '600',
  },
  emptyButton: {
    width: isTablet ? 100 : (width - 80) / 3,
    height: isTablet ? 60 : 56,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
});

