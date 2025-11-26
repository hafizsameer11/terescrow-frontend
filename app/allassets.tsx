import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dummy crypto assets data
const dummyAssets = [
  {
    id: '1',
    name: 'BTC',
    fullName: 'Bitcoin',
    icon: icons.btc,
    price: '$108,000',
    change: '+2.56%',
    changeType: 'positive',
    quantity: '0.0012',
    value: '$2,000 ≈ N1,500,000',
  },
  {
    id: '2',
    name: 'ETH',
    fullName: 'Ethereum',
    icon: icons.eth,
    price: '$1,430',
    change: '+2.56%',
    changeType: 'negative',
    quantity: '0.0012',
    value: '$2,000 ≈ N1,500,000',
  },
  {
    id: '3',
    name: 'USDT',
    fullName: 'Tether',
    icon: icons.usdt,
    price: '$1',
    change: '+2.56%',
    changeType: 'positive',
    quantity: '25,000',
    value: '$2,000 ≈ N1,500,000',
  },
  {
    id: '4',
    name: 'BNB',
    fullName: 'Binance Coin',
    icon: icons.bnb,
    price: '$650',
    change: '+2.56%',
    changeType: 'negative',
    quantity: '0.056',
    value: '$2,000 ≈ N1,500,000',
  },
  {
    id: '5',
    name: 'SOL',
    fullName: 'Solana',
    icon: icons.solana,
    price: '$180',
    change: '+2.56%',
    changeType: 'positive',
    quantity: '12',
    value: '$2,000 ≈ N1,500,000',
  },
];

const AllAssets = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();

  const handleAssetPress = (asset: typeof dummyAssets[0]) => {
    navigate('assetdetail', {
      assetId: asset.id,
      assetName: asset.name,
    });
  };

  const renderAssetItem = ({ item }: { item: typeof dummyAssets[0] }) => (
    <TouchableOpacity
      style={[
        styles.assetItem,
        dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' },
      ]}
      onPress={() => handleAssetPress(item)}
    >
      <View style={styles.assetLeft}>
        <View style={styles.assetIconContainer}>
          <Image
            source={item.icon}
            style={styles.assetIcon}
            contentFit="contain"
          />
        </View>
        <View style={styles.assetInfo}>
          <Text
            style={[
              styles.assetName,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {item.name}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
          <Text
            style={[
              styles.assetPrice,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {item.price}
          </Text>
          <Text
            style={[
              styles.assetChange,
              item.changeType === 'positive' ? { color: '#46BE84' } : { color: '#FF0000' },
            ]}
          >
            {item.change}
          </Text>
          </View>
        </View>
      </View>
      <View style={styles.assetRight}>
        <Text
          style={[
            styles.assetQuantity,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          {item.quantity}
        </Text>
        <Text
          style={[
            styles.assetValue,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          {item.value}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
      edges={[]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={icons.arrowBack}
            style={[styles.backIcon, { tintColor: COLORS.white }]}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Assets</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Balance Section */}
      <ImageBackground
        source={images.maskGroup3}
        style={styles.balanceSection}
        imageStyle={styles.balanceBackgroundImage}
        resizeMode="cover"
      >
        <View style={styles.balanceIconContainer}>
          <Image
            source={images.group}
            style={styles.balanceIcon}
            contentFit="contain"
          />
        </View>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceAmount}>$0.00 ≈ N0.00</Text>
      </ImageBackground>

      {/* Assets List */}
      <View style={styles.contentSection}>
        <Text
          style={[
            styles.sectionTitle,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          Crypto Assets
        </Text>
        <FlatList
          data={dummyAssets}
          renderItem={renderAssetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

export default AllAssets;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop :20, 
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    padding: 8,
    paddingTop:25,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    paddingTop:20,
    color: COLORS.white,
  },
  headerRight: {
    width: 40,
  },
  balanceSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  balanceBackgroundImage: {
    resizeMode: 'cover',
  },
  balanceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#28A563',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceIcon: {
    width: 30,
    height: 30,
  },
  balanceLabel: {
    fontSize: isTablet ? 16 : 10,
    color: COLORS.white,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 14,
    fontWeight: '400',
    color: '#00000080',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F7F7F7',
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetIcon: {
    width: 40,
    height: 40,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  assetPrice: {
    fontSize: isTablet ? 16 : 10,
    fontWeight: '400',
    marginBottom: 2,
  },
  assetChange: {
    fontSize: isTablet ? 14 : 10,
    fontWeight: '400',
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetQuantity: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  assetValue: {
    fontSize: isTablet ? 14 : 10,
    fontWeight: '400',
  },
});

