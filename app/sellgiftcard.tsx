import { View } from 'react-native';
import NavigateBack from '@/components/NavigateBack';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchInputField from '@/components/SearchInputField';
import CardList from '@/components/SellGifts/CardList';
import { useTheme } from '@/contexts/themeContext';
import { Colors } from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import CardItem from '@/components/SellGifts/CardItem';
import { router } from 'expo-router';
import { images } from '@/constants';

interface CardData {
  id: string;
  card: string; // Assuming `images` contains paths or URIs to the images
  text: string;
}

const cardData: CardData[] = [
  {
    id: '1',
    card: images.amazonCard,
    text: 'Amazon',
  },
  {
    id: '2',
    card: images.americanExpressCard,
    text: 'American Express',
  },
  {
    id: '3',
    card: images.visaCard,
    text: 'Visa Card',
  },
  {
    id: '4',
    card: images.ebayCard,
    text: 'Ebay',
  },
  {
    id: '5',
    card: images.footLockerCard,
    text: 'Footlocker',
  },
  {
    id: '6',
    card: images.googlePlayCard,
    text: 'Google Play',
  },
  {
    id: '7',
    card: images.itunesCard,
    text: 'iTunes',
  },
  {
    id: '8',
    card: images.nikeCard,
    text: 'Nike',
  },
];

const SellGiftCard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCards, setDisplayCards] = useState<CardData[]>(cardData);
  const { dark } = useTheme();

  useEffect(() => {
    if (searchTerm === '') {
      setDisplayCards(cardData);
      return;
    }
    const displayCards = cardData.filter((card) =>
      card.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayCards(displayCards);
  }, [searchTerm]);

  const renderCardsList = () => {
    return (
      <FlatList
        data={displayCards}
        renderItem={({ item }) => (
          <CardItem
            card={item.card}
            text={item.text}
            onSend={() => router.push(`/cards/${item.id}`)} // Navigate to the dynamic route with `id`
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ marginHorizontal: 16 }}
        contentContainerStyle={{ padding: 0 }}
      />
    );
  };

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: Colors.dark.background }
          : { backgroundColor: Colors.light.background },
      ]}
    >
      <NavigateBack text="Giftcards" />
      <SearchInputField searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {renderCardsList()}
    </SafeAreaView>
  );
};

export default SellGiftCard;
