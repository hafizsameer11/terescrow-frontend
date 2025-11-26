import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BuyCrypto = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    assetName?: string;
    assetId?: string;
    selectedNetwork?: string;
    selectedCurrency?: string;
    selectedPaymentMethod?: string;
  }>();

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(params.selectedNetwork || null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(params.selectedCurrency || null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(params.selectedPaymentMethod || null);
  const [quantity, setQuantity] = useState('0.000');
  const [amountUSD, setAmountUSD] = useState('');
  const [amountLocal, setAmountLocal] = useState('');
  const assetName = params.assetName || 'USDT';
  const assetId = params.assetId || '1';

  useEffect(() => {
    if (params.selectedNetwork) {
      setSelectedNetwork(params.selectedNetwork);
    }
    if (params.selectedCurrency) {
      setSelectedCurrency(params.selectedCurrency);
    }
    if (params.selectedPaymentMethod) {
      setSelectedPaymentMethod(params.selectedPaymentMethod);
    }
  }, [params.selectedNetwork, params.selectedCurrency, params.selectedPaymentMethod]);

  // Map asset name to icon
  const getAssetIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return icons.btc;
    if (nameLower.includes('ethereum') || nameLower.includes('eth')) return icons.eth;
    if (nameLower.includes('tether') || nameLower.includes('usdt')) return icons.usdt;
    if (nameLower.includes('solana') || nameLower.includes('sol')) return icons.solana;
    if (nameLower.includes('bnb')) return icons.bnb;
    if (nameLower.includes('shiba')) return icons.shibaInu;
    if (nameLower.includes('doge')) return icons.dogeCoin;
    if (nameLower.includes('usdc')) return icons.dollarCoin || icons.usdt;
    if (nameLower.includes('ton')) return icons.tonCoin;
    if (nameLower.includes('tron')) return icons.tron;
    return icons.usdt;
  };

  const assetIcon = getAssetIcon(assetName);

  const handleSelectNetwork = () => {
    navigate('blockchainmodal' as any, {
      selectedNetwork: selectedNetwork || '',
      returnTo: 'buycrypto',
      assetName: assetName,
      assetId: assetId,
      selectedCurrency: selectedCurrency || '',
      selectedPaymentMethod: selectedPaymentMethod || '',
    });
  };

  const handleSelectCurrency = () => {
    navigate('currencymodal' as any, {
      selectedCurrency: selectedCurrency || '',
      assetName: assetName,
      assetId: assetId,
      selectedNetwork: selectedNetwork || '',
      selectedPaymentMethod: selectedPaymentMethod || '',
    });
  };

  const handleSelectPaymentMethod = () => {
    navigate('paymentmethodmodal' as any, {
      selectedPaymentMethod: selectedPaymentMethod || '',
      assetName: assetName,
      assetId: assetId,
      selectedNetwork: selectedNetwork || '',
      selectedCurrency: selectedCurrency || '',
    });
  };

  const handleProceed = () => {
    if (!selectedNetwork || !selectedCurrency || !selectedPaymentMethod || !amountUSD) {
      return;
    }
    navigate('buysummary' as any, {
      assetName: assetName,
      assetId: assetId,
      network: selectedNetwork,
      currency: selectedCurrency,
      paymentMethod: selectedPaymentMethod,
      amount: amountUSD,
      quantity: quantity,
    });
  };

  // Calculate local currency amount (example: 1 USD = 1650 NGN)
  useEffect(() => {
    if (amountUSD && selectedCurrency) {
      const rate = selectedCurrency === 'NGN' ? 1650 : 1;
      const localAmount = parseFloat(amountUSD) * rate;
      setAmountLocal(localAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    } else {
      setAmountLocal('');
    }
  }, [amountUSD, selectedCurrency]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image
            source={icons.arrowBack}
            style={[styles.backIcon, dark ? { tintColor: COLORS.black } : { tintColor: COLORS.black }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
          {assetName}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Asset Icon */}
        <View style={styles.assetIconContainer}>
          <Image
            source={assetIcon}
            style={styles.assetIcon}
            contentFit="contain"
          />
        </View>

        {/* Select Currency */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={styles.selector}
            onPress={handleSelectCurrency}
          >
            {selectedCurrency ? (
              <Text style={styles.selectorValue}>
                {selectedCurrency}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Currency
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Select Network */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={styles.selector}
            onPress={handleSelectNetwork}
          >
            {selectedNetwork ? (
              <Text style={styles.selectorValue}>
                {selectedNetwork}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Network
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Quantity */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <Text style={[styles.label, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Quantity
          </Text>
          <View style={[styles.quantityContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#FEFEFE' }]}>
            <Text style={[styles.quantityValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {quantity}
            </Text>
          </View>
        </View>

        {/* Enter amount in USD */}
        <View style={[styles.inputSection, { marginBottom: 0 }]}>
          <Input
            label="Enter amount in USD"
            keyboardType="decimal-pad"
            value={amountUSD}
            onChangeText={setAmountUSD}
            id="amountUSD"
            variant="signin"
            placeholder="Enter amount in USD"
          />
        </View>

        {/* Amount in local currency */}
        <View style={[styles.inputSection, { marginBottom: 0 }]}>
          <Input
            label="Amount in local currency"
            keyboardType="decimal-pad"
            value={amountLocal}
            onChangeText={() => {}} // Read-only, calculated from USD
            id="amountLocal"
            variant="signin"
            placeholder="Amount in local currency"
            isEditable={false}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.inputSection }>
          <TouchableOpacity
            style={styles.selector}
            onPress={handleSelectPaymentMethod}
          >
            {selectedPaymentMethod ? (
              <Text style={styles.selectorValue}>
                {selectedPaymentMethod}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Payment Method
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* View Rate Bar */}
        <View style={[styles.rateBar, dark ? { backgroundColor: '#FFF9E6' } : { backgroundColor: 'transparent' }]}>
          <Text style={styles.rateLabel}>View rate</Text>
          <View style={styles.rateValueContainer}>
            <Text style={styles.rateValue}>$1 = NGN 1,650</Text>
            <Image
              source={icons.arrowDown}
              style={styles.rateArrowIcon}
              contentFit="contain"
            />
          </View>
        </View>
      </ScrollView>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, (!selectedNetwork || !selectedCurrency || !selectedPaymentMethod || !amountUSD) && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!selectedNetwork || !selectedCurrency || !selectedPaymentMethod || !amountUSD}
      >
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default BuyCrypto;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    alignItems: 'center',
  },
  assetIconContainer: {
    width: '100%',
    height: 195,
    marginBottom: 24,
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius:35,
    alignItems: 'center',
  },
  assetIcon: {
    width: 120,
    height: 120,
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    marginBottom: 8,
    paddingLeft: 4,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    backgroundColor: '#FEFEFE',
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1e1e1e',
    flex: 1,
  },
  selectorPlaceholder: {
    fontSize: 16,
    fontWeight: '400',
    color: '#989898',
    flex: 1,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#989898',
  },
  quantityContainer: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1e1e1e',
  },
  rateBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFA500',
    paddingVertical: 8,

    marginTop: 8,
    // backgroundColor: '#FFF9E6',
  },
  rateLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    color: '#FFA500',
  },
  rateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateValue: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    color: '#FFA500',
  },
  rateArrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#1e1e1e',
  },
  proceedButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 100,
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

