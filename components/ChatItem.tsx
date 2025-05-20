import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { getImageUrl } from "@/utils/helpers";

const { width } = Dimensions.get('window');
const isTablet = width >= 768; // iPads generally have width 768+

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
  const { navigate } = useNavigation<NavigationProp<any>>();
  console.log("chat status", props.status)
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
          />
        </View>
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
            <View style={{ flex: isTablet ? 1 : 0.8 }}>
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
                          : props.status == "unsucessful"
                            ? "black" : "yellow", // Default to yellow for "pending"
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
    padding: isTablet ? 18 : 12, // Increased padding for tablets
    marginBottom: isTablet ? 15 : 10, // Increased margin for tablets
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
  },
  circle: {
    width: isTablet ? 15 : 10, // Increased circle size for tablets
    height: isTablet ? 15 : 10, // Increased circle size for tablets
    marginLeft: 5,
    textAlign: "center",
    borderRadius: 999,
    justifyContent: "center",
    fontSize: isTablet ? 12 : 10, // Increased font size for tablets
  },
  iconContainer: {
    width: isTablet ? 60 : 40, // Increased width for tablet
    height: isTablet ? 60 : 40, // Increased height for tablet
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderRadius: 50,
    borderColor: COLORS.green,
    marginRight: isTablet ? 15 : 10, // Increased margin for tablet
  },
  icon: {
    width: isTablet ? 40 : 20, // Increased icon size for tablet
    height: isTablet ? 40 : 20, // Increased icon size for tablet
  },
  textContainer: {
    flexDirection: "column",
    width: "85%",
  },
  heading: {
    fontWeight: "bold",
    fontSize: isTablet ? 22 : 14, // Increased font size for tablet
    marginBottom: isTablet ? 5 : 2, // Increased margin for tablet
  },
  text: {
    fontSize: isTablet ? 17 : 10, // Increased font size for tablet
    color: COLORS.greyscale600,
  },
  contentOne: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: isTablet ? 10 : 5, // Increased margin for tablet
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
    fontSize: isTablet ? 15 : 9, // Increased font size for tablet
    color: COLORS.greyscale600,
    marginRight: isTablet ? 10 : 0
  },
  detailPriceProduct: {
    fontSize: isTablet ? 17 : 10, // Increased font size for tablet
    fontFamily: "Bold",
  },
});
