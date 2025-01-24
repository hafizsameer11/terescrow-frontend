import { View, Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import images from "@/constants/images";
import Swiper from "react-native-swiper";
import { COLORS } from "@/constants";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { useQuery } from "@tanstack/react-query";
import { getAllBanners } from "@/utils/queries/quickActionQueries";
import { getImageUrl } from "@/utils/helpers";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const SwipCard = () => {
  const { token } = useAuth();
  const {
    data: banners,
    isLoading: bannersLoading,
    isError: bannersIsError,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: () => getAllBanners(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (banners) {
      console.log("Banners:", banners);
    }
  }, [banners]);

  const [isTouched, setIsTouched] = useState(true);

  return (
    <Swiper
      style={styles.wrapper}
      showsButtons={false}
      showsPagination={true}
      paginationStyle={styles.pagination}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
      autoplay={isTouched}
      autoplayTimeout={3}
    >
      {!bannersLoading && Array.isArray(banners?.data) && banners.data.length > 0 ? (
        banners.data.map((banner, index) => (
          <View style={styles.slide} key={index}>
            <Image
              source={{ uri: getImageUrl(banner.image) }}
              style={styles.image}
              contentFit="contain"
            />
          </View>
        ))
      ) : (
        <View style={styles.slide}>
          <Image
            source={images.cryptoCard} // Fallback image
            style={styles.image}
            contentFit="contain"
          />
        </View>
      )}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 200,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
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
