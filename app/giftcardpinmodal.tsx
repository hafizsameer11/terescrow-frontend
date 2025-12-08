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
import { purchaseGiftCard, IPurchaseGiftCardReq } from '@/utils/mutations/authMutations';
import { showTopToast } from '@/utils/helpers';
import { ApiError } from '@/utils/customApiCalls';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const GiftCardPinModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token, userData } = useAuth();
  const params = useLocalSearchParams<{
    productId?: string;
    productName?: string;
    quantity?: string;
    unitPrice?: string;
    selectedCountry?: string;
    selectedCountryCode?: string;
    selectedGiftCardType?: string;
  }>();

  const [pin, setPin] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(true);
  const isProcessingRef = useRef(false);

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

  // Mutation for purchasing gift card
  const { mutate: purchaseCard, isPending: isPurchasing } = useMutation({
    mutationKey: ['purchaseGiftCard'],
    mutationFn: (purchaseData: IPurchaseGiftCardReq) => purchaseGiftCard(purchaseData, token),
    onSuccess: (data) => {
      isProcessingRef.current = false;
      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Gift card purchased successfully',
      });
      // Close modal and navigate to success screen
      setModalVisible(false);
      router.back();
      setTimeout(() => {
        navigate('giftcardpurchasesuccess' as any, {
          productName: params.productName || 'Gift Card',
          productId: params.productId,
          amount: params.unitPrice,
          quantity: params.quantity || '1',
          transactionId: data?.data?.transactionId?.toString(),
          orderId: data?.data?.orderId,
          status: data?.data?.status,
        });
      }, 100);
    },
    onError: (error: ApiError) => {
      isProcessingRef.current = false;
      setPin([]);
      let errorMessage = 'Failed to purchase gift card. Please try again.';
      
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
      
      const productId = params.productId ? Number(params.productId) : null;
      const quantity = params.quantity ? Number(params.quantity) : 1;
      const unitPrice = params.unitPrice ? Number(params.unitPrice) : null;
      
      if (!productId || !unitPrice || unitPrice <= 0) {
        showTopToast({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid product details',
        });
        setPin([]);
        isProcessingRef.current = false;
        return;
      }

      // Get sender name from userData
      const senderName = userData?.firstname && userData?.lastname
        ? `${userData.firstname} ${userData.lastname}`
        : userData?.firstname || userData?.username || 'User';

      const pinValue = pin.join('');

      // Prepare purchase data
      const purchaseData: IPurchaseGiftCardReq = {
        productId,
        quantity,
        unitPrice,
        senderName,
        pin: pinValue,
      };

      console.log('Purchasing gift card with data:', {
        productId,
        quantity,
        unitPrice,
        senderName,
      });

      // Create purchase
      purchaseCard(purchaseData);
    }
  }, [pin, params, purchaseCard, userData]);

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
            {isPurchasing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: themeStyles.buttonText }]}>
                  Processing purchase...
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
                  onPress={() => !isPurchasing && handlePress(digit.toString())}
                  disabled={isPurchasing}
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
                  onPress={() => !isPurchasing && handlePress(digit.toString())}
                  disabled={isPurchasing}
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
                  onPress={() => !isPurchasing && handlePress(digit.toString())}
                  disabled={isPurchasing}
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
                onPress={() => !isPurchasing && handlePress('0')}
                disabled={isPurchasing}
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
                disabled={isPurchasing}
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

export default GiftCardPinModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 400,
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  numberButton: {
    width: (width - 120) / 3,
    height: (width - 120) / 3,
    borderRadius: (width - 120) / 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyButton: {
    width: (width - 120) / 3,
    height: (width - 120) / 3,
  },
  numberButtonText: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '600',
  },
});

