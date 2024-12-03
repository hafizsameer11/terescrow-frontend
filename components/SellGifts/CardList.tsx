import { images } from "@/constants";
import { View, FlatList } from "react-native";
import CardItem from "./CardItem";
import { useRouter } from "expo-router";

interface CardData {
  id: string;
  card: string; // Assuming `images` contains paths or URIs to the images
  text: string;
}

const CardList: React.FC = () => {
  const router = useRouter();

  const data: CardData[] = [
    {
      id: "1",
      card: images.amazonCard,
      text: "Amazon",
    },
    {
      id: "2",
      card: images.americanExpressCard,
      text: "American Express",
    },
    {
      id: "3",
      card: images.visaCard,
      text: "Visa Card",
    },
    {
      id: "4",
      card: images.ebayCard,
      text: "Ebay",
    },
    {
      id: "5",
      card: images.footLockerCard,
      text: "Footlocker",
    },
    {
      id: "6",
      card: images.googlePlayCard,
      text: "Google Play",
    },
    {
      id: "7",
      card: images.itunesCard,
      text: "iTunes",
    },
    {
      id: "8",
      card: images.nikeCard,
      text: "Nike",
    },
  ];

  return (
    <View>
      <FlatList
        data={data}
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
    </View>
  );
};

export default CardList;
