import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert } from "react-native";
import { Image } from "expo-image";
import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { useRouter } from "expo-router";
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
  route?: string; // Optional route for navigation
}> = (props) => {
  const { dark } = useTheme();
  const router = useRouter();
  console.log("chat status", props.status)
  
  const handlePress = () => {
    // Always prioritize transaction route if provided
    if (props.route && props.route.trim() !== '') {
      // If route is provided, navigate to that route with transaction ID
      const transactionId = props.id?.toString() || props.productId?.toString();
      
      // Ensure we have a valid transaction ID
      if (!transactionId || transactionId.trim() === '') {
        console.error('ChatItem: Missing or invalid transaction ID for route:', { route: props.route, id: transactionId, props });
        Alert.alert('Error', 'Transaction ID is missing. Please try again.');
        return;
      }

      // Ensure route starts with / for proper navigation
      let routePath = props.route.startsWith('/') ? props.route : `/${props.route}`;

      // Prevent navigation to transaction history pages - only allow detail pages
      const historyRoutes = ['/transactions', '/transactionhistory', '/(tabs)/transactions'];
      const isHistoryRoute = historyRoutes.some(historyRoute => 
        routePath.toLowerCase().includes(historyRoute.toLowerCase())
      );
      
      if (isHistoryRoute) {
        console.error('ChatItem: Blocked navigation to transaction history page. Route:', routePath);
        Alert.alert('Error', 'Cannot navigate to transaction history. Please contact support.');
        return;
      }

      // Log navigation for debugging
      console.log('ChatItem: Navigating to transaction detail:', { route: routePath, id: transactionId, originalRoute: props.route });

      // Navigate to transaction detail page with ID
      // Using push ensures we can navigate back, but the detail page will show details when ID is present
      try {
        // Parse route to extract query parameters if present
        const [pathname, queryString] = routePath.split('?');
        const params: any = { id: transactionId };
        
        // Parse query string to extract type parameter
        if (queryString) {
          const queryParams = queryString.split('&');
          for (const param of queryParams) {
            const [key, value] = param.split('=');
            if (key === 'type' && value) {
              params.type = decodeURIComponent(value);
            }
          }
        }
        
        router.push({
          pathname: pathname as any,
          params: params
        });
      } catch (error) {
        console.error('ChatItem: Navigation error:', error);
        Alert.alert('Navigation Error', 'Failed to navigate to transaction details. Please try again.');
      }
    } else {
      // Default behavior: navigate to chat (only if no route provided)
      console.log('ChatItem: No route provided, navigating to chat');
      router.push({
        pathname: "chatwithagent" as any,
        params: { chatId: props.id?.toString() }
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
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
