import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getReceiveAddress } from '@/utils/queries/accountQueries';
import { showTopToast } from '@/utils/helpers';
import { getImageUrl } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const ReceiveCrypto = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    assetName?: string;
    assetId?: string;
    selectedNetwork?: string;
  }>();

  const assetName = params.assetName || 'BTC';
  const assetId = params.assetId || '1';
  const accountId = parseInt(assetId, 10);

  // Fetch deposit address
  const {
    data: addressData,
    isLoading: addressLoading,
    isError: addressError,
    refetch: refetchAddress,
  } = useQuery({
    queryKey: ['receiveAddress', accountId],
    queryFn: () => getReceiveAddress(token, accountId),
    enabled: !!token && !isNaN(accountId) && accountId > 0,
    retry: 1,
  });

  const depositAddress = addressData?.data?.address || '';
  const blockchain = addressData?.data?.blockchain || params.selectedNetwork || '';
  const currency = addressData?.data?.currency || assetName;
  const currencyName = addressData?.data?.currencyName || addressData?.data?.currency || assetName;
  const symbol = addressData?.data?.symbol || '';
  const balance = addressData?.data?.balance || '0';

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAddress();
    } catch (error) {
      console.error('Error refreshing address:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchAddress]);

  // Map asset name to icon
  const getAssetIcon = (name: string, symbolPath?: string) => {
    if (symbolPath) {
      if (symbolPath.startsWith('http')) {
        return { uri: symbolPath };
      } else {
        return { uri: getImageUrl(symbolPath) };
      }
    }
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

  const assetIcon = getAssetIcon(currency, symbol);
  const displayNetwork = blockchain || params.selectedNetwork || 'Bitcoin';

  const handleCopyAddress = async () => {
    if (!depositAddress) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Deposit address not available',
      });
      return;
    }
    await Clipboard.setStringAsync(depositAddress);
    showTopToast({
      type: 'success',
      text1: 'Copied',
      text2: 'Deposit address copied to clipboard',
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
          Deposit {addressData?.data?.currencyName || currencyName || assetName}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {addressLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Loading deposit address...
            </Text>
          </View>
        ) : addressError || !depositAddress ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Failed to load deposit address
            </Text>
            <Text style={[styles.errorSubtext, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Please try again or contact support
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetchAddress()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
                Scan the QR to receive {currencyName}
              </Text>
            </View>

            {/* Network */}
            <View style={[styles.inputSection, { marginBottom: 20 }]}>
              <Text style={[styles.label, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Network
              </Text>
              <View style={[styles.selector, { opacity: 0.7 }]}>
                <Text style={styles.selectorValue}>
                  {displayNetwork}
                </Text>
              </View>
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
              {addressData?.data?.addressShared && (
                <Text style={[styles.warningText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }, { marginTop: 4 }]}>
                  This address is shared for all {blockchain} currencies.
                </Text>
              )}
            </View>
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    minHeight: 300,
  },
  loadingText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    minHeight: 300,
  },
  errorText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
});

