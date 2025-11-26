import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const PinModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    amount?: string;
    provider?: string;
    mobileNumber?: string;
    type?: string;
  }>();

  const [pin, setPin] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(true);

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      setPin([...pin, digit]);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      // TODO: Validate PIN and process transaction
      // Navigate to success screen after a delay
      setTimeout(() => {
        // Close modal first
        setModalVisible(false);
        router.back();
        // Use a small delay to ensure navigation completes
        setTimeout(() => {
          if (params.type === 'cryptosend' || params.type === 'cryptobuy' || params.type === 'cryptosell') {
            // For crypto send/buy/sell, navigate to success screen
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
    }
  }, [pin, navigate, router, params]);

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
                  onPress={() => handlePress(digit.toString())}
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
                  onPress={() => handlePress(digit.toString())}
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
                  onPress={() => handlePress(digit.toString())}
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
                onPress={() => handlePress('0')}
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
                  ,
                ]}
                onPress={handleBackspace}
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
});

