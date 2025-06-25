import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TextInput, StyleSheet } from 'react-native';
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
import SearchInputField from '@/components/SearchInputField';

const CryptoCategories = () => {
  const { dark } = useTheme();
  const { navigate, goBack } = useNavigation<NavigationProp<any>>(); 
  const route = useRoute();
  const { departmentId,departmentType }: { departmentId: string,departmentType:string } = route.params as any;
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

  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);

  // Effect to filter categories based on search term
  useEffect(() => {
    if (categories) {
      const categoriesData = categories?.data?.categories;

      if (searchTerm !== '') {
        // Filter categories based on search term
        const filtered = categoriesData.filter((item) =>
          item.category.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(filtered);
      } else {
        setFilteredCategories(categoriesData); // Reset when searchTerm is empty
      }
    }
  }, [categories, searchTerm]);  // Re-run when categories or searchTerm change
console.log("depart ment type",departmentType)
  return (
    <SafeAreaView
      style={[{ flex: 1 }, dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white }]}
    >
      <NavigateBack text="Crypto" />

      {/* Search Input Field */}
      <SearchInputField searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* FlatList to display filtered categories */}
      <FlatList
        data={ filteredCategories || categories?.data?.categories } // Display filtered or all categories
        style={{ flex: 1, marginTop: 16 }}
        renderItem={({ item }) => (
          <CryptoItem
            icon={item.category.image || icons.gift}
            title={item.category.title}
            subTitle={item.category.subTitle || ''}
            onSend={() =>
              navigate('cryptosubcategories', {
                departmentId: departmentId,
                categoryData: item.category,
                departmentTitle: departmentType,
              })
            }
          />
        )}
        keyExtractor={(item) => item.category.id.toString()}
        numColumns={2}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    height: 40,
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 8,
    margin: 16,
    paddingLeft: 10,
    fontSize: 16,
  },
});

export default CryptoCategories;
