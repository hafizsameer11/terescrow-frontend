import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import SearchInputField from '@/components/SearchInputField';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const cardWidth = (width - 48) / 2; // 2 columns with padding

// Dummy gift card data - using available images
const giftCards = [
  {
    id: '1',
    name: 'USA Apple Store',
    range: '(500-2000)',
    image: images.itunesCard,
  },
  {
    id: '2',
    name: 'USA Apple Store',
    range: '(100)',
    image: images.itunesCard,
  },
  {
    id: '3',
    name: 'UK Google Play',
    range: '(10-500)',
    image: images.googlePlayCard,
  },
  {
    id: '4',
    name: 'USA Apple Horizontal',
    range: '(50-500)',
    image: images.itunesCard,
  },
  {
    id: '5',
    name: 'Razer Gold',
    range: '(10-500)',
    image: images.steamCard,
  },
  {
    id: '6',
    name: 'USA Ebay',
    range: '(100-500)',
    image: images.ebayCard,
  },
];

const BuyGiftCards = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<'Sell giftcards' | 'Buy giftcards'>('Buy giftcards');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCardPress = (card: typeof giftCards[0]) => {
    navigate('giftcarddetail' as any, {
      cardId: card.id,
      cardName: card.name,
    });
  };

  const handleTabChange = (tab: 'Sell giftcards' | 'Buy giftcards') => {
    if (tab === 'Sell giftcards') {
      // Navigate to sell gift cards flow (same as home page)
      router.push('/giftcardcategories' as any);
    } else {
      setActiveTab(tab);
    }
  };

  const filteredCards = giftCards.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Giftcards
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === 'Sell giftcards' && styles.segmentActive,
            activeTab === 'Sell giftcards' && { borderTopLeftRadius: 100, borderBottomLeftRadius: 100 },
          ]}
          onPress={() => handleTabChange('Sell giftcards')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'Sell giftcards'
                ? { color: COLORS.white }
                : { color: COLORS.greyscale600 },
            ]}
          >
            Sell giftcards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === 'Buy giftcards' && styles.segmentActive,
            activeTab === 'Buy giftcards' && { borderTopRightRadius: 100, borderBottomRightRadius: 100 },
          ]}
          onPress={() => setActiveTab('Buy giftcards')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'Buy giftcards'
                ? { color: COLORS.white }
                : { color: COLORS.greyscale600 },
            ]}
          >
            Buy giftcards
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchInputField
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
        />
      </View>

      {/* Gift Cards Grid */}
      <FlatList
        data={filteredCards}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => handleCardPress(item)}
          >
            <Image
              source={item.image}
              style={styles.cardImage}
              contentFit="cover"
            />
            <Text style={[styles.cardName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {item.name}
            </Text>
            <Text style={[styles.cardRange, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              {item.range}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default BuyGiftCards;

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
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 100,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: COLORS.black,
  },
  segmentText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: 16,

  },
  cardImage: {
    width: '100%',
    height: cardWidth * 0.7,
    borderRadius: 16,
    marginBottom: 8,
  },
  cardName: {
    fontSize: isTablet ? 14 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardRange: {
    fontSize: isTablet ? 12 : 12,
    fontWeight: '700',
  },
});

