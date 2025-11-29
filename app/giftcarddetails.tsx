import React from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const GiftCardDetails = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    cardName?: string;
    amount?: string;
    quantity?: string;
  }>();

  const cardName = params.cardName || 'Nike Gift Card';
  const amount = params.amount || '$50';
  const quantity = params.quantity || '1';

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

  // Dummy card data
  const cardCode = 'skfkfkkfkwkc349we9vw9v';
  const brand = cardName;
  const value = amount;
  const expirationDate = 'June, 2026';

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(cardCode);
    // TODO: Show toast notification
  };

  const handleViewTransaction = () => {
    // TODO: Navigate to transaction details
    router.replace('/(tabs)/transactions');
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
          Card Details
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

        {/* Card Details Panel */}
        <View style={[styles.detailsPanel, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#E8F5E9' }]}>
          {/* Card Code */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Card Code:
            </Text>
            <View style={styles.detailValueContainer}>
              <Image
                source={images.lock}
                style={[styles.lockIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                contentFit="contain"
              />
              <Text style={[styles.detailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]} numberOfLines={1}>
                {cardCode}
              </Text>
              <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                <Image
                  source={images.copy}
                  style={[styles.copyIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Brand */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Brand:
            </Text>
            <Text style={[styles.detailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {brand}
            </Text>
          </View>

          {/* Value */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Value
            </Text>
            <Text style={[styles.detailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {value}
            </Text>
          </View>

          {/* Expiration */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              Exp
            </Text>
            <Text style={[styles.detailValue, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {expirationDate}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* View Transaction Button */}
      <TouchableOpacity
        style={styles.viewTransactionButton}
        onPress={handleViewTransaction}
      >
        <Text style={styles.viewTransactionButtonText}>View Transaction</Text>
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
  detailsPanel: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    color: COLORS.greyscale600,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
    maxWidth: '60%',
  },
  detailValue: {
    fontSize: isTablet ? 14 : 15,
    fontWeight: '400',
    color: COLORS.black,
    flexShrink: 1,
  },
  lockIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.greyscale600,
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    width: 18,
    height: 18,
  },
  viewTransactionButton: {
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
  viewTransactionButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});

