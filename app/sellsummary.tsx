import React from 'react';
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
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const SellSummary = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    assetName?: string;
    assetId?: string;
    network?: string;
    currency?: string;
    paymentMethod?: string;
    amount?: string;
    quantity?: string;
  }>();

  const assetName = params.assetName || 'USDT';
  const network = params.network || 'Avalanche';
  const currency = params.currency || 'NGN';
  const paymentMethod = params.paymentMethod || 'Bank Transfer';
  const amount = params.amount || '100';
  const quantity = params.quantity || '0.000';

  // Calculate transaction fee and total
  const gasFee = `10 ${assetName} ~ $10`;
  const totalCrypto = `${parseFloat(amount) + 10} ${assetName} ~ $${parseFloat(amount) + 10}`;
  const totalLocal = `N${(parseFloat(amount) + 10) * 1650}`;

  const handleComplete = () => {
    router.back();
    setTimeout(() => {
      router.push({
        pathname: '/billpayments/pinmodal',
        params: {
          amount: `$${amount}`,
          provider: assetName,
          mobileNumber: '',
          type: 'cryptosell',
          network: network,
        },
      } as any);
    }, 100);
  };

  const summaryRows = [
    { label: 'Amount', value: `${amount} ${assetName} ~ $${amount}` },
    { label: 'Token', value: assetName },
    { label: 'Network', value: network },
    { label: 'Transaction gas fee', value: gasFee },
    { label: 'Total', value: totalCrypto },
  ];

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
                Summary
              </Text>
            </View>

            {/* Summary Details */}
            <View style={styles.detailsContainer}>
              {summaryRows.map((row, index) => (
                <View key={index}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                      {row.label}
                    </Text>
                    <Text style={[styles.detailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                      {row.value}
                    </Text>
                  </View>
                  {index < summaryRows.length - 1 && (
                    <View style={[styles.separator, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
                  )}
                </View>
              ))}
            </View>

            {/* Total Amount to Receive */}
            <View style={[styles.totalContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: 'transparent' }]}>
              <Text style={[styles.totalLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Total Amount to Receive
              </Text>
              <Text style={[styles.totalValue, { color: COLORS.primary }]}>
                {totalLocal}
              </Text>
            </View>

            {/* Complete Button */}
            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SellSummary;

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
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    color: '#1e1e1e',
  },
  detailsContainer: {
    marginBottom: 24,
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
    color: '#8A8A8A',
  },
  detailValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
  separator: {
    height: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: '#D4D4D4',
  },
  totalLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    color: '#8A8A8A',
  },
  totalValue: {
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
  completeButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});

