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
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const countries = [
  { id: '1', name: 'United States', currency: 'USD ($)' },
  { id: '2', name: 'Norway', currency: 'DKK Kroner (Kr)' },
  { id: '3', name: 'Germany', currency: 'EUR (#)' },
  { id: '4', name: 'France', currency: 'EUR (#)' },
  { id: '5', name: 'Switzerland', currency: 'CHF (Fr)' },
  { id: '6', name: 'Greece', currency: 'EUR (#)' },
  { id: '7', name: 'Netherlands', currency: 'EUR (#)' },
];

const CountryModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    selectedCountry?: string;
    returnTo?: string;
    cardName?: string;
    cardId?: string;
  }>();

  const [selectedCountry, setSelectedCountry] = useState<string | null>(params.selectedCountry || null);
  const returnTo = params.returnTo || 'giftcarddetail';

  const handleSelect = (countryName: string) => {
    setSelectedCountry(countryName);
    router.back();
    setTimeout(() => {
      router.push({
        pathname: returnTo === 'giftcarddetail' ? '/giftcarddetail' : '/giftcarddetail',
        params: {
          selectedCountry: countryName,
          cardName: params.cardName,
          cardId: params.cardId,
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
            <FlatList
              data={countries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                  ]}
                  onPress={() => handleSelect(item.name)}
                >
                  <View style={styles.countryInfo}>
                    <Text style={[styles.countryName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.countryCurrency, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                      {item.currency}
                    </Text>
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
});

