import { StyleSheet, View, FlatList, Text, Dimensions, Platform } from "react-native";
import Header from "@/components/index/Header";
import CardSwiper from "@/components/index/CardSwiper";
import { SafeAreaView } from "react-native-safe-area-context";
import QuickBoxItem from "@/components/index/QuickBoxItem";
import ChatItem from "@/components/ChatItem";
import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";
import {
  getAllBanners,
  getDepartments,
  IDepartmentResponse,
} from "@/utils/queries/quickActionQueries";
import { getAllChats } from "@/utils/queries/chatQueries";
import { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useField } from "formik";
import { useEffect } from "react";

const { width } = Dimensions.get('window');
const isTablet = width >= 768; // iPads generally have width 768+
export default function HomeScreen() {
  const { dark } = useTheme();
  const { token } = useAuth();
  const { navigate } = useNavigation<NavigationProp<any>>();

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    isError: departmentsIsError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getDepartments(token),
    enabled: !!token,
  });
  const {
    data: chatData,
    isLoading: chatLoading,
    isError: chatisError,
  } = useQuery({
    queryKey: ["allchats"],
    queryFn: () => getAllChats(token),
    enabled: !!token,
    refetchInterval: 1000, // Refetch every second
  });

  // Limit to 5 chats
  const limitedChatData = chatData?.data?.slice(0, 5) || [];

  const handleClickDepartment = (item: IDepartmentResponse["data"][number]) => {
    const route = item.title.includes("Gift Card")
      ? "giftcardcategories"
      : "cryptocategories";

    navigate(route, { departmentId: item.id.toString(),departmentTitle: item.title });
  };

  const renderHeader = () => (
    <>
      <Header />
      <View style={{ marginHorizontal: -5 }}>
        <CardSwiper />
      </View>
      <View style={styles.quickContainer}>
        <Text
          style={[
            styles.quickHeading,
            { color: dark ? COLORS.white : COLORS.black },
          ]}
        >
          Quick Actions
        </Text>
        {departmentsData?.data && (
          <FlatList
            data={departmentsData.data}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <QuickBoxItem
                icon={item?.icon || icons.gift}
                title={item?.title}
                description={item.description}
                onClick={() => handleClickDepartment(item)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            numColumns={2}
          />
        )}
      </View>

      <View style={styles.recentContainer}>
        <Text style={styles.borderLine}></Text>
        <Text
          style={[
            styles.recentHeading,
            { color: dark ? COLORS.greyscale500 : COLORS.grayscale700 },
          ]}
        >
          Recents
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <FlatList
        data={limitedChatData || []}
        keyExtractor={(item) => item.id.toString()}
        style={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <ChatItem
            id={item.id.toString()}
            icon={item?.department?.icon || icons.chat}
            heading={item?.department?.title}
            text={item.recentMessage}
            date={new Date(item.recentMessageTimestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            productId={item.messagesCount.toString()}
            price={`$${item.transaction?.amount?.toString() || "0"} - ₦${item.transaction?.amountNaira?.toString() || "0"}`}
            status={item.chatStatus}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  quickContainer: {
    marginTop: 20,
  },
  quickHeading: {
    fontWeight: "bold",
    fontSize: isTablet ? 20 : 16, // Increased font size for tablet
    marginBottom: isTablet ? 20 : 16, // Increased margin for tablet
  },
  recentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  recentHeading: {
    textAlign: "right",
    fontWeight: "bold",
    fontSize: isTablet ? 18 : 12, // Increased font size for tablet
    width: "auto",
  },
  borderLine: {
    flex: 1,
    borderBottomWidth: 1,
    marginBottom: 12,
    marginEnd: 8,
    borderColor: COLORS.grayscale200,
  },
});
