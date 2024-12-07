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
import { router, useNavigation } from 'expo-router';
import { images } from '@/constants';
import { NavigationProp, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import {
  getCategories,
  ICategoryResponse,
} from '@/utils/queries/quickActionQueries';
import { useAuth } from '@/contexts/authContext';

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

const GiftCard = () => {
  const route = useRoute();
  const { navigate, goBack } = useNavigation<NavigationProp<any>>();
  const { departmentId }: { departmentId: string } = route.params as any;
  if (!departmentId) {
    return goBack();
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCategories, setDisplayCategories] =
    useState<ICategoryResponse['data']['categories']>();
  const { dark } = useTheme();
  const { token } = useAuth();
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: [departmentId, 'categories'],
    queryFn: () => getCategories(token, departmentId),
  });

  useEffect(() => {
    const categoriesData = categories?.data?.categories;
    if (categoriesData) {
      if (searchTerm === '') {
        setDisplayCategories(categoriesData);
        return;
      }
      setDisplayCategories((prev) => {
        const displayCards = prev?.filter((card) =>
          card.category.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return displayCards;
      });
    }
  }, [searchTerm, categories]);

  const renderCardsList = () => {
    return (
      <FlatList
        data={displayCategories}
        renderItem={({ item }) => (
          <CardItem
            card={images[item.category.image as keyof typeof images] as string}
            text={item.category.title}
            onSend={() =>
              navigate(`cards/${item.category.id}`, {
                departmentId: departmentId,
              })
            } // Navigate to the dynamic route with `id`
          />
        )}
        keyExtractor={(item) => item.category.id.toString()}
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
      {displayCategories && renderCardsList()}
    </SafeAreaView>
  );
};

export default GiftCard;
