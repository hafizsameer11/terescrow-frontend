import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { icons } from "@/constants";
import { View, Text, Image, StyleSheet } from "react-native";
import CryptoDetail from "../CryptoDetail";

// Define the data structure for crypto
interface CryptoData {
  id: string;
  icon: string;
  text: string;
}

const cryptoData: CryptoData[] = [
  { id: "1", icon: icons.btc, text: "Bitcoin Wallet" },
  { id: "2", icon: icons.usdt, text: "Tether Wallet" },
  { id: "3", icon: icons.eth, text: "Ethereum Wallet" },
  { id: "4", icon: icons.solana, text: "Tether Wallet" },
  { id: "5", icon: icons.shibaInu, text: "Tether Wallet" },
  { id: "6", icon: icons.dogeCoin, text: "Tether Wallet" },
  { id: "7", icon: icons.dollarCoin, text: "Ethereum Wallet" },
  { id: "8", icon: icons.bnb, text: "Tether Wallet" },
  { id: "9", icon: icons.tonCoin, text: "Ethereum Wallet" },
  { id: "10", icon: icons.tron, text: "Tether Wallet" },
];

const CryptoScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>(); // Retrieve dynamic `id`

  // Find the crypto data for the given id
  const cryptoDataItem = cryptoData.find((item) => item.id === id);

  if (!cryptoDataItem) {
    return null; // Optionally, render an error message or fallback view
  }

  return (
    <>
      {/* Disable the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      <CryptoDetail icon={cryptoDataItem.icon} heading={cryptoDataItem.text} />
    </>
  );
};

export default CryptoScreen;
