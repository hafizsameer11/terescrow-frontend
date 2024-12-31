import { StyleSheet, View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/constants";
import { Route, useNavigation, useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { NavigationProp } from "@react-navigation/native";
import { getImageUrl } from "@/utils/helpers";
const TransactionItem: React.FC<{
  icon: string;
  heading: string;
  date: string;
  price: string;
  productId: string;
  route: string;
  id?: number
}> = (props) => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();

  const transPressHandler = () => {
    navigate(props.route, { id: props.id?.toString() });
  };
  return (
    <Pressable onPress={transPressHandler} style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: COLORS.transparentAccount, borderRadius: 999, marginRight: 10 }]}>
        <Image source={{ uri: getImageUrl(props.icon) }} style={styles.icon} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.contemt}>
          <Text
            style={[
              styles.heading,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {props.heading}
          </Text>
          <View style={styles.details}>
            <Text
              style={[
                styles.detailPrice,
                dark ? { color: COLORS.white } : { color: COLORS.black },
              ]}
            >
              {props.price}
            </Text>
          </View>
        </View>
        <View style={styles.contemt}>
          <View>
            <Text style={styles.date}>{props.date}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* <Text style={styles.detailProduct}>{props.productId}</Text> */}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default TransactionItem;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 16,
    borderColor: COLORS.greyscale300,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  icon: {
    width: 20,
    height: 20,
  },
  textContainer: {
    flexDirection: "column",
    width: "85%",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  text: {
    fontSize: 10,
    color: COLORS.greyscale600,
  },
  contemt: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.grayscale400,
  },
  detailPrice: {
    fontSize: 12,
    fontWeight: "bold",
  },
  detailProduct: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.grayscale400,
  },
});
