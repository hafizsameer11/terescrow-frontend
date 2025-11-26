import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dummy networks data
const networks = [
  { id: '1', name: 'Ethereum' },
  { id: '2', name: 'Avalanche' },
  { id: '3', name: 'Bitcoin' },
  { id: '4', name: 'Solana' },
  { id: '5', name: 'Algorand' },
  { id: '6', name: 'Polygon' },
  { id: '7', name: 'EOS' },
];

const AssetNetwork = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { assetId, assetName, assetIcon, wallet, forReceive } = useLocalSearchParams<{
    assetId: string;
    assetName: string;
    assetIcon?: string;
    wallet?: string;
    forReceive?: string;
  }>();

  const [selectedNetwork, setSelectedNetwork] = useState('Ethereum');

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

  const asset = {
    id: assetId || '3',
    name: assetName || 'ETH',
    icon: getAssetIcon(assetName || 'ETH'),
    wallet: wallet || 'Ethereum Wallet',
  };

  const handleSave = () => {
    // Navigate to swap screen with selected asset and network
    if (forReceive === 'true') {
      // Navigate back to swap with receive asset data
      navigate('swap', {
        receiveAssetId: asset.id,
        receiveAssetName: asset.name,
        receiveAssetIcon: asset.icon,
        receiveWallet: asset.wallet,
        receiveNetwork: selectedNetwork,
        forReceive: 'true',
      });
    } else {
      navigate('swap', {
        assetId: asset.id,
        assetName: asset.name,
        assetIcon: asset.icon,
        wallet: asset.wallet,
        network: selectedNetwork,
      });
    }
  };

  const handleChange = () => {
    // Navigate back to select asset screen
    navigate('selectasset', { forReceive: forReceive || 'false' });
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
              <Text style={[styles.headerTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                Asset & Network
              </Text>
            </View>

            {/* Selected Asset Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                {forReceive === 'true' ? 'Selected Asset (You Receive)' : 'Selected Asset (You Pay)'}
              </Text>
              <View
                style={[
                  styles.selectedAssetCard,
                  dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' },
                ]}
              >
                <View style={styles.selectedAssetLeft}>
                  <Image
                    source={asset.icon}
                    style={styles.selectedAssetIcon}
                    contentFit="contain"
                  />
                  <View style={styles.selectedAssetInfo}>
                    <Text
                      style={[
                        styles.selectedAssetName,
                        dark ? { color: COLORS.white } : { color: COLORS.black },
                      ]}
                    >
                      {asset.name}
                    </Text>
                    <Text
                      style={[
                        styles.selectedAssetWallet,
                        dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
                      ]}
                    >
                      {asset.wallet}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={handleChange}
                >
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Select Network Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                Select Network
              </Text>
              <FlatList
                data={networks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.networkItem,
                      dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                    ]}
                    onPress={() => setSelectedNetwork(item.name)}
                  >
                    <Text
                      style={[
                        styles.networkName,
                        dark ? { color: COLORS.white } : { color: COLORS.black },
                      ]}
                    >
                      {item.name}
                    </Text>
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
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AssetNetwork;

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
    maxHeight: '80%',
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
  },
  headerTitle: {
    fontSize: isTablet ? 22 : 13,
    fontWeight: '400',
    color: '#8A8A8A',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: isTablet ? 16 : 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedAssetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
  },
  selectedAssetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedAssetIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  selectedAssetInfo: {
    flex: 1,
  },
  selectedAssetName: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedAssetWallet: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
  },
  changeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  changeButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 14 : 10,
    fontWeight: '400',
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  networkName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
  checkmark: {
    width: 20,
    height: 20,
    tintColor: COLORS.primary,
  },
  separator: {
    height: 1,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 17,
    fontWeight: '700',
  },
});

