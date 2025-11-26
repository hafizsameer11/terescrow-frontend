import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dummy transaction data
const dummyTransactions = [
  {
    id: '1',
    type: 'Sell',
    amount: '100 USDT',
    usdValue: '$100.00',
    date: 'Aug 26, 2023, 9:26 AM',
    icon: images.discountCircle,
  },
  {
    id: '2',
    type: 'Buy',
    amount: '100 USDT',
    usdValue: '$100.00',
    date: 'Aug 26, 2023, 9:26 AM',
    icon: images.discountCircle,
  },
  {
    id: '3',
    type: 'Receive',
    amount: '100 USDT',
    usdValue: '$100.00',
    date: 'Aug 26, 2023, 9:26 AM',
    icon: images.discountCircle,
  },
  {
    id: '4',
    type: 'Swap',
    amount: '100 USDT',
    usdValue: '$100.00',
    date: 'Aug 26, 2023, 9:26 AM',
    icon: images.discountCircle,
  },
  {
    id: '5',
    type: 'Send',
    amount: '100 USDT',
    usdValue: '$100.00',
    date: 'Aug 26, 2023, 9:26 AM',
    icon: images.discountCircle,
  },
];

const AssetDetail = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { assetId, assetName } = useLocalSearchParams<{ assetId: string; assetName: string }>();

  // Map asset name to icon
  const getAssetIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return icons.btc;
    if (nameLower.includes('ethereum') || nameLower.includes('eth')) return icons.eth;
    if (nameLower.includes('tether') || nameLower.includes('usdt')) return icons.usdt;
    if (nameLower.includes('solana') || nameLower.includes('sol')) return icons.solana;
    if (nameLower.includes('bnb')) return icons.bnb;
    return icons.usdt; // Default
  };

  // Default to USDT if no asset provided
  const asset = {
    id: assetId || '3',
    name: assetName || 'USDT',
    icon: getAssetIcon(assetName || 'USDT'),
  };

  const actionButtons = [
    { id: 'sell', label: 'Sell', icon: images.discountCircle },
    { id: 'receive', label: 'Receive', icon: images.assetReceive },
    { id: 'buy', label: 'Buy', icon: icons.secondicon },
    { id: 'swap', label: 'Swap', icon: icons.fourthicon },
    { id: 'send', label: 'Send', icon: images.assetSend },
  ];

  const renderTransaction = ({ item }: { item: typeof dummyTransactions[0] }) => (
    <View
      style={[
        styles.transactionItem,
        dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' },
      ]}
    >
      <View style={styles.transactionLeft}>
        <View style={styles.transactionIconContainer}>
          <Image
            source={item.icon}
            style={styles.transactionIcon}
            contentFit="contain"
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text
            style={[
              styles.transactionType,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {item.type}
          </Text>
          <Text
            style={[
              styles.transactionDate,
              dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
            ]}
          >
            {item.date}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          {item.amount}
        </Text>
        <Text
          style={[
            styles.transactionValue,
            dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
          ]}
        >
          {item.usdValue}
        </Text>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>Balance</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Section */}
        <ImageBackground
          source={images.maskGroup2}
          style={styles.balanceSection}
          imageStyle={styles.balanceBackgroundImage}
          resizeMode="cover"
        >
          <View style={styles.assetIconLargeContainer}>
            <Image
              source={asset.icon}
              style={styles.assetIconLarge}
              contentFit="contain"
            />
          </View>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceAmount}>0.00 {asset.name}</Text>
          <Text style={styles.balanceEquivalent}>~$0.00, ~N0.00</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {actionButtons.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionButton}
                onPress={() => {
                  if (action.id === 'send') {
                    router.push({
                      pathname: '/sendcrypto',
                      params: {
                        assetName: asset.name,
                        assetId: asset.id,
                      },
                    });
                  } else if (action.id === 'buy') {
                    navigate('buycrypto' as any, {
                      assetName: asset.name,
                      assetId: asset.id,
                    });
                  } else if (action.id === 'sell') {
                    navigate('sellcrypto' as any, {
                      assetName: asset.name,
                      assetId: asset.id,
                    });
                  } else if (action.id === 'receive') {
                    navigate('receivecrypto' as any, {
                      assetName: asset.name,
                      assetId: asset.id,
                    });
                  }
                }}
              >
                <View style={styles.actionButtonIconContainer}>
                  <Image
                    source={action.icon}
                    style={styles.actionButtonIcon}
                    contentFit="contain"
                  />
                </View>
                <Text style={styles.actionButtonLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ImageBackground>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <Text
            style={[
              styles.transactionsTitle,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            Transactions
          </Text>
          <FlatList
            data={dummyTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.transactionsList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssetDetail;

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
    paddingTop:40,
    backgroundColor: COLORS.primary,
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
    fontWeight: '400',
    color: COLORS.white,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  balanceSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  balanceBackgroundImage: {
    resizeMode: 'cover',
  },
  assetIconLargeContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 2,
  },
  assetIconLarge: {
    width: 60,
    height: 60,
  },
  balanceLabel: {
    fontSize: isTablet ? 16 : 10,
    color: COLORS.white,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: isTablet ? 32 : 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  balanceEquivalent: {
    fontSize: isTablet ? 16 : 12,
    color: COLORS.white,
    marginBottom: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    // paddingHorizontal: 12,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionButtonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonIcon: {
    width: 20,
    height: 20,
  },
  actionButtonLabel: {
    fontSize: isTablet ? 14 : 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  transactionsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // marginTop: -20,
  },
  transactionsTitle: {
    fontSize: isTablet ? 20 : 14,
    fontWeight: '400',
    marginBottom: 16,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F7F7F7',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 25,
    backgroundColor: '#557314',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIcon: {
    width: 24,
    height: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: isTablet ? 14 : 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionValue: {
    fontSize: isTablet ? 14 : 12,
  },
});

