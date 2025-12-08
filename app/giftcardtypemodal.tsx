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
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getGiftCardProductTypes } from '@/utils/queries/quickActionQueries';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const GiftCardTypeModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    selectedGiftCardType?: string;
    returnTo?: string;
    productId?: string;
    productName?: string;
    imageUrl?: string;
    cardName?: string; // Legacy support
    cardId?: string; // Legacy support
    selectedCountry?: string;
  }>();

  const productIdParam = params.productId || params.cardId;
  const [selectedGiftCardType, setSelectedGiftCardType] = useState<string | null>(params.selectedGiftCardType || null);
  const returnTo = params.returnTo || 'giftcarddetails';

  // Validate productId is a valid number
  const productId = productIdParam && !isNaN(Number(productIdParam)) ? Number(productIdParam) : null;
  const isValidProductId = productId !== null && productId > 0;

  // Fetch card types from API if productId is available and valid
  const {
    data: typesData,
    isLoading: typesLoading,
    isError: typesError,
  } = useQuery({
    queryKey: ['giftCardProductTypes', productId],
    queryFn: () => getGiftCardProductTypes(token, productId!),
    enabled: !!token && isValidProductId,
    retry: false, // Don't retry on 404 errors
  });

  // Use API types or fallback to empty array
  const giftCardTypes = typesData?.data?.cardTypes || [];

  const handleSelect = (typeName: string) => {
    setSelectedGiftCardType(typeName);
    router.back();
    setTimeout(() => {
      router.push({
        pathname: returnTo === 'giftcarddetails' ? '/giftcarddetails' : '/giftcarddetails',
        params: {
          selectedGiftCardType: typeName,
          productId: params.productId || params.cardId,
          productName: params.productName || params.cardName,
          imageUrl: params.imageUrl,
          selectedCountry: params.selectedCountry,
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

            {/* Gift Card Type List */}
            {!isValidProductId ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Invalid product ID
                </Text>
              </View>
            ) : typesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Loading card types...
                </Text>
              </View>
            ) : typesError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Error loading card types. Please try again.
                </Text>
              </View>
            ) : giftCardTypes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  No card types available
                </Text>
              </View>
            ) : (
              <FlatList
                data={giftCardTypes.filter((type) => type.available)}
                keyExtractor={(item, index) => item.type || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.typeItem,
                      dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                    ]}
                    onPress={() => handleSelect(item.type)}
                  >
                    <View style={styles.typeInfo}>
                      <Text style={[styles.typeName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                        {item.type}
                      </Text>
                      {item.description && (
                        <Text style={[styles.typeDescription, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    {selectedGiftCardType === item.type && (
                      <Image
                        source={images.vector45}
                        style={styles.checkmark}
                        contentFit="contain"
                      />
                    )}
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

export default GiftCardTypeModal;

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
    maxHeight: '40%',
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
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    color: COLORS.greyscale600,
  },
  checkmark: {
    width: 20,
    height: 20,
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

