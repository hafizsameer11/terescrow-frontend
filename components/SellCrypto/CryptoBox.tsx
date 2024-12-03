import { icons } from "@/constants";
import { FlatList, View, Text, StyleSheet } from "react-native";
import CryptoItem from "./CryptoItem";
import { Route, useRouter } from "expo-router";

interface CryptoBox {
  id: string;
  icon: string; // Assuming `images` contains paths or URIs to the images
  text: string;
  heading: string;
}

const CryptoBox = () => {
  const router = useRouter();

  const data: CryptoBox[] = [
    {
      id: "1",
      icon: icons.btc,
      heading: "BTC",
      text: "Bitcoin Wallet",
    },
    {
      icon: icons.usdt,
      id: "2",
      heading: "USDT",
      text: "Tether Wallet",
    },
    {
      icon: icons.eth,
      id: "3",
      heading: "ETH",
      text: "Ethereum Wallet",
    },
    {
      icon: icons.solana,
      id: "4",
      heading: "SOLANA",
      text: "Tether Wallet",
    },
    {
      icon: icons.shibaInu,
      id: "5",
      heading: "SHIBU INU",
      text: "Tether Wallet",
    },
    {
      icon: icons.dogeCoin,
      id: "6",
      heading: "DOGE COIN",
      text: "Tether Wallet",
    },
    {
      icon: icons.dollarCoin,
      id: "7",
      heading: "USDC",
      text: "Ethereum Wallet",
    },
    {
      icon: icons.bnb,
      id: "8",
      heading: "BNB",
      text: "Tether Wallet",
    },
    {
      icon: icons.tonCoin,
      id: "9",
      heading: "TONCOIN",
      text: "Ethereum Wallet",
    },
    {
      icon: icons.tron,
      id: "10",
      heading: "TRON",
      text: "Tether Wallet",
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <CryptoItem
            icon={item.icon}
            heading={item.heading}
            text={item.text}
            onSend={() => router.push(`/crypto/${item.id}` as string)} // Use `as string` for type assertion
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  mainHeading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 16,
    marginLeft: 16,
  },
});

export default CryptoBox;
