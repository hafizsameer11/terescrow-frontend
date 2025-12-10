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
  getGiftCardCategories,
  IGiftCardCategory,
  getGiftCardCountries,
  IGiftCardCountry,
} from '@/utils/queries/quickActionQueries';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const cardWidth = (width - 48) / 2; // 2 columns with padding

type FlowStep = 'categories' | 'countries' | 'products';

const BuyGiftCards = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'Sell giftcards' | 'Buy giftcards'>('Buy giftcards');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState<FlowStep>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);

  // Fetch departments to get Gift Card department info
  const {
    data: departmentsData,
    isLoading: departmentsLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getDepartments(token),
    enabled: !!token,
  });

  // Fetch gift card categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['giftCardCategories'],
    queryFn: () => getGiftCardCategories(token),
    enabled: !!token && activeTab === 'Buy giftcards' && currentStep === 'categories',
  });

  // Fetch gift card countries
  const {
    data: countriesData,
    isLoading: countriesLoading,
  } = useQuery({
    queryKey: ['giftCardCountries'],
    queryFn: () => getGiftCardCountries(token),
    enabled: !!token && activeTab === 'Buy giftcards' && currentStep === 'countries',
  });

  // Fetch gift card products when on products step
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ['giftCardProducts', selectedCategory, selectedCountry, searchQuery],
    queryFn: () => getGiftCardProducts(
      token, 
      1, 
      50, 
      selectedCategory || undefined, 
      selectedCountry || undefined,
      searchQuery || undefined
    ),
    enabled: !!token && activeTab === 'Buy giftcards' && currentStep === 'products',
  });

  const handleCardPress = (product: IGiftCardProduct) => {
    if (!product.productId) {
      console.warn('Product ID is missing');
      return;
    }
    const priceInfo = getProductPriceInfo(product);
    navigate('giftcarddetails' as any, {
      productId: product.productId.toString(),
      productName: product.productName,
      imageUrl: product.imageUrl,
      selectedCountry: selectedCountry || undefined,
      selectedCountryName: selectedCountryName || undefined,
      selectedCategory: selectedCategory || undefined,
      selectedCategoryName: selectedCategoryName || undefined,
      fixedValue: priceInfo.fixedValue?.toString(),
      minValue: priceInfo.minValue?.toString(),
      maxValue: priceInfo.maxValue?.toString(),
      isVariableDenomination: priceInfo.isVariableDenomination.toString(),
      priceRange: priceInfo.priceRange,
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
      // Reset flow when switching to Buy giftcards
      setCurrentStep('categories');
      setSelectedCategory(null);
      setSelectedCategoryName(null);
      setSelectedCountry(null);
      setSelectedCountryName(null);
      setSearchQuery('');
    }
  };

  const handleCategorySelect = (category: IGiftCardCategory | null) => {
    setSelectedCategory(category?.value || null);
    setSelectedCategoryName(category?.name || null);
    setCurrentStep('countries');
  };

  const handleCountrySelect = (country: IGiftCardCountry | null) => {
    setSelectedCountry(country?.isoName || null);
    setSelectedCountryName(country?.name || null);
    setCurrentStep('products');
  };

  const handleBackFromCountries = () => {
    setCurrentStep('categories');
    setSelectedCountry(null);
    setSelectedCountryName(null);
  };

  const handleBackFromProducts = () => {
    setCurrentStep('countries');
    setSearchQuery('');
  };

  // Products are already filtered by API, so use them directly
  const filteredProducts = useMemo(() => {
    if (activeTab !== 'Buy giftcards' || !productsData?.data?.products) {
      return [];
    }
    return productsData.data.products;
  }, [productsData, activeTab]);

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

  // Get product price info for passing to details page
  const getProductPriceInfo = (product: IGiftCardProduct) => {
    return {
      fixedValue: product.fixedValue,
      minValue: product.minValue,
      maxValue: product.maxValue,
      isVariableDenomination: product.isVariableDenomination,
      priceRange: getProductValueRange(product),
    };
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

      {/* Back Button for Countries and Products steps */}
      {activeTab === 'Buy giftcards' && currentStep !== 'categories' && (
        <TouchableOpacity 
          onPress={currentStep === 'countries' ? handleBackFromCountries : handleBackFromProducts}
          style={styles.backStepButton}
        >
          <Image
            source={icons.arrowBack}
            style={[styles.backIcon, dark ? { tintColor: COLORS.black } : { tintColor: COLORS.black }]}
          />
          <Text style={[styles.backStepText, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
            Back
          </Text>
        </TouchableOpacity>
      )}

      {/* Search Bar - Only show on products step */}
      {activeTab === 'Buy giftcards' && currentStep === 'products' && (
        <View style={styles.searchContainer}>
          <SearchInputField
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
          />
        </View>
      )}

      {/* Categories Step */}
      {activeTab === 'Buy giftcards' && currentStep === 'categories' && (
        categoriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Loading categories...
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.stepContainer} contentContainerStyle={styles.stepContent}>
            <Text style={[styles.stepTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Select a Category
            </Text>
            {/* General option to skip */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedCategory === null && styles.optionCardSelected,
                dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: COLORS.grayscale100 }
              ]}
              onPress={() => handleCategorySelect(null)}
            >
              <Text style={[
                styles.optionText,
                selectedCategory === null ? { color: COLORS.white, fontWeight: '700' } : { color: dark ? COLORS.white : COLORS.black }
              ]}>
                General (All Categories)
              </Text>
            </TouchableOpacity>
            {categoriesData?.data?.categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.optionCard,
                  selectedCategory === category.value && styles.optionCardSelected,
                  dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: COLORS.grayscale100 }
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text style={[
                  styles.optionText,
                  selectedCategory === category.value ? { color: COLORS.white, fontWeight: '700' } : { color: dark ? COLORS.white : COLORS.black }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )
      )}

      {/* Countries Step */}
      {activeTab === 'Buy giftcards' && currentStep === 'countries' && (
        countriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Loading countries...
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.stepContainer} contentContainerStyle={styles.stepContent}>
            <Text style={[styles.stepTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              Select a Country
            </Text>
            {/* General option to skip */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedCountry === null && styles.optionCardSelected,
                dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: COLORS.grayscale100 }
              ]}
              onPress={() => handleCountrySelect(null)}
            >
              <Text style={[
                styles.optionText,
                selectedCountry === null ? { color: COLORS.white, fontWeight: '700' } : { color: dark ? COLORS.white : COLORS.black }
              ]}>
                General (All Countries)
              </Text>
            </TouchableOpacity>
            {countriesData?.data?.countries.map((country) => (
              <TouchableOpacity
                key={country.isoName}
                style={[
                  styles.optionCard,
                  selectedCountry === country.isoName && styles.optionCardSelected,
                  dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: COLORS.grayscale100 }
                ]}
                onPress={() => handleCountrySelect(country)}
              >
                <Text style={[
                  styles.optionText,
                  selectedCountry === country.isoName ? { color: COLORS.white, fontWeight: '700' } : { color: dark ? COLORS.white : COLORS.black }
                ]}>
                  {country.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )
      )}

      {/* Products Step */}
      {activeTab === 'Buy giftcards' && currentStep === 'products' && (
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
      )}
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
  backStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backStepText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  optionText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '500',
  },
});

