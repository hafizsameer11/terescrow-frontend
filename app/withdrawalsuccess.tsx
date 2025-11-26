import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const WithdrawalSuccess = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount?: string;
  }>();

  const amount = params.amount || '20,000';

  const handleViewTransaction = () => {
    router.replace('/(tabs)/transactions');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={icons.tickMarked}
            style={styles.successIcon}
            contentFit="contain"
          />
        </View>

        {/* Success Title */}
        <Text style={[styles.title, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
          Withdrawal Successful
        </Text>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={[styles.message, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Your have successfully placed a withdrawal
          </Text>
          <Text style={styles.message}>
            <Text style={[styles.message, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              of{' '}
            </Text>
            <Text style={[styles.messageBold, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
              N{amount}
            </Text>
          </Text>
        </View>
      </View>

      {/* View Transaction Button */}
      <TouchableOpacity
        style={styles.viewTransactionButton}
        onPress={handleViewTransaction}
      >
        <Text style={styles.viewTransactionButtonText}>View Transaction</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WithdrawalSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 60,
    height: 60,
    tintColor: COLORS.primary,
  },
  title: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: COLORS.black,
  },
  messageContainer: {
    alignItems: 'center',
  },
  message: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
    color: COLORS.greyscale600,
  },
  messageBold: {
    fontWeight: '700',
    color: COLORS.black,
  },
  viewTransactionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 20,
  },
  viewTransactionButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});

