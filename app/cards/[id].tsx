import React from "react";
import CardDetails from "../../app/CardDetails";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { images } from "@/constants";

interface CardData {
  id: string;
  card: string;
  text: string;
}

const data: CardData[] = [
  { id: "1", card: images.amazonCard, text: "Amazon" },
  { id: "2", card: images.americanExpressCard, text: "American Express" },
  { id: "3", card: images.visaCard, text: "Visa Card" },
  { id: "4", card: images.ebayCard, text: "Ebay" },
  { id: "5", card: images.footLockerCard, text: "Footlocker" },
  { id: "6", card: images.googlePlayCard, text: "Google Play" },
  { id: "7", card: images.itunesCard, text: "iTunes" },
  { id: "8", card: images.nikeCard, text: "Nike" },
];

const CardScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>(); // Retrieve the dynamic `id` from the route

  const cardData = data.find((item) => item.id === id);

  if (!cardData) {
    return null; // Optionally, render an error message or fallback
  }

  return (
    <>
      {/* Disable the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      <CardDetails card={cardData.card} text={cardData.text} />
    </>
  );
};

export default CardScreen;
