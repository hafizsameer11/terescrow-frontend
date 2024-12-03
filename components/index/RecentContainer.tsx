import { FlatList, View, Text, StyleSheet } from "react-native";
import { COLORS, icons } from "@/constants";
import RecentItem from "./RecentItem";
const RecentContainer = () => {
  const data = [
    {
      icon: icons.gift,
      key: "1",
      heading: "Sell Gidt Cards",
      price: "$1200",
      productId: "N1,681,530",
      date: "2:00 PM",
      text: "Valid bro, Your account has been credited..",
    },
    {
      icon: icons.gift,
      key: "2",
      heading: "Buy Gift Cards",
      price: "$1200",
      productId: "N1,681,530",
      date: "2:00 PM",
      text: "Valid bro, Your account has been credited..",
    },
    {
      icon: icons.bitCoin,
      key: "3",
      heading: "Sell crypto",
      price: "$1200",
      productId: "N1,681,530",
      date: "2:00 PM",
      text: "Valid bro, Your account has been credited..",
    },
    {
      icon: icons.bitCoin,
      key: "4",
      heading: "Sell Crypto",
      price: "$1200",
      productId: "N1,681,530",
      date: "2:00 PM",
      text: "Valid bro, Your account has been credited..",
    },
  ];
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.mainHeading}>Recents</Text>
      </View>
      <FlatList
        data={data}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <RecentItem
            icon={item.icon}
            heading={item.heading}
            text={item.text}
            date={item.date}
            price={item.price}
            productId={item.productId}
          />
        )}
        keyExtractor={(item) => item.key}
        numColumns={1}
      />
    </View>
  );
};

export default RecentContainer;

const styles = StyleSheet.create({
  container: {},
  mainHeading: {
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 16,
    marginRight: 16,
    color: COLORS.greyscale600,
  },
});
