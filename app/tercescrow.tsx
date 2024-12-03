import { COLORS, images } from "@/constants";
import { Image } from "expo-image";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import { router } from "expo-router";

const TerceScrow = () => {
  const { dark } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: dark ? COLORS.dark1 : COLORS.white }}
    >
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Image
            source={images.tercescrow}
            contentFit="contain"
            style={{ width: "100%", height: 150 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TerceScrow;
