import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import NavigateBack from '@/components/NavigateBack';
import CryptoBox from '@/components/SellCrypto/CryptoBox';
import { useTheme } from '@/contexts/themeContext';
import { COLORS, icons } from '@/constants';
import { FlatList } from 'react-native';
import CryptoItem from '@/components/SellCrypto/CryptoItem';
import { useNavigation } from 'expo-router';
import { NavigationProp, useRoute } from '@react-navigation/native';
import { useAuth } from '@/contexts/authContext';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/utils/queries/quickActionQueries';
import { useState } from 'react';

const data: CryptoBox[] = [
  {
    id: '1',
    icon: icons.btc,
    heading: 'BTC',
    text: 'Bitcoin Wallet',
  },
  {
    icon: icons.usdt,
    id: '2',
    heading: 'USDT',
    text: 'Tether Wallet',
  },
  {
    icon: icons.eth,
    id: '3',
    heading: 'ETH',
    text: 'Ethereum Wallet',
  },
  {
    icon: icons.solana,
    id: '4',
    heading: 'SOLANA',
    text: 'Tether Wallet',
  },
  {
    icon: icons.shibaInu,
    id: '5',
    heading: 'SHIBU INU',
    text: 'Tether Wallet',
  },
  {
    icon: icons.dogeCoin,
    id: '6',
    heading: 'DOGE COIN',
    text: 'Tether Wallet',
  },
  {
    icon: icons.dollarCoin,
    id: '7',
    heading: 'USDC',
    text: 'Ethereum Wallet',
  },
  {
    icon: icons.bnb,
    id: '8',
    heading: 'BNB',
    text: 'Tether Wallet',
  },
  {
    icon: icons.tonCoin,
    id: '9',
    heading: 'TONCOIN',
    text: 'Ethereum Wallet',
  },
  {
    icon: icons.tron,
    id: '10',
    heading: 'TRON',
    text: 'Tether Wallet',
  },
];

const CryptoCategories = () => {
  const { dark } = useTheme();
  const { navigate, goBack } = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { departmentId }: { departmentId: string } = route.params as any;
  if (!departmentId) {
    return goBack();
  }

  const { token } = useAuth();
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: [departmentId, 'categories'],
    queryFn: () => getCategories(token, departmentId),
  });

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <NavigateBack text="Buy Crypto" />
      <FlatList
        data={categories?.data?.categories}
        style={{ flex: 1, marginTop: 16 }}
        renderItem={({ item }) => (
          <CryptoItem
            icon={icons[item.category.image as keyof typeof icons] as string}
            title={item.category.title}
            subTitle={item.category.subTitle || ''}
            onSend={() =>
              navigate(`cryptosubcategories`, {
                departmentId: departmentId,
                categoryData: item.category,
              })
            } // Use `as string` for type assertion
          />
        )}
        keyExtractor={(item) => item.category.id.toString()}
        numColumns={2}
      />
    </SafeAreaView>
  );
};

export default CryptoCategories;
