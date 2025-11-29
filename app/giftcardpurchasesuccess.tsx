import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const GiftCardPurchaseSuccess = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    cardName?: string;
    amount?: string;
    quantity?: string;
  }>();

  const cardName = params.cardName || 'Apple Gift card';
  const amount = params.amount || '$150';
  const quantity = params.quantity || '1';

  const handleViewCardDetails = () => {
    router.push({
      pathname: '/giftcarddetails',
      params: {
        cardName: cardName,
        amount: amount,
        quantity: quantity,
      },
    } as any);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Image
              source={icons.tickMarked}
              style={styles.successIcon}
              contentFit="contain"
            />
          </View>
        </View>

        {/* Success Title */}
        <Text style={[styles.title, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
          Transaction completed!
        </Text>

        {/* Success Message */}
        <Text style={[styles.message, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
          You have successfully bought {amount} worth of {cardName}
        </Text>
      </View>

      {/* View Card Details Button */}
      <TouchableOpacity
        style={styles.viewCardButton}
        onPress={handleViewCardDetails}
      >
        <Text style={styles.viewCardButtonText}>View Card Details</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GiftCardPurchaseSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: isTablet ? 24 : 22,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    color: COLORS.greyscale600,
    textAlign: 'center',
    lineHeight: 22,
  },
  viewCardButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  viewCardButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});

