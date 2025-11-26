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
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const ReceiveCrypto = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    assetName?: string;
    assetId?: string;
    selectedNetwork?: string;
  }>();

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(params.selectedNetwork || 'Bitcoin');
  const assetName = params.assetName || 'BTC';
  const assetId = params.assetId || '1';

  // Dummy deposit address (in real app, this would come from API)
  const depositAddress = '15o4XxFgJ6iaFRKN5JTYB4L318BJiZsfJ';

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
      returnTo: 'receivecrypto',
      assetName: assetName,
      assetId: assetId,
    });
  };

  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(depositAddress);
    // You could show a toast notification here
  };

  // Generate QR code data (in real app, this would be the deposit address)
  const qrCodeData = depositAddress;

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
          Deposit {assetName}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* QR Code Section */}
        <View style={styles.qrCodeContainer}>
          <View style={styles.qrCodeWrapper}>
            <QRCode
              value={depositAddress}
              size={218}
              color={COLORS.black}
              backgroundColor={COLORS.white}
              logo={assetIcon}
              logoSize={50}
              logoBackgroundColor={COLORS.white}
              logoMargin={2}
              logoBorderRadius={25}
            />
          </View>
          <Text style={[styles.qrCodeLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Scan the QR to receive {assetName}
          </Text>
        </View>

        {/* Network */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <Text style={[styles.label, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Network
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={handleSelectNetwork}
          >
            <Text style={styles.selectorValue}>
              {selectedNetwork || 'Select Network'}
            </Text>
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Deposit Address */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Deposit address
          </Text>
          <View style={styles.addressContainer}>
            <Text style={[styles.addressText, dark ? { color: COLORS.white } : { color: COLORS.black }]} numberOfLines={1}>
              {depositAddress}
            </Text>
            <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
              <Image
                source={images.copy}
                style={styles.copyIcon}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Warning Message */}
        <View style={styles.warningContainer}>
          <Text style={[styles.warningText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Don't send NFTs to this address.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReceiveCrypto;

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
    paddingBottom: 40,
    alignItems: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  qrCodeWrapper: {
    width: 250,
    height: 250,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qrCodeLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    textAlign: 'center',
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
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#989898',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    backgroundColor: '#FEFEFE',
    gap: 12,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1e1e1e',
    flex: 1,
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    width: 20,
    height: 20,
  },
  warningContainer: {
    width: '100%',
    // marginTop: 8,
  },
  warningText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '400',
    // textAlign: 'center',
  },
});

