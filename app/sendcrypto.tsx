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

const SendCrypto = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    assetName?: string;
    assetId?: string;
    selectedNetwork?: string;
  }>();

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(params.selectedNetwork || null);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const assetName = params.assetName || 'BTC';
  const assetId = params.assetId || '1';

  useEffect(() => {
    if (params.selectedNetwork) {
      setSelectedNetwork(params.selectedNetwork);
    }
  }, [params.selectedNetwork]);

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
    return icons.btc;
  };

  const assetIcon = getAssetIcon(assetName);
  const fullAssetName = assetName === 'BTC' ? 'Bitcoin' : assetName === 'ETH' ? 'Ethereum' : assetName;

  const handleSelectNetwork = () => {
    navigate('blockchainmodal' as any, {
      selectedNetwork: selectedNetwork || '',
      returnTo: 'sendcrypto',
      assetName: assetName,
      assetId: assetId,
    });
  };

  const handleProceedToSend = () => {
    if (!selectedNetwork || !address || !amount) {
      return;
    }
    navigate('reviewcryptosend' as any, {
      assetName: assetName,
      assetId: assetId,
      network: selectedNetwork,
      address: address,
      amount: amount,
    });
  };

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
          Send {assetName}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Crypto Limit */}
        <View style={styles.limitContainer}>
          <Text style={[styles.limitLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Remaining crypto limit for today:
          </Text>
          <Text style={[styles.limitValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            NGN500,000
          </Text>
        </View>

        {/* Asset Info */}
        <View style={[styles.assetInfoContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: 'transparent' }]}>
          <View style={styles.assetInfoLeft}>
            <Image
              source={assetIcon}
              style={styles.assetInfoIcon}
              contentFit="contain"
            />
            <View style={styles.assetInfoText}>
              <Text style={[styles.assetInfoName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                {fullAssetName}
              </Text>
              <Text style={[styles.assetInfoSymbol, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                {assetName}
              </Text>
            </View>
          </View>
          <View style={styles.assetInfoRight}>
            <Text style={[styles.balanceLabel, dark ? { color: COLORS.greyscale500 } : { color: '#000' }]}>
              Available Balance
            </Text>
            <Text style={[styles.balanceValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              0.00 {assetName} ~ $0.00
            </Text>
          </View>
        </View>

        {/* Select Network */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={styles.networkSelector}
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

        {/* Enter Address */}
        <View style={styles.inputSection}>
          <Input
            label="Enter address"
            keyboardType="default"
            value={address}
            onChangeText={setAddress}
            id="address"
            variant="signin"
            placeholder="Enter address"
          />
        </View>

        {/* Enter Amount in USD */}
        <View style={styles.inputSection}>
          <Input
            label="Enter amount in USD"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            id="amount"
            variant="signin"
            placeholder="Enter amount in USD"
          />
        </View>

        {/* Transaction Fee */}
        <View style={styles.inputSection}>
          <Text style={[styles.feeLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Transaction fee
          </Text>
          <View style={[styles.feeContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#FEFEFE' }]}>
            <Text style={[styles.feeValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              0.00{assetName}
            </Text>
            <Text style={[styles.feeEquivalent, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              ~0.00
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Proceed to Send Button */}
      <TouchableOpacity
        style={[styles.proceedButton, (!selectedNetwork || !address || !amount) && styles.proceedButtonDisabled]}
        onPress={handleProceedToSend}
        disabled={!selectedNetwork || !address || !amount}
      >
        <Text style={styles.proceedButtonText}>Proceed to send</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SendCrypto;

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
  },
  limitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  limitLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
  },
  limitValue: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  assetInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    // backgroundColor: '#F7F7F7',
  },
  assetInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetInfoIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  assetInfoText: {
    flex: 1,
  },
  assetInfoName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  assetInfoSymbol: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
  },
  assetInfoRight: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: isTablet ? 12 : 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  inputSection: {
    // marginBottom: 20,
  },
  networkSelector: {
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
  feeLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    marginBottom: 8,
    paddingLeft: 4,
  },
  feeContainer: {
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
  feeValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1e1e1e',
  },
  feeEquivalent: {
    fontSize: 16,
    fontWeight: '400',
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

