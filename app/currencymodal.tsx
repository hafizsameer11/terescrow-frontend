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

const currencies = [
  { id: '1', name: 'NGN', symbol: '₦' },
  { id: '2', name: 'USD', symbol: '$' },
  { id: '3', name: 'EUR', symbol: '€' },
  { id: '4', name: 'GBP', symbol: '£' },
];

const CurrencyModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    selectedCurrency?: string;
    assetName?: string;
    assetId?: string;
    selectedNetwork?: string;
    selectedPaymentMethod?: string;
    returnTo?: string;
  }>();

  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(params.selectedCurrency || null);
  const returnTo = params.returnTo || 'buycrypto';

  const handleSelect = (currencyName: string) => {
    setSelectedCurrency(currencyName);
    router.back();
    setTimeout(() => {
      router.push({
        pathname: returnTo === 'sellcrypto' ? '/sellcrypto' : '/buycrypto',
        params: {
          selectedCurrency: currencyName,
          assetName: params.assetName,
          assetId: params.assetId,
          selectedNetwork: params.selectedNetwork,
          selectedPaymentMethod: params.selectedPaymentMethod,
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
                SELECT CURRENCY
              </Text>
            </View>

            {/* Currency List */}
            <FlatList
              data={currencies}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyItem,
                    dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                  ]}
                  onPress={() => handleSelect(item.name)}
                >
                  <Text
                    style={[
                      styles.currencyName,
                      dark ? { color: COLORS.white } : { color: COLORS.black },
                    ]}
                  >
                    {item.name} ({item.symbol})
                  </Text>
                  {selectedCurrency === item.name && (
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

export default CurrencyModal;

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
    maxHeight: '37%',
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
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  currencyName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
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

