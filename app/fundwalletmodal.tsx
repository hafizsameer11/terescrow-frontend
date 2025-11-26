import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter } from 'expo-router';
import Input from '@/components/CustomInput';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const paymentMethods = [
  {
    id: '1',
    name: 'Bank Transfer',
    description: 'Make payment through bank transfer.',
    icon: images.vector50,
  },
  {
    id: '2',
    name: 'Mobile Money',
    description: 'Transfer from your mobile money account.',
    icon: images.vector49,
  },
];

const FundWalletModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('1');
  const [topupAmount, setTopupAmount] = useState('');

  const handleProceed = () => {
    // TODO: Handle proceed action
    router.back();
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
              style={[styles.proceedButton, !topupAmount && styles.proceedButtonDisabled]}
              onPress={handleProceed}
              disabled={!topupAmount}
            >
              <Text style={styles.proceedButtonText}>Proceed</Text>
            </TouchableOpacity>
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
});

