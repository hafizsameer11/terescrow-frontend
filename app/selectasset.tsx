import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dummy crypto assets data matching the Figma design
const selectAssets = [
  {
    id: '1',
    name: 'BTC',
    wallet: 'Bitcoin Wallet',
    icon: icons.btc,
    value: '$200.00',
    change: '+0.40%',
    changeType: 'positive',
  },
  {
    id: '2',
    name: 'USDT',
    wallet: 'Tether Wallet',
    icon: icons.usdt,
    value: '$10,000.00',
    change: '-10.00%',
    changeType: 'negative',
  },
  {
    id: '3',
    name: 'ETH',
    wallet: 'Ethereum Wallet',
    icon: icons.eth,
    value: '$200.00',
    change: '+0.40%',
    changeType: 'positive',
  },
  {
    id: '4',
    name: 'SOLANA',
    wallet: 'Tether Wallet',
    icon: icons.solana,
    value: '$200.00',
    change: '+0.40%',
    changeType: 'positive',
  },
  {
    id: '5',
    name: 'SHIBA INU',
    wallet: 'Tether Wallet',
    icon: icons.shibaInu,
    value: '$10,000.00',
    change: '-10.00%',
    changeType: 'negative',
  },
  {
    id: '6',
    name: 'DOGECOIN',
    wallet: 'Tether Wallet',
    icon: icons.dogeCoin,
    value: '$10,000.00',
    change: '-10.00%',
    changeType: 'negative',
  },
  {
    id: '7',
    name: 'USDC',
    wallet: 'Ethereum Wallet',
    icon: icons.dollarCoin || icons.usdt,
    value: '$0.00',
    change: '+0.00%',
    changeType: 'positive',
  },
  {
    id: '8',
    name: 'BNB',
    wallet: 'Tether Wallet',
    icon: icons.bnb,
    value: '$10,000.00',
    change: '-10.00%',
    changeType: 'negative',
  },
  {
    id: '9',
    name: 'TONCOIN',
    wallet: 'Ethereum Wallet',
    icon: icons.tonCoin,
    value: '$200.00',
    change: '+0.40%',
    changeType: 'positive',
  },
  {
    id: '10',
    name: 'TRON',
    wallet: 'Tether Wallet',
    icon: icons.tron,
    value: '$200.00',
    change: '+0.40%',
    changeType: 'positive',
  },
];

const SelectAsset = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { forReceive, fromTradeCrypto, forBuy, forSell } = useLocalSearchParams<{ forReceive?: string; fromTradeCrypto?: string; forBuy?: string; forSell?: string }>();

  const handleAssetPress = (asset: typeof selectAssets[0]) => {
    // If coming from receive flow, navigate to receive crypto screen
    if (forReceive === 'true') {
      navigate('receivecrypto' as any, {
        assetId: asset.id,
        assetName: asset.name,
      });
    } else if (forSell === 'true') {
      // If coming from sell flow, navigate to sell crypto screen
      navigate('sellcrypto' as any, {
        assetId: asset.id,
        assetName: asset.name,
      });
    } else if (forBuy === 'true') {
      // If coming from buy flow, navigate to buy crypto screen
      navigate('buycrypto' as any, {
        assetId: asset.id,
        assetName: asset.name,
      });
    } else if (fromTradeCrypto === 'true') {
      // If coming from trade crypto, navigate to asset detail instead of asset network modal
      navigate('assetdetail', {
        assetId: asset.id,
        assetName: asset.name,
      });
    } else {
      // Open Asset & Network modal (for swap flow)
      navigate('assetnetwork', {
        assetId: asset.id,
        assetName: asset.name,
        assetIcon: asset.icon,
        wallet: asset.wallet,
        forReceive: forReceive || 'false',
      });
    }
  };

  const renderAssetItem = ({ item }: { item: typeof selectAssets[0] }) => (
    <TouchableOpacity
      style={[
        styles.assetCard,
        dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' },
      ]}
      onPress={() => handleAssetPress(item)}
    >
      {/* Top Right: Balance and Change Pill */}
      <View style={styles.topRightContainer}>
        <View
          style={[
            styles.valueTag,
            dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E8E8E8' },
          ]}
        >
          <Image
            source={icons.wallet || icons.bag}
            style={[styles.walletIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
            contentFit="contain"
          />
          <Text
            style={[
              styles.valueText,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {item.value}
          </Text>
          <Text
            style={[
              styles.changeText,
              item.changeType === 'positive' ? { color: '#46BE84' } : { color: '#FF0000' },
            ]}
          >
            {item.change}
          </Text>
        </View>
      </View>

      {/* Left Side: Icon and Text */}
      <View style={styles.assetLeft}>
        <Image
          source={item.icon}
          style={styles.assetIcon}
          contentFit="contain"
        />
        <View style={styles.assetInfo}>
          <Text
            style={[
              styles.assetName,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.assetWallet,
              dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
            ]}
          >
            {item.wallet}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            style={[styles.backIcon, dark ? { tintColor: COLORS.white } : { tintColor: COLORS.black }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
          Select Asset
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Assets Grid */}
      <FlatList
        data={selectAssets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

export default SelectAsset;

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
    // marginRight: 10,
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  assetCard: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    marginBottom: 12,
    position: 'relative',
  },
  topRightContainer: {
    position: 'absolute',
    top: 28,
    right: 0,
    zIndex: 1,
  },
  valueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderRadius: 20,
    borderTopLeftRadius:10,
    borderBottomLeftRadius:10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#E5E5E5',
    gap: 4,
  },
  walletIcon: {
    width: 10,
    height: 10,
  },
  valueText: {
    fontSize: isTablet ? 12 : 8,
    fontWeight: '600',
    marginRight: 4,
  },
  changeText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '500',
  },
  assetLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  assetIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 5,
  },
  assetWallet: {
    fontSize: isTablet ? 12 : 12,
    fontWeight: '400',
  },
});

