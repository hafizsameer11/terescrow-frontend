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

const SwapSuccess = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    payAsset?: string;
    receiveAsset?: string;
  }>();

  const payAsset = params.payAsset || 'ETH';
  const receiveAsset = params.receiveAsset || 'USDC';

  const handleGoToDashboard = () => {
    router.replace('/(tabs)');
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
        <Text style={[styles.title, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
          Swap completed!
        </Text>

        {/* Success Message */}
        <Text style={[styles.message, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
          You have successfully swapped your {payAsset} to {receiveAsset}. Funds will be disbursed into your wallet ASAP.
        </Text>
      </View>

      {/* Go to Dashboard Button */}
      <TouchableOpacity
        style={styles.dashboardButton}
        onPress={handleGoToDashboard}
      >
        <Text style={styles.dashboardButtonText}>Go to dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SwapSuccess;

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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 50,
    height: 50,
    tintColor: COLORS.primary,
  },
  title: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  dashboardButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});

