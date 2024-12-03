import { View } from "react-native";
import NavigateBack from "@/components/NavigateBack";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchInputField from "@/components/SearchInputField";
import CardList from "@/components/SellGifts/CardList";
import { useTheme } from "@/contexts/themeContext";
import { Colors } from "@/constants/Colors";
const SellGiftCard = () => {
  const { dark } = useTheme();
  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: Colors.dark.background }
          : { backgroundColor: Colors.light.background },
      ]}
    >
      <View>
        <NavigateBack text="Giftcards" />
      </View>
      <View>
        <SearchInputField />
      </View>
      <View style={{ flex: 1 }}>
        <CardList />
      </View>
    </SafeAreaView>
  );
};

export default SellGiftCard;
