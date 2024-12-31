import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { getImageUrl } from "@/utils/helpers";
const ChatItem: React.FC<{
  icon: string;
  id?: string;
  heading: string;
  text: string;
  date: string;
  price: string;
  productId: string;
  status?: string;
}> = (props) => {
  const { dark } = useTheme();
  const { navigate, goBack } = useNavigation<NavigationProp<any>>();
  return (
    <TouchableOpacity
      onPress={() => {
        navigate("chatwithagent", { chatId: props.id?.toString() });
      }}
    >
      <View
        style={[
          styles.container,
          dark
            ? { backgroundColor: COLORS.transparentAccount }
            : { backgroundColor: COLORS.grayscale100 },
        ]}
      >
        <View style={styles.iconContainer}>
          <Image
            source={
              props.icon !== icons.chat
                ? { uri: getImageUrl(props.icon) } // Remote image
                : props.icon // Local asset
            }
            style={styles.icon}
          />        </View>
        <View style={styles.textContainer}>
          <View style={styles.contentOne}>
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
                  styles.detailPriceProduct,
                  dark ? { color: COLORS.white } : { color: COLORS.black },
                ]}
              >
                {props.price}
              </Text>
              <Text
                style={[
                  dark ? { color: COLORS.white } : { color: COLORS.black },
                ]}
              ></Text>

            </View>
          </View>
          <View style={styles.contentTwo}>
            <View style={{ flex: 0.8 }}>
              <Text
                style={[
                  styles.text,
                  dark ? { color: COLORS.white } : { color: COLORS.black },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {props.text}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={[styles.date, { color: COLORS.black }]}>
                {props.date}
              </Text>
              <Text
                style={[
                  styles.circle,
                  {
                    backgroundColor:
                      props.status === "successful"
                        ? "green"
                        : props.status === "declined"
                          ? "red"
                          : "yellow", // Default to yellow for "pending"
                    color: COLORS.white,
                  },
                ]}
              >
                {/* {props.productId} */}
              </Text>

            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    // marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
  },
  circle: {
    width: 10,
    height: 10,
    marginLeft: 5,
    textAlign: "center",
    borderRadius: 999,
    justifyContent: "center",
    fontSize: 10,

  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderRadius: 50,
    borderColor: COLORS.green,
    marginRight: 10,
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
    fontSize: 14,
    marginBottom: 2,
  },
  text: {
    fontSize: 10,
    color: COLORS.greyscale600,
  },
  contentOne: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  contentTwo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 9,
    color: COLORS.greyscale600,
  },
  detailPriceProduct: { fontSize: 10, fontFamily: "Bold" },
});
