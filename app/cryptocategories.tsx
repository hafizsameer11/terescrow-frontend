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
import { useEffect, useState } from 'react';



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
useEffect(() => {
  if(categories){
    console.log(categories.data.categories);
  }
})
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
            icon={item.category.image || icons.gift}
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
