import React, { useState } from 'react';
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
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const paymentMethods = [
  {
    id: '1',
    name: 'Bank Transfer',
    description: 'Transfer from your bank account (NGN)',
    icon: images.vector50,
  },
  {
    id: '2',
    name: 'Mobile Money',
    description: 'Transfer from your mobile money account (GHC, KSH)',
    icon: images.vector49,
  },
];

const WithdrawPaymentMethodModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('1');

  const handleSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    router.back();
    setTimeout(() => {
      navigate('withdraw' as any, {
        paymentMethod: methodId === '1' ? 'Bank Transfer' : 'Mobile Money',
      });
    }, 100);
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

            {/* Payment Method Options */}
            <View style={styles.paymentMethodSection}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                  ]}
                  onPress={() => handleSelect(method.id)}
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
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default WithdrawPaymentMethodModal;

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
    maxHeight: '37%',
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
  paymentMethodSection: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: '#D4D4D4',
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
});

