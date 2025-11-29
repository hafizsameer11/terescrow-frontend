import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const GiftCardDetail = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    cardId?: string;
    cardName?: string;
    selectedCountry?: string;
    selectedGiftCardType?: string;
  }>();

  const cardName = params.cardName || 'Nike';
  const [quantity, setQuantity] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(params.selectedCountry || null);
  const [selectedGiftCardType, setSelectedGiftCardType] = useState<string | null>(params.selectedGiftCardType || null);
  const [amountUSD, setAmountUSD] = useState('');

  useEffect(() => {
    if (params.selectedCountry) {
      setSelectedCountry(params.selectedCountry);
    }
    if (params.selectedGiftCardType) {
      setSelectedGiftCardType(params.selectedGiftCardType);
    }
  }, [params.selectedCountry, params.selectedGiftCardType]);

  // Map card name to image
  const getCardImage = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('nike')) return images.nikeCard;
    if (nameLower.includes('apple')) return images.itunesCard;
    if (nameLower.includes('google')) return images.googlePlayCard;
    if (nameLower.includes('ebay')) return images.ebayCard;
    if (nameLower.includes('steam') || nameLower.includes('razer')) return images.steamCard;
    return images.nikeCard; // Default
  };

  const cardImage = getCardImage(cardName);

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleSelectCountry = () => {
    navigate('countrymodal' as any, {
      selectedCountry: selectedCountry || '',
      returnTo: 'giftcarddetail',
      cardName: cardName,
      cardId: params.cardId,
    });
  };

  const handleSelectGiftCardType = () => {
    navigate('giftcardtypemodal' as any, {
      selectedGiftCardType: selectedGiftCardType || '',
      returnTo: 'giftcarddetail',
      cardName: cardName,
      cardId: params.cardId,
      selectedCountry: selectedCountry || '',
    });
  };

  const handleProceed = () => {
    if (!selectedCountry || !selectedGiftCardType || !amountUSD) {
      return;
    }
    navigate('giftcardpurchasesuccess' as any, {
      cardName: cardName,
      amount: amountUSD,
      quantity: quantity.toString(),
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
          {cardName}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gift Card Image */}
        <View style={styles.cardImageContainer}>
          <Image
            source={cardImage}
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

        {/* Select Country */}
        <View style={styles.inputSection}>
          <TouchableOpacity
            style={styles.selector}
            onPress={handleSelectCountry}
          >
            {selectedCountry ? (
              <Text style={styles.selectorValue}>
                {selectedCountry}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select country
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Gift card type */}
        <View style={styles.inputSection}>
          <TouchableOpacity
            style={styles.selector}
            onPress={handleSelectGiftCardType}
          >
            {selectedGiftCardType ? (
              <Text style={styles.selectorValue}>
                {selectedGiftCardType}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Gift card type
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

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
      </ScrollView>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, (!selectedCountry || !selectedGiftCardType || !amountUSD) && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!selectedCountry || !selectedGiftCardType || !amountUSD}
      >
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GiftCardDetail;

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
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    backgroundColor: '#FEFEFE',
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1e1e1e',
    flex: 1,
  },
  selectorPlaceholder: {
    fontSize: 16,
    fontWeight: '400',
    color: '#989898',
    flex: 1,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#989898',
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
});

