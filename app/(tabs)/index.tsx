import { StyleSheet, View, ScrollView } from "react-native";
import Header from "@/components/index/Header";
import CardSwiper from "@/components/index/CardSwiper";
import { SafeAreaView } from "react-native-safe-area-context";
import QuickAction from "@/components/index/QuickAction";
import RecentContainer from "@/components/index/RecentContainer";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";

export default function HomeScreen() {
  const { dark } = useTheme();
  console.log(dark);
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
        <Header />
      </View>
      <ScrollView style={{ flex: 1 }}>
        {/* Responsive CardSwiper */}
        <View style={{ height: 180 }}>
          <CardSwiper />
        </View>
        {/* Responsive QuickAction */}
        <View style={{ flex: 1 }}>
          <QuickAction />
        </View>
        {/* Responsive RecentContainer */}
        <View style={{ flex: 1 }}>
          <RecentContainer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
