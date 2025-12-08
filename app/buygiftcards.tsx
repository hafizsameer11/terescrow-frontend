import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import SearchInputField from '@/components/SearchInputField';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { 
  getDepartments, 
  IDepartmentResponse,
  getGiftCardProducts,
  IGiftCardProduct,
} from '@/utils/queries/quickActionQueries';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const cardWidth = (width - 48) / 2; // 2 columns with padding

const BuyGiftCards = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'Sell giftcards' | 'Buy giftcards'>('Buy giftcards');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch departments to get Gift Card department info
  const {
    data: departmentsData,
    isLoading: departmentsLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getDepartments(token),
    enabled: !!token,
  });

  // Fetch gift card products when Buy giftcards tab is active
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ['giftCardProducts', activeTab],
    queryFn: () => getGiftCardProducts(token, 1, 50),
    enabled: !!token && activeTab === 'Buy giftcards',
  });

  const handleCardPress = (product: IGiftCardProduct) => {
    if (!product.productId) {
      console.warn('Product ID is missing');
      return;
    }
    navigate('giftcarddetails' as any, {
      productId: product.productId.toString(),
      productName: product.productName,
      imageUrl: product.imageUrl,
    });
  };

  const handleTabChange = (tab: 'Sell giftcards' | 'Buy giftcards') => {
    if (tab === 'Sell giftcards') {
      // Find Gift Card department from fetched data
      const giftCardDepartment = departmentsData?.data?.find(
        (dept) => dept.title.includes('Gift Card')
      );
      
      if (giftCardDepartment) {
        // Navigate to sell gift cards flow with proper parameters (same as home page)
        navigate('giftcardcategories' as any, {
          departmentId: giftCardDepartment.id.toString(),
          departmentTitle: giftCardDepartment.title,
          departmentType: (giftCardDepartment as any).Type || 'Gift Card',
        });
      } else if (!departmentsLoading) {
        // If departments are loaded but no Gift Card found, show error or fallback
        console.warn('Gift Card department not found');
      }
    } else {
      setActiveTab(tab);
    }
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (activeTab !== 'Buy giftcards' || !productsData?.data?.products) {
      return [];
    }
    if (!searchQuery.trim()) {
      return productsData.data.products;
    }
    return productsData.data.products.filter((product) =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productsData, searchQuery, activeTab]);

  // Format product value range for display
  const getProductValueRange = (product: IGiftCardProduct): string => {
    if (product.fixedValue) {
      return `$${product.fixedValue}`;
    }
    if (product.minValue && product.maxValue) {
      return `$${product.minValue}-$${product.maxValue}`;
    }
    if (product.minValue) {
      return `From $${product.minValue}`;
    }
    return 'Variable';
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
          Giftcards
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === 'Sell giftcards' && styles.segmentActive,
            activeTab === 'Sell giftcards' && { borderTopLeftRadius: 100, borderBottomLeftRadius: 100 },
          ]}
          onPress={() => handleTabChange('Sell giftcards')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'Sell giftcards'
                ? { color: COLORS.white }
                : { color: COLORS.greyscale600 },
            ]}
          >
            Sell giftcards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === 'Buy giftcards' && styles.segmentActive,
            activeTab === 'Buy giftcards' && { borderTopRightRadius: 100, borderBottomRightRadius: 100 },
          ]}
          onPress={() => setActiveTab('Buy giftcards')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'Buy giftcards'
                ? { color: COLORS.white }
                : { color: COLORS.greyscale600 },
            ]}
          >
            Buy giftcards
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchInputField
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
        />
      </View>

      {/* Gift Cards Grid */}
      {activeTab === 'Buy giftcards' ? (
        productsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Loading products...
            </Text>
          </View>
        ) : productsError ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Error loading products. Please try again.
            </Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              {searchQuery ? 'No products found' : 'No products available'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            numColumns={2}
            keyExtractor={(item) => item.productId.toString()}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cardContainer}
                onPress={() => handleCardPress(item)}
              >
                <Image
                  source={item.imageUrl ? { uri: item.imageUrl } : icons.gift}
                  style={styles.cardImage}
                  contentFit="cover"
                />
                <Text style={[styles.cardName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  {item.productName}
                </Text>
                <Text style={[styles.cardRange, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  {getProductValueRange(item)}
                </Text>
              </TouchableOpacity>
            )}
          />
        )
      ) : null}
    </SafeAreaView>
  );
};

export default BuyGiftCards;

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
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 100,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: COLORS.black,
  },
  segmentText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: 16,

  },
  cardImage: {
    width: '100%',
    height: cardWidth * 0.7,
    borderRadius: 16,
    marginBottom: 8,
  },
  cardName: {
    fontSize: isTablet ? 14 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardRange: {
    fontSize: isTablet ? 12 : 12,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

