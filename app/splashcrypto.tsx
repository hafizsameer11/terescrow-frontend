import { COLORS, images } from "@/constants";
import { Image } from "expo-image";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import Button from "@/utils/Button";
import { router } from "expo-router";

const SplashCrypto = () => {
  const { dark } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: dark ? COLORS.dark1 : COLORS.white }}
    >
      <ScrollView
        style={{ flex: 1, padding: 20 }}
        contentContainerStyle={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <Image
            source={images.splashCoins}
            contentFit="contain"
            style={{ width: "100%", height: 300 }}
          />
        </View>
        <View style={{ padding: 10, marginBottom: 30 }}>
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: dark ? COLORS.white : COLORS.black,
              }}
            >
              Buy And Sell Crypto
            </Text>
            <Text
              style={{
                color: dark ? COLORS.white : COLORS.black,
                paddingVertical: 6,
              }}
            >
              With our user-friendly system, you can now trade your crypto with
              ease.
            </Text>
          </View>
          <View
            style={{
              paddingVertical: 20,
              paddingRight: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 5,
              alignItems: "center",
            }}
          >
            <Button
              style={{
                width: "50%",
                backgroundColor: "transparent",
                borderColor: COLORS.primary,
                borderWidth: 1,
              }}
              textColor={COLORS.primary}
              title="Back"
              onPress={() => router.back()}
            />
            <Button title="Next" style={{ width: "50%" }
          
          } onPress={() => { router.push('/signup') }} />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 5,
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text
              style={{
                height: 5,
                width: 7,
                backgroundColor: COLORS.primary,
                borderRadius: 50,
              }}
            ></Text>
            <Text
              style={{
                height: 5,
                width: 7,
                backgroundColor: COLORS.primary,
                borderRadius: 50,
              }}
            ></Text>
            <Text
              style={{
                height: 5,
                width: 25,
                backgroundColor: COLORS.primary,
                borderRadius: 50,
              }}
            ></Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SplashCrypto;
