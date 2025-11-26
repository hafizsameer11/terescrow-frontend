import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { COLORS, icons, images } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";
import { getImageUrl } from "@/utils/helpers";

const { width } = Dimensions.get('window');
const isTablet = width >= 768; // iPads generally have width 768+

const SupportChatItem: React.FC<{
  icon?: string;
  id?: string;
  heading: string;
  text: string;
  date: string;
  status?: string;
  profileImage?: string;
}> = (props) => {
  const { dark } = useTheme();
  const { navigate } = useNavigation<NavigationProp<any>>();

  return (
    <TouchableOpacity
      onPress={() => {
        navigate("supportchat", { chatId: props.id?.toString() });
      }}
    >
      <View
        style={[
          styles.container,
        //   dark
        //     ? { backgroundColor: COLORS.transparentAccount }
        //     : { backgroundColor: COLORS.grayscale100 },
        ]}
      >
        <View style={styles.iconContainer}>
          <Image
            source={
              props.icon && props.icon !== icons.chat
                ? { uri: getImageUrl(props.icon) }
                : props.profileImage
                  ? { uri: getImageUrl(props.profileImage) }
                  : icons.chat
            }
            style={[
              styles.icon,
              props.profileImage && styles.profileIcon,
            ]}
            contentFit={props.profileImage ? "cover" : "contain"}
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
                  styles.statusText,
                  {
                    color:
                      props.status === "successful" || props.status === "completed"
                        ? "#46BE84"
                        : props.status === "pending" || props.status === "processing"
                          ? "#FFA500"
                          : "#FFA500",
                  },
                ]}
              >
                {props.status === "successful" || props.status === "completed"
                  ? "Completed"
                  : props.status === "pending" || props.status === "processing"
                    ? "Processing"
                    : "Processing"}
              </Text>
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
                      props.status === "successful" || props.status === "completed"
                        ? "green"
                        : props.status === "declined"
                          ? "red"
                          : props.status == "unsucessful"
                            ? "black"
                            : "yellow",
                    color: COLORS.white,
                  },
                ]}
              >
                {/* Status indicator */}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SupportChatItem;

const styles = StyleSheet.create({
  container: {
    padding: isTablet ? 18 : 12,
    marginBottom: isTablet ? 15 : 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: isTablet ? 15 : 10,
    height: isTablet ? 15 : 10,
    marginLeft: 5,
    textAlign: "center",
    borderRadius: 999,
    justifyContent: "center",
    fontSize: isTablet ? 12 : 10,
  },
  iconContainer: {
    width: isTablet ? 60 : 40,
    height: isTablet ? 60 : 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderRadius: 50,
    borderColor: COLORS.green,
    marginRight: isTablet ? 15 : 10,
  },
  icon: {
    width: isTablet ? 40 : 20,
    height: isTablet ? 40 : 20,
  },
  profileIcon: {
    borderRadius: isTablet ? 20 : 10,
  },
  textContainer: {
    flexDirection: "column",
    width: "85%",
  },
  heading: {
    fontWeight: "bold",
    fontSize: isTablet ? 22 : 14,
    marginBottom: isTablet ? 5 : 2,
  },
  text: {
    fontSize: isTablet ? 17 : 10,
    color: COLORS.greyscale600,
  },
  contentOne: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: isTablet ? 10 : 5,
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
    fontSize: isTablet ? 15 : 9,
    color: COLORS.greyscale600,
    marginRight: isTablet ? 10 : 0
  },
  statusText: {
    fontSize: isTablet ? 17 : 10,
    fontFamily: "Bold",
  },
});
