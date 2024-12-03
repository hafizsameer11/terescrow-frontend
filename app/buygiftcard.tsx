import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigateBack from "@/components/NavigateBack";
import SearchInputField from "@/components/SearchInputField";
import CardList from "@/components/SellGifts/CardList";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";

const BuyGiftCard = () => {
  const { dark } = useTheme();
  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <View>
        <NavigateBack text="Giftcards" />
      </View>
      <View>
        <SearchInputField />
      </View>
      <View style={{ flex: 1 }}>
        <View>
          <CardList />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BuyGiftCard;
