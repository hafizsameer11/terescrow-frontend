import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/constants";
const CryptoCardCom: React.FC<{ card: string }> = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Image
          source={props.card}
          style={styles.cardImage}
          contentFit="contain"
        />
      </View>
    </View>
  );
};

export default CryptoCardCom;

const styles = StyleSheet.create({
  container: {
    borderRadius: 33,
    marginHorizontal: 16,
    marginTop: 25 ,
    backgroundColor: COLORS.grayscale200,
  },
  cardContainer: {
    height: 120,
    marginVertical: 35,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
});
