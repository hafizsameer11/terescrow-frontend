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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dummy gift card types
const giftCardTypes = [
  { id: '1', name: 'Physical Card' },
  { id: '2', name: 'Digital Code' },
  { id: '3', name: 'Email Delivery' },
  { id: '4', name: 'SMS Delivery' },
];

const GiftCardTypeModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    selectedGiftCardType?: string;
    returnTo?: string;
    cardName?: string;
    cardId?: string;
    selectedCountry?: string;
  }>();

  const [selectedGiftCardType, setSelectedGiftCardType] = useState<string | null>(params.selectedGiftCardType || null);
  const returnTo = params.returnTo || 'giftcarddetail';

  const handleSelect = (typeName: string) => {
    setSelectedGiftCardType(typeName);
    router.back();
    setTimeout(() => {
      router.push({
        pathname: returnTo === 'giftcarddetail' ? '/giftcarddetail' : '/giftcarddetail',
        params: {
          selectedGiftCardType: typeName,
          cardName: params.cardName,
          cardId: params.cardId,
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
            <FlatList
              data={giftCardTypes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.typeItem,
                    dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                  ]}
                  onPress={() => handleSelect(item.name)}
                >
                  <Text style={[styles.typeName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                    {item.name}
                  </Text>
                  {selectedGiftCardType === item.name && (
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
  typeName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  checkmark: {
    width: 20,
    height: 20,
  },
  separator: {
    height: 1,
    marginLeft: 4,
  },
});

