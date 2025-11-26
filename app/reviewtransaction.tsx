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
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const ReviewTransaction = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount?: string;
    payAsset?: string;
    payNetwork?: string;
    receiveAsset?: string;
    receiveNetwork?: string;
    gasFee?: string;
    total?: string;
  }>();

  const transactionData = {
    amount: params.amount || '0.0024 ETH ~ $200',
    payAsset: params.payAsset || 'Ethereum',
    payNetwork: params.payNetwork || 'Ethereum',
    receiveAsset: params.receiveAsset || 'USDC',
    receiveNetwork: params.receiveNetwork || 'Ethereum',
    gasFee: params.gasFee || '0.0003 ETH ~ $10',
    total: params.total || '0.00245 ETH ~ $210',
  };

  const handleComplete = () => {
    router.push({
      pathname: '/swapsuccess',
      params: {
        payAsset: transactionData.payAsset,
        receiveAsset: transactionData.receiveAsset,
      },
    });
  };

  const transactionRows = [
    { label: 'Amount', value: transactionData.amount },
    { label: 'Asset (to pay)', value: transactionData.payAsset },
    { label: 'Network (to pay)', value: transactionData.payNetwork },
    { label: 'Asset (to Receive)', value: transactionData.receiveAsset },
    { label: 'Network (to Receive)', value: transactionData.receiveNetwork },
    { label: 'Transaction gas fee', value: transactionData.gasFee },
    { label: 'Total', value: transactionData.total },
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
                REVIEW TRANSACTION
              </Text>
            </View>

            {/* Transaction Details */}
            <View style={styles.detailsContainer}>
              {transactionRows.map((row, index) => (
                <View key={index}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                      {row.label}
                    </Text>
                    <Text style={[styles.detailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                      {row.value}
                    </Text>
                  </View>
                  {index < transactionRows.length - 1 && (
                    <View
                      style={[
                        styles.separator,
                        dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>

            {/* Complete Button */}
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
            >
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ReviewTransaction;

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
  detailsContainer: {
    flex: 1,
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
  },
  detailValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 17,
    fontWeight: '700',
  },
});

