import { View, Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import images from "@/constants/images";
import Swiper from "react-native-swiper";
import { COLORS } from "@/constants";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const SwipCard = () => {
  return (
    <Swiper
      style={styles.wrapper}
      showsButtons={false}
      showsPagination={true}
      paginationStyle={styles.pagination}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
    >
      <View style={styles.slide}>
        <Image
          source={images.buySellCard}
          style={styles.image}
          contentFit="contain"
        />
      </View>
      <View style={styles.slide}>
        <Image
          source={images.cryptoCard}
          contentFit="contain"
          style={styles.image}
        />
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    bottom: screenWidth * -0.0525,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#70D4A3",
    marginHorizontal: 5,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: COLORS.green,
    marginHorizontal: 5,
  },
});

export default SwipCard;