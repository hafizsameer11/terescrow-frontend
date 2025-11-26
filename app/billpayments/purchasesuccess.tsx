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
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const PurchaseSuccess = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount?: string;
    provider?: string;
    mobileNumber?: string;
    type?: string;
    accountType?: string;
    network?: string;
  }>();

  const provider = params.provider || 'MTN';
  const amount = params.amount || '';
  const purchaseType = params.type || 'airtime';
  const accountType = params.accountType || 'Prepaid';

  const handleGoToDashboard = () => {
    router.replace('/(tabs)');
  };

  const handleCopyToken = async () => {
    await Clipboard.setStringAsync('123-345-234-234');
  };

  const getSuccessTitle = () => {
    if (purchaseType === 'cryptosend' || purchaseType === 'cryptobuy' || purchaseType === 'cryptosell') {
      return 'Transfer completed!';
    }
    return 'Purchase completed!';
  };

  const getSuccessMessage = () => {
    if (purchaseType === 'data') {
      return `Your have successfully purchased an ${provider} data now.`;
    }
    if (purchaseType === 'electricity') {
      return `Your have successfully completed your electrical bill payment.`;
    }
    if (purchaseType === 'cabletv') {
      return `Your have successfully completed your cable TV bill payment.`;
    }
    if (purchaseType === 'betting') {
      return `Your have successfully completed your betting payment.`;
    }
    if (purchaseType === 'cryptosend') {
      return `You have successfully traded your ${provider}. Funds will be disbursed into your NGN wallet ASAP.`;
    }
    if (purchaseType === 'cryptobuy') {
      return `You have successfully traded your ${provider}. Funds will be disbursed into your NGN wallet ASAP.`;
    }
    if (purchaseType === 'cryptosell') {
      return `You have successfully traded your ${provider}. Funds will be disbursed into your NGN wallet ASAP.`;
    }
    return `Your have successfully purchased an ${provider} airtime now.`;
  };

  const getBillerName = () => {
    // Extract biller name from provider (e.g., "Ikeja Electricity" -> "IKEDC")
    if (provider.includes('Ikeja')) return 'IKEDC';
    if (provider.includes('Ibadan')) return 'IBEDC';
    if (provider.includes('Abuja')) return 'AEDC';
    if (provider.includes('Jos')) return 'JEDC';
    if (provider.includes('Kaduna')) return 'KEDC';
    return provider.toUpperCase();
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
          <View style={styles.iconCircle}>
            <Image
              source={icons.tickMarked}
              style={styles.successIcon}
              contentFit="contain"
            />
          </View>
        </View>

        {/* Success Title */}
        <Text style={[styles.title, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
          {getSuccessTitle()}
        </Text>

        {/* Success Message */}
        <Text style={[styles.message, dark ? { color: COLORS.greyscale600 } : { color: COLORS.greyscale600 }]}>
          {getSuccessMessage()}
        </Text>

        {/* Electricity Transaction Details Card */}
        {purchaseType === 'electricity' && (
          <View style={[styles.transactionCard, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' }]}>
            <View style={styles.transactionRow}>
              <Text style={[styles.transactionLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Biller Name
              </Text>
              <Text style={[styles.transactionValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                {getBillerName()}
              </Text>
            </View>
            <View style={[styles.transactionSeparator, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
            <View style={styles.transactionRow}>
              <Text style={[styles.transactionLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Amount
              </Text>
              <Text style={[styles.transactionValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                {amount ? `N${parseFloat(amount.replace('NGN', '')).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N0'}
              </Text>
            </View>
            <View style={[styles.transactionSeparator, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
            <View style={styles.transactionRow}>
              <Text style={[styles.transactionLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Units Purchased
              </Text>
              <Text style={[styles.transactionValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                19.55 Units
              </Text>
            </View>
            <View style={[styles.transactionSeparator, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
            <View style={styles.transactionRow}>
              <Text style={[styles.transactionLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Token
              </Text>
              <View style={styles.tokenContainer}>
                <Text style={[styles.transactionValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  123-345-234-234
                </Text>
                <TouchableOpacity onPress={handleCopyToken} style={styles.copyButton}>
                  <Image
                    source={images.copy}
                    style={styles.copyIcon}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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

export default PurchaseSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: isTablet ? 40 : 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    backgroundColor: '#E8F8F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 60 : 50,
    tintColor: '#147341',
  },
  title: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: isTablet ? 16 : 15,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  dashboardButton: {
    width: '100%',
    backgroundColor: '#147341',
    borderRadius: 100,
    paddingVertical: isTablet ? 18 : 16,
    marginBottom: isTablet ? 40 : 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 16 : 17,
    fontWeight: '600',
  },
  transactionCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    backgroundColor: '#F7F7F7',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    color: COLORS.greyscale600,
  },
  transactionValue: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    color: COLORS.black,
  },
  transactionSeparator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    width: 16,
    height: 16,
  },
});

