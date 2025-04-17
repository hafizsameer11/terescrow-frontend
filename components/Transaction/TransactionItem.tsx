import { StyleSheet, View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { getImageUrl } from "@/utils/helpers";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = width >= 768; // iPads and larger devices

const TransactionItem: React.FC<{
  icon: string;
  heading: string;
  date: string;
  price: string;
  productId: string;
  route: string;
  id?: number;
}> = (props) => {
  const { dark } = useTheme();
  const { navigate } = useNavigation<NavigationProp<any>>();

  const transPressHandler = () => {
    navigate(props.route, { id: props.id?.toString() });
  };

  return (
    <Pressable onPress={transPressHandler} style={[styles.container, isTablet && styles.tabletContainer]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: COLORS.transparentAccount, borderRadius: 999, marginRight: 10 },
          isTablet && styles.tabletIconContainer,
        ]}
      >
        <Image source={{ uri: getImageUrl(props.icon) }} style={[styles.icon, isTablet && styles.tabletIcon]} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.content}>
          <Text style={[styles.heading, dark ? { color: COLORS.white } : { color: COLORS.black }, isTablet && styles.tabletHeading]}>
            {props.heading}
          </Text>
          <View style={styles.details}>
            <Text style={[styles.detailPrice, dark ? { color: COLORS.white } : { color: COLORS.black }, isTablet && styles.tabletDetailPrice]}>
              {props.price}
            </Text>
          </View>
        </View>
        <View style={styles.content}>
          <Text style={[styles.date, isTablet && styles.tabletDate]}>{props.date}</Text>
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
  tabletContainer: {
    padding: 16,
    marginBottom: 12,
    paddingBottom: 20,
    borderRadius: 16,
    borderColor: COLORS.greyscale300,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  tabletIconContainer: {
    width: 60,
    height: 60,
  },
  icon: {
    width: 20,
    height: 20,
  },
  tabletIcon: {
    width: 40,
    height: 40,
  },
  textContainer: {
    flexDirection: "column",
    width: "85%",
  },
  heading: {
    fontWeight: "bold",
    fontSize: isTablet ? 24 : 16, // Increased font size for tablet
    marginBottom: 2,
  },
  tabletHeading: {
    fontSize: 24, // Larger font for tablet
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: isTablet ? 18 : 12, // Increased font size for tablet
    fontWeight: "bold",
    color: COLORS.grayscale400,
  },
  tabletDate: {
    fontSize: 18, // Larger font size for tablet
  },
  detailPrice: {
    fontSize: isTablet ? 24 : 12, 
    fontWeight: "bold",
  }
});
