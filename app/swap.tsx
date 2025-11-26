import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Swap = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    assetId?: string;
    assetName?: string;
    assetIcon?: string;
    wallet?: string;
    network?: string;
    receiveAssetId?: string;
    receiveAssetName?: string;
    receiveAssetIcon?: string;
    receiveWallet?: string;
    receiveNetwork?: string;
    forReceive?: string;
  }>();

  // Default to ETH if no asset provided
  const getAssetIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return icons.btc;
    if (nameLower.includes('ethereum') || nameLower.includes('eth')) return icons.eth;
    if (nameLower.includes('tether') || nameLower.includes('usdt')) return icons.usdt;
    if (nameLower.includes('solana') || nameLower.includes('sol')) return icons.solana;
    if (nameLower.includes('bnb')) return icons.bnb;
    return icons.eth;
  };

  const payAsset = {
    id: '3',
    name: 'ETH',
    fullName: 'Ethereum',
    icon: icons.eth,
    wallet: 'Ethereum Wallet',
    network: 'Ethereum',
    balance: '0.00',
    usdValue: '$0.00',
  };

  const [receiveAsset, setReceiveAsset] = useState<{
    id: string;
    name: string;
    fullName: string;
    icon: any;
    wallet: string;
    network: string;
  } | null>(null);

  const [payAmount, setPayAmount] = useState('0.00011');
  const [receiveAmount, setReceiveAmount] = useState('0');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // Update receive asset when coming back from assetnetwork
  useFocusEffect(
    React.useCallback(() => {
      if (params.receiveAssetId && params.receiveAssetName && params.forReceive === 'true') {
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

        setReceiveAsset({
          id: params.receiveAssetId,
          name: params.receiveAssetName,
          fullName: params.receiveAssetName,
          icon: getAssetIcon(params.receiveAssetName),
          wallet: params.receiveWallet || 'Tether Wallet',
          network: params.receiveNetwork || 'Ethereum',
        });
      }
    }, [params.receiveAssetId, params.receiveAssetName, params.forReceive, params.receiveWallet, params.receiveNetwork])
  );

  const handleReceiveAssetPress = () => {
    navigate('selectasset', { forReceive: 'true' });
  };

  const handleSwap = () => {
    if (!receiveAsset) return;
    setReviewModalVisible(true);
  };

  const handleComplete = () => {
    if (!receiveAsset) return;
    setReviewModalVisible(false);
    router.push({
      pathname: '/swapsuccess',
      params: {
        payAsset: payAsset.fullName,
        receiveAsset: receiveAsset.fullName,
      },
    });
  };

  // Calculate transaction details with useMemo to prevent unnecessary recalculations
  const transactionData = useMemo(() => ({
    amount: `${payAmount} ${payAsset.name} ~ $200`,
    payAsset: payAsset.fullName,
    payNetwork: payAsset.network,
    receiveAsset: receiveAsset?.fullName || 'USDC',
    receiveNetwork: receiveAsset?.network || 'Ethereum',
    gasFee: '0.0003 ETH ~ $10',
    total: '0.00245 ETH ~ $210',
  }), [payAmount, payAsset.name, payAsset.fullName, payAsset.network, receiveAsset?.fullName, receiveAsset?.network]);

  const transactionRows = useMemo(() => [
    { label: 'Amount', value: transactionData.amount },
    { label: 'Asset (to pay)', value: transactionData.payAsset },
    { label: 'Network (to pay)', value: transactionData.payNetwork },
    { label: 'Asset (to Receive)', value: transactionData.receiveAsset },
    { label: 'Network (to Receive)', value: transactionData.receiveNetwork },
    { label: 'Transaction gas fee', value: transactionData.gasFee },
    { label: 'Total', value: transactionData.total },
  ], [transactionData]);

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={icons.arrowBack}
            style={[styles.backIcon, dark ? { tintColor: COLORS.black } : { tintColor: COLORS.black }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
          Swap {payAsset.name}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Crypto Limit and Available Balance */}
        <View style={styles.infoSection}>
          <View style={styles.limitSection}>
            <Text style={styles.limitLabel}>Remaining crypto limit for today:</Text>
            <Text style={styles.limitValue}>NGN500,000</Text>
          </View>
          <View style={styles.balanceSection}>
            <View style={styles.balanceLeft}>
              <Image
                source={payAsset.icon}
                style={styles.balanceIcon}
                contentFit="contain"
              />
              <View>
                <Text style={[styles.balanceAssetName, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                  {payAsset.fullName}
                </Text>
                <Text style={styles.balanceAssetSymbol}>{payAsset.name}</Text>
              </View>
            </View>
            <View style={styles.balanceRight}>
              <Text style={[styles.balanceLabel, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                Available Balance
              </Text>
              <Text style={styles.balanceValue}>
                {payAsset.balance} {payAsset.name} ~ {payAsset.usdValue}
              </Text>
            </View>
          </View>
        </View>

        {/* You Pay Section */}
        <View style={[styles.card, { marginBottom: 16 }, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: 'transparent' }]}>
          <Text style={[styles.cardLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            You Pay
          </Text>
          <View style={styles.cardContent}>
            <TouchableOpacity style={[styles.assetSelector, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#EFEFEF' }]}>
              <View style={styles.iconContainer}>
                <Image
                  source={payAsset.icon}
                  style={styles.selectorIcon}
                  contentFit="contain"
                />
                <View style={styles.networkIconOverlay}>
                  <Image
                    source={(() => {
                      const nameLower = payAsset.network.toLowerCase();
                      if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return icons.btc;
                      if (nameLower.includes('ethereum') || nameLower.includes('eth')) return icons.eth;
                      if (nameLower.includes('tether') || nameLower.includes('usdt')) return icons.usdt;
                      if (nameLower.includes('solana') || nameLower.includes('sol')) return icons.solana;
                      if (nameLower.includes('bnb')) return icons.bnb;
                      return icons.eth;
                    })()}
                    style={styles.networkIcon}
                    contentFit="contain"
                  />
                </View>
              </View>
              <View style={styles.selectorInfo}>
                <Text style={[styles.selectorName, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                  {payAsset.fullName}
                </Text>
                <Text style={[styles.selectorSubtext, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  {payAsset.network}
                </Text>
              </View>
              <Image
                source={icons.arrowDown}
                style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
              />
            </TouchableOpacity>
            <View style={styles.amountSection}>
              <View style={styles.amountTop}>
                <Text style={[styles.amountLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  $200
                </Text>
                <TouchableOpacity style={styles.refreshButton}>
                  <Image
                    source={images.vector46}
                    style={styles.refreshIcon}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.amountValue, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                {payAmount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.swapIconContainer}>
          <TouchableOpacity style={styles.swapIconButton}>
            <Image
              source={icons.fourthicon}
              style={styles.swapIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* You Receive Section */}
        <View style={[styles.card, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: 'transparent' }]}>
          <Text style={[styles.cardLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            You Receive
          </Text>
          <View style={styles.cardContent}>
            <TouchableOpacity
              style={[styles.assetSelector, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#EFEFEF' }]}
              onPress={handleReceiveAssetPress}
            >
              {receiveAsset ? (
                <>
                  <View style={styles.iconContainer}>
                    <Image
                      source={receiveAsset.icon}
                      style={styles.selectorIcon}
                      contentFit="contain"
                    />
                    <View style={styles.networkIconOverlay}>
                      <Image
                        source={(() => {
                          const nameLower = receiveAsset.network.toLowerCase();
                          if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return icons.btc;
                          if (nameLower.includes('ethereum') || nameLower.includes('eth')) return icons.eth;
                          if (nameLower.includes('tether') || nameLower.includes('usdt')) return icons.usdt;
                          if (nameLower.includes('solana') || nameLower.includes('sol')) return icons.solana;
                          if (nameLower.includes('bnb')) return icons.bnb;
                          return icons.eth;
                        })()}
                        style={styles.networkIcon}
                        contentFit="contain"
                      />
                    </View>
                  </View>
                  <View style={styles.selectorInfo}>
                    <Text style={[styles.selectorName, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                      {receiveAsset.fullName}
                    </Text>
                    <Text style={[styles.selectorSubtext, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                      {receiveAsset.network}
                    </Text>
                  </View>
                  <Image
                    source={icons.arrowDown}
                    style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                  />
                </>
              ) : (
                <>
                  <Text style={[styles.placeholderText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                    Asset & Network
                  </Text>
                  <Image
                    source={icons.arrowDown}
                    style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                  />
                </>
              )}
            </TouchableOpacity>
            <View style={styles.amountSection}>
              <View style={styles.amountTop}>
                <Text style={[styles.amountLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  $0
                </Text>
                <TouchableOpacity style={styles.refreshButton}>
                  <Image
                    source={images.vector46}
                    style={styles.refreshIcon}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.amountValue, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                {receiveAmount}
              </Text>
            </View>
          </View>
        </View>

        {/* Swap Icon - Positioned to overlap both cards */}
      
      </ScrollView>

      {/* Proceed to Swap Button */}
      <TouchableOpacity
        style={[styles.proceedButton, !receiveAsset && styles.proceedButtonDisabled]}
        onPress={handleSwap}
        disabled={!receiveAsset}
      >
        <Text style={styles.proceedButtonText}>Proceed to swap</Text>
      </TouchableOpacity>

      {/* Review Transaction Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setReviewModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <SafeAreaView
              style={[
                styles.modalContainer,
                dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
              ]}
              edges={['top']}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandleContainer}>
                <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
              </View>

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalHeaderTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
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
                          styles.detailSeparator,
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
    </SafeAreaView>
  );
};

export default Swap;

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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    marginRight: 40,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  infoSection: {
    marginBottom: 24,
  },
  limitSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  limitLabel: {
    fontSize: isTablet ? 14 : 12,
    color: COLORS.greyscale600,
  },
  limitValue: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    color: COLORS.black,
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  balanceAssetName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  balanceAssetSymbol: {
    fontSize: isTablet ? 14 : 12,
    color: COLORS.greyscale600,
  },
  balanceRight: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: isTablet ? 14 : 12,
    color: COLORS.greyscale600,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2D9EC',
    zIndex: 1,
  },
  cardLabel: {
    fontSize: isTablet ? 14 : 12,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    width:147,
    backgroundColor: 'transparent',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    minHeight: 44,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 8,
  },
  selectorIcon: {
    width: 32,
    height: 32,
  },
  networkIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  networkIcon: {
    width: 12,
    height: 12,
  },
  selectorInfo: {
    flex: 1,
  },
  selectorName: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectorSubtext: {
    fontSize: isTablet ? 12 : 10,
  },
  placeholderText: {
    fontSize: isTablet ? 14 : 12,
    flex: 1,
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amountTop: {
    // flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  amountLabel: {
    fontSize: isTablet ? 12 : 10,
  },
  refreshButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    width: 10,
    height: 10,
  },
  amountValue: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
  },
  swapIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -25,
    zIndex: 10,
  },
  swapIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  swapIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  proceedButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal:20,
    marginVertical:20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '65%',
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
  modalHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  modalHeaderTitle: {
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
    fontWeight: '700',
  },
  detailSeparator: {
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


