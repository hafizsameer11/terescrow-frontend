import { COLORS, images } from "@/constants";
import { Image } from "expo-image";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import Button from "@/utils/Button";
import { router } from "expo-router";

const InstantUsersChat = () => {
  const { dark } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dark ? COLORS.dark1 : COLORS.white }}>
      <ScrollView contentContainerStyle={{ flex: 1, padding: 20, alignItems: "center" }}>
        <View style={{ position: "relative", width: 300, height: 300, marginTop: 20 }}>
          {/* Center Image */}
          <Image
            source={images.user1}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              position: "absolute",
              top: 100,
              left: 100,
              zIndex: 3,
            }}
          />
          {/* Top Left */}
          <Image
            source={images.user2}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              position: "absolute",
              top: 20,
              left: 35,
              zIndex: 2,
            }}
          />
          {/* Top Right */}
          <Image
            source={images.user3}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              position: "absolute",
              top: 20,
              right: 30,
              zIndex: 2,
            }}
          />
          <Image
            source={images.user4}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              position: "absolute",
              bottom: 30,
              left: 50,
              zIndex: 2,
            }}
          />
          {/* Bottom Right */}
          <Image
            source={images.user5}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              position: "absolute",
              bottom: 30,
              right: 50,
              zIndex: 2,
            }}
          />
          {/* Top Center */}
          <Image
            source={images.user6}
            style={{
              width: 50,
              height: 50,
              borderRadius: 30,
              position: "absolute",
              top: 45,
              left: 125,
              zIndex: 1,
            }}
          />
          <Image
            source={images.user8}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              position: "absolute",
              top: 120,
              left: 15,
              zIndex: 1,
            }}
          />
          {/* Right Center */}
          <Image
            source={images.user9}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              position: "absolute",
              top: 120,
              right: 15,
              zIndex: 1,
            }}
          />
        </View>
        <View style={{ padding: 10, marginTop: 50 }}>
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: dark ? COLORS.white : COLORS.black,
              }}
            >
              INSTANT AI CHAT SUPPORT:
            </Text>
            <Text
              style={{
                color: dark ? COLORS.white : COLORS.black,
                paddingVertical: 6,
              }}
            >
              You chat with an intelligent AI assistant to trade crypto and gift cards anytime, quickly and safely.
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
            <Button title="Next" style={{ width: "50%" }} onPress={() => { router.push('/splashcrypto') }} />
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 5, alignItems: "center", width: "100%" }}>
           <Text style={{ height: 5, width: 7, backgroundColor: COLORS.primary, borderRadius: 50}}></Text> 
           <Text style={{ height: 5, width: 25, backgroundColor: COLORS.primary, borderRadius: 50}}></Text> 
           <Text style={{ height: 5, width: 7, backgroundColor: COLORS.primary, borderRadius: 50}}></Text> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InstantUsersChat;
