import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import {
  getGiftCardProductById,
} from '@/utils/queries/quickActionQueries';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const GiftCardDetails = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    productId?: string;
    productName?: string;
    imageUrl?: string;
    cardId?: string; // Legacy support
    cardName?: string; // Legacy support
    selectedCountry?: string; // ISO country code from buygiftcards
    selectedCountryName?: string; // Country name from buygiftcards
    selectedCategory?: string; // Category value from buygiftcards
    selectedCategoryName?: string; // Category name from buygiftcards
    selectedCountryCode?: string; // Legacy support
    selectedGiftCardType?: string; // Legacy support - not used anymore
    fixedValue?: string; // Fixed price value
    minValue?: string; // Minimum price value
    maxValue?: string; // Maximum price value
    isVariableDenomination?: string; // Whether denomination is variable
    priceRange?: string; // Formatted price range string
  }>();

  // Support both new (productId) and legacy (cardId) params
  const productIdParam = params.productId || params.cardId;
  const productName = params.productName || params.cardName || 'Gift Card';
  const imageUrl = params.imageUrl;

  // Validate productId is a valid number
  const productId = productIdParam && !isNaN(Number(productIdParam)) ? Number(productIdParam) : null;
  const isValidProductId = productId !== null && productId > 0;

  const [quantity, setQuantity] = useState(1);
  // Use country and category from params (passed from buygiftcards) - no longer selectable
  const selectedCountry = params.selectedCountry || null;
  const selectedCountryName = params.selectedCountryName || null;
  const selectedCategory = params.selectedCategory || null;
  const selectedCategoryName = params.selectedCategoryName || null;
  const [amountUSD, setAmountUSD] = useState('');

  // Fetch product details if productId is available and valid
  const {
    data: productData,
    isLoading: productLoading,
    isError: productError,
  } = useQuery({
    queryKey: ['giftCardProduct', productId],
    queryFn: () => getGiftCardProductById(token, productId!),
    enabled: !!token && isValidProductId,
    retry: false, // Don't retry on 404 errors
  });

  // No longer fetching countries or types - they're passed from previous screen

  // Use product image from API or fallback to param or default
  const cardImage = productData?.data?.imageUrl || imageUrl || images.nikeCard;
  const displayName = productData?.data?.productName || productName;

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // Country and gift card type selection removed - values come from previous screen

  const handleProceed = () => {
    if (!amountUSD || !isValidProductId) {
      return;
    }

    // Validate amount
    const unitPrice = parseFloat(amountUSD);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      return;
    }

    // Navigate to PIN modal for purchase
    navigate('giftcardpinmodal' as any, {
      productId: productId?.toString(),
      productName: displayName,
      quantity: quantity.toString(),
      unitPrice: unitPrice.toString(),
      // Country and gift card type no longer needed for purchase API
    });
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
          {displayName}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {!isValidProductId ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Invalid product ID. Please go back and try again.
          </Text>
        </View>
      ) : productLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Loading product details...
          </Text>
        </View>
      ) : productError ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Product not found. Please go back and try again.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Gift Card Image */}
          <View style={styles.cardImageContainer}>
            <Image
              source={typeof cardImage === 'string' ? { uri: cardImage } : cardImage}
              style={styles.cardImage}
              contentFit="cover"
            />
          </View>

        {/* How many cards? */}
        <View style={[styles.quantitySection, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white }]}>
          <Text style={[styles.quantityLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.black }]}>
            How many cards?
          </Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantityValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {quantity}
            </Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Selected Category (Read-only) */}
        {selectedCategoryName && (
          <View style={[styles.infoSection, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white }]}>
            <Text style={[styles.infoLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Category
            </Text>
            <Text style={[styles.infoValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {selectedCategoryName}
            </Text>
          </View>
        )}

        {/* Display Selected Country (Read-only) */}
        {selectedCountryName && (
          <View style={[styles.infoSection, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white }]}>
            <Text style={[styles.infoLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Country
            </Text>
            <Text style={[styles.infoValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {selectedCountryName}
            </Text>
          </View>
        )}

        {/* Display Product Price Range */}
        {params.priceRange && (
          <View style={[styles.infoSection, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white }]}>
            <Text style={[styles.infoLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Price Range
            </Text>
            <Text style={[styles.infoValue, dark ? { color: COLORS.primary } : { color: COLORS.primary }, styles.priceValue]}>
              {params.priceRange}
            </Text>
          </View>
        )}

        {/* Enter amount in USD */}
        <View style={styles.inputSection}>
          <Input
            label=""
            keyboardType="decimal-pad"
            value={amountUSD}
            onChangeText={setAmountUSD}
            id="amountUSD"
            variant="signin"
            placeholder="Enter amount in USD"
          />
        </View>

        {/* Redemption Instructions */}
        {productData?.data?.redemptionInstructions?.concise && (
          <View style={[styles.instructionsSection, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#FEFEFE' }]}>
            <Text style={[styles.instructionsTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              How to Redeem
            </Text>
            <Text style={[styles.instructionsText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              {productData.data.redemptionInstructions.concise}
            </Text>
          </View>
        )}
        </ScrollView>
      )}

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, !amountUSD && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!amountUSD}
      >
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GiftCardDetails;

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  cardImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    backgroundColor: COLORS.white,
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: isTablet ? 16 : 16,
    fontWeight: '400',
    color: COLORS.black,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 25,
    height: 25,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A4A4A',
  },
  quantityButtonText: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: COLORS.black,
    minWidth: 30,
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
  },
  infoValue: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
  proceedButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 100,
  },
  proceedButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
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
  instructionsSection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    backgroundColor: '#FEFEFE',
  },
  instructionsTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 8,
    color: COLORS.black,
  },
  instructionsText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    lineHeight: 20,
    color: COLORS.greyscale600,
  },
});
