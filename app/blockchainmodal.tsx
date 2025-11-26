import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dummy blockchain networks data with fees
const blockchains = [
  { id: '1', name: 'Ethereum', fee: '0.00023 ETH ~ $2.20' },
  { id: '2', name: 'Avalanche', fee: '0.03 AVAX ~ $2.20' },
  { id: '3', name: 'Bitcoin', fee: '0.0000023 BTC ~ $2.20' },
  { id: '4', name: 'Solana', fee: '0.23 SOL ~ $2.20' },
  { id: '5', name: 'Algorand', fee: '0.00023 ALG ~ $2.20' },
  { id: '6', name: 'Polygon', fee: '0.00023 MATIC ~ $2.20' },
  { id: '7', name: 'EOS', fee: '0.00023 ETH ~ $2.20' },
];

const BlockchainModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    selectedNetwork?: string;
    returnTo?: string;
    assetName?: string;
    assetId?: string;
    selectedCurrency?: string;
    selectedPaymentMethod?: string;
  }>();

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(params.selectedNetwork || null);
  const returnTo = params.returnTo || 'withdrawaldetails';

  const handleSelect = (networkName: string) => {
    setSelectedNetwork(networkName);
    router.back();
    // Use a small delay to ensure navigation completes
    setTimeout(() => {
      if (returnTo === 'sendcrypto') {
        router.push({
          pathname: '/sendcrypto',
          params: {
            selectedNetwork: networkName,
            assetName: params.assetName,
            assetId: params.assetId,
          },
        } as any);
      } else if (returnTo === 'buycrypto') {
        router.push({
          pathname: '/buycrypto',
          params: {
            selectedNetwork: networkName,
            assetName: params.assetName,
            assetId: params.assetId,
            selectedCurrency: params.selectedCurrency,
            selectedPaymentMethod: params.selectedPaymentMethod,
          },
        } as any);
      } else if (returnTo === 'sellcrypto') {
        router.push({
          pathname: '/sellcrypto',
          params: {
            selectedNetwork: networkName,
            assetName: params.assetName,
            assetId: params.assetId,
            selectedCurrency: params.selectedCurrency,
            selectedPaymentMethod: params.selectedPaymentMethod,
          },
        } as any);
      } else if (returnTo === 'receivecrypto') {
        router.push({
          pathname: '/receivecrypto',
          params: {
            selectedNetwork: networkName,
            assetName: params.assetName,
            assetId: params.assetId,
          },
        } as any);
      } else {
        router.replace({
          pathname: '/withdrawaldetails',
          params: {
            selectedNetwork: networkName,
          },
        });
      }
    }, 100);
  };

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
                BLOCKCHAIN
              </Text>
            </View>

            {/* Warning Banner */}
            <View style={styles.warningBanner}>
              <Image
                source={icons.infoCircle}
                style={styles.warningIcon}
                contentFit="contain"
              />
              <Text style={styles.warningText}>
                Please be aware that only supported networks are displayed. If you choose a wrong network, your asset will be lost
              </Text>
            </View>

            {/* Blockchain List */}
            <FlatList
              data={blockchains}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.blockchainItem,
                    dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                  ]}
                  onPress={() => handleSelect(item.name)}
                >
                  <View style={styles.blockchainInfo}>
                    <Text
                      style={[
                        styles.blockchainName,
                        dark ? { color: COLORS.white } : { color: COLORS.black },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.blockchainFee,
                        dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
                      ]}
                    >
                      Fee: {item.fee}
                    </Text>
                  </View>
                  {selectedNetwork === item.name && (
                    <Image
                      source={images.vector45}
                      style={styles.checkmark}
                      contentFit="contain"
                    />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' },
                  ]}
                />
              )}
            />
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BlockchainModal;

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
    maxHeight: '50%',
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFA50033',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  warningIcon: {
    width: 24,
    height: 24,
    tintColor: '#FF9800',
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: isTablet ? 14 : 12,
    color: '#000',
    lineHeight: 18,
  },
  blockchainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  blockchainInfo: {
    flex: 1,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
  },
  blockchainName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  blockchainFee: {
    fontSize: isTablet ? 14 : 10,
    fontWeight: '400',
  },
  checkmark: {
    width: 20,
    height: 20,
  },
  separator: {
    height: 1,
    marginLeft: 4,
  },
});

