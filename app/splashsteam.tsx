import { COLORS, images } from "@/constants";
import { Image } from "expo-image";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import Button from "@/utils/Button";
import { router } from "expo-router";

const SplashSteam = () => {
  const { dark } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: dark ? COLORS.dark1 : COLORS.white }}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          alignItems: "flex-start",
          paddingVertical: 30,
        }}
      >
        <View style={{ position: "relative", height: 300, width: "100%" }}>
          <Image
            source={images.amazonSplashCard}
            contentFit="contain"
            style={{
              width: 200,
              height: 285,
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
              transform: [{ rotate: "-10deg" }],
            }}
          />
          <Image
            source={images.splashGradientCard}
            contentFit="contain"
            style={{
              width: 250,
              height: 270,
              position: "absolute",
              top: 30,
              left: 0,
              zIndex: 2,
              transform: [{ rotate: "-5deg" }],
            }}
          />
          <Image
            source={images.steamCard}
            contentFit="contain"
            style={{
              width: 280,
              height: 250,
              position: "absolute",
              top: 75,
              left: 0,
              tintColor: dark ? COLORS.dark2 : COLORS.black,
              zIndex: 3,
              transform: [{ rotate: "0deg" }],
            }}
          />
        </View>
        <View style={{ padding: 20, marginTop: 50 }}>
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: dark ? COLORS.white : COLORS.black,
              }}
            >
              Buy And Sell GiftCards
            </Text>
            <Text
              style={{
                color: dark ? COLORS.white : COLORS.black,
                paddingVertical: 6,
              }}
            >
              With our user-friendly system, you can now buy and sell Gift Cards
              with ease
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
              title="Back"
              textColor={COLORS.primary}
              onPress={() => { router.back() }}
            />
            <Button title="Next" style={{ width: "50%" }} onPress={() => { router.push('/instantuserschat') }} />
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, alignItems: "center", width: "100%" }}>
           <Text style={{ height: 5, width: 25, backgroundColor: COLORS.primary, borderRadius: 50}}></Text> 
           <Text style={{ height: 5, width: 7, backgroundColor: COLORS.primary, borderRadius: 50}}></Text> 
           <Text style={{ height: 5, width: 7, backgroundColor: COLORS.primary, borderRadius: 50}}></Text> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SplashSteam;
