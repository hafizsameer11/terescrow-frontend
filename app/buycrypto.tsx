import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import NavigateBack from "@/components/NavigateBack";
import CryptoBox from "@/components/SellCrypto/CryptoBox";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";

const BuyCrypto = () => {
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
      <NavigateBack text="Buy Crypto" />
      <View style={{ flex: 1 }}>
        <CryptoBox />
      </View>
    </SafeAreaView>
  );
};

export default BuyCrypto;
