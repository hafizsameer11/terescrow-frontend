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
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const bettingSites = [
  { id: '1', name: '1XBET', logo: images.ellipse20_15 },
  { id: '2', name: 'Bet9ja', logo: images.ellipse20_1 },
  { id: '3', name: 'Betking', logo: images.ellipse20_17 },
  { id: '4', name: 'Betway', logo: images.ellipse20_18 },
  { id: '5', name: 'Sportybet', logo: images.ellipse20_19 },
];

const BettingSiteModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    selectedBettingSite?: string;
  }>();

  const [selectedBettingSite, setSelectedBettingSite] = useState<string | null>(params.selectedBettingSite || null);

  const handleSelect = (siteName: string) => {
    setSelectedBettingSite(siteName);
    router.back();
    // Use a small delay to ensure navigation completes
    setTimeout(() => {
      router.push({
        pathname: '/billpayments/betting',
        params: {
          selectedBettingSite: siteName,
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
            edges={[]}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                BETTING SITE
              </Text>
            </View>

            {/* Betting Site List */}
            <FlatList
              data={bettingSites}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.siteItem,
                    dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                  ]}
                  onPress={() => handleSelect(item.name)}
                >
                  <View style={styles.siteLogoContainer}>
                    <Image
                      source={item.logo}
                      style={styles.siteLogo}
                      contentFit="contain"
                    />
                  </View>
                  <Text
                    style={[
                      styles.siteName,
                      dark ? { color: COLORS.white } : { color: COLORS.black },
                    ]}
                  >
                    {item.name}
                  </Text>
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
              contentContainerStyle={styles.listContent}
            />
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BettingSiteModal;

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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '55%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: isTablet ? 18 : 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  siteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  siteLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F8F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  siteLogo: {
    width: 40,
    height: 40,
  },
  siteName: {
    flex: 1,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
});

