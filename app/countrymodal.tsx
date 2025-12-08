import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getGiftCardProductCountries } from '@/utils/queries/quickActionQueries';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const CountryModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    selectedCountry?: string;
    returnTo?: string;
    productId?: string;
    productName?: string;
    imageUrl?: string;
    cardName?: string; // Legacy support
    cardId?: string; // Legacy support
  }>();

  const productIdParam = params.productId || params.cardId;
  const [selectedCountry, setSelectedCountry] = useState<string | null>(params.selectedCountry || null);
  const returnTo = params.returnTo || 'giftcarddetails';

  // Validate productId is a valid number
  const productId = productIdParam && !isNaN(Number(productIdParam)) ? Number(productIdParam) : null;
  const isValidProductId = productId !== null && productId > 0;

  // Fetch countries from API if productId is available and valid
  const {
    data: countriesData,
    isLoading: countriesLoading,
    isError: countriesError,
  } = useQuery({
    queryKey: ['giftCardProductCountries', productId],
    queryFn: () => getGiftCardProductCountries(token, productId!),
    enabled: !!token && isValidProductId,
    retry: false, // Don't retry on 404 errors
  });

  // Use API countries or fallback to empty array
  const countries = countriesData?.data?.countries || [];

  const handleSelect = (countryName: string, countryCode?: string) => {
    setSelectedCountry(countryName);
    router.back();
    setTimeout(() => {
      router.push({
        pathname: returnTo === 'giftcarddetails' ? '/giftcarddetails' : '/giftcarddetails',
        params: {
          selectedCountry: countryName,
          selectedCountryCode: countryCode || '',
          productId: params.productId || params.cardId,
          productName: params.productName || params.cardName,
          imageUrl: params.imageUrl,
        },
      } as any);
    }, 100);
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={() => router.back()}
    >
      <Pressable style={styles.modalOverlay} onPress={() => router.back()}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView
            style={[
              styles.container,
              dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
            ]}
            edges={['top']}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                CATEGORY
              </Text>
            </View>

            {/* Country List */}
            {!isValidProductId ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Invalid product ID
                </Text>
              </View>
            ) : countriesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Loading countries...
                </Text>
              </View>
            ) : countriesError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Error loading countries. Please try again.
                </Text>
              </View>
            ) : countries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  No countries available
                </Text>
              </View>
            ) : (
              <FlatList
                data={countries}
                keyExtractor={(item, index) => item.countryCode || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.countryItem,
                      dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                    ]}
                    onPress={() => handleSelect(item.countryName, item.countryCode)}
                  >
                    <View style={styles.countryInfo}>
                      <Text style={[styles.countryName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        {item.countryName}
                      </Text>
                      {item.countryCode && (
                        <Text style={[styles.countryCurrency, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                          {item.countryCode}
                        </Text>
                      )}
                    </View>
                    <Image
                      source={icons.arrowRight}
                      style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View
                    style={[
                      styles.separator,
                      dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' },
                    ]}
                  />
                )}
              />
            )}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CountryModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? 16 : 13,
    fontWeight: '400',
    color: '#8A8A8A',
    textTransform: 'uppercase',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    color: COLORS.black,
    marginBottom: 4,
  },
  countryCurrency: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    color: COLORS.greyscale600,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.greyscale600,
  },
  separator: {
    height: 1,
    marginLeft: 4,
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

