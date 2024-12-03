import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigateBack from "@/components/NavigateBack";
import SearchInputField from "@/components/SearchInputField";
import { DUMMY_GIFT_SOLDS_BOUGHT } from "@/utils/dummyTrans";
import TransactionData from "@/components/TransactionData";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";

const GiftCardSold = () => {
  const { dark } = useTheme();
  const data = DUMMY_GIFT_SOLDS_BOUGHT;
  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <NavigateBack text="Gift Card Sold" />
      <SearchInputField />
      <View style={{ flex: 1 }}>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <TransactionData
              icon={item.icon}
              heading={item.heading}
              date={item.date}
              price={item.price}
              productId={item.productId}
            />
          )}
          keyExtractor={(item) => item.key}
          numColumns={1}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default GiftCardSold;
