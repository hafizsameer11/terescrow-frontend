import { StyleSheet, View, Text, Pressable,Dimensions } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
const { width } = Dimensions.get("window");
const isTablet = width >= 768; // iPads and larger devices
const CardItem: React.FC<{
  card: string;
  text: string;
  onSend: () => void;
}> = (props) => {
  const { dark } = useTheme();
  console.log(props.card)
  return (
    <Pressable style={styles.container} onPress={props.onSend}>
      <Image source={props.card} style={styles.cardImage} />
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.text,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          {props.text}
        </Text>
      </View>
    </Pressable>
  );
};

export default CardItem;

const styles = StyleSheet.create({
  container: {
    width: "52.8%",
    flexDirection: "column",
    marginBottom: 20,
    borderRadius: 12,
  },
  cardImage: {
    width: isTablet?"90%": "90%",
    height:  isTablet?270: 100,
    borderRadius: isTablet?24: 16,
  },
  textContainer: {
    width: "90%",
    marginTop: 10,
  },
  text: {
    flex: 1,
    fontWeight: "bold",
    fontSize:isTablet?24: 12,
    textAlign: "center",
  },
});
