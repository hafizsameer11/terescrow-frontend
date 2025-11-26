import { StyleSheet, View, FlatList, Text, Dimensions } from "react-native";
import Header from "@/components/index/Header";
import CardSwiper from "@/components/index/CardSwiper";
import BalanceCard from "@/components/index/BalanceCard";
import QuickActionIcons from "@/components/index/QuickActionIcons";
import TransactionTabs from "@/components/index/TransactionTabs";
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
import React from "react";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function HomeScreen() {
  const { dark } = useTheme();
  const { token } = useAuth();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [activeTab, setActiveTab] = React.useState("Gift Cards");

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
    refetchInterval: 1000,
  });

  // Filter chats based on active tab (UI only, no API changes)
  const getFilteredChats = () => {
    if (!chatData?.data) return [];
    
    if (activeTab === "All") {
      return chatData.data.slice(0, 5);
    } else if (activeTab === "Gift Cards") {
      return chatData.data
        .filter((chat) => chat.department?.Type === "giftcard" || chat.department?.title?.includes("Gift Card"))
        .slice(0, 5);
    } else if (activeTab === "Crypto") {
      return chatData.data
        .filter((chat) => chat.department?.Type === "crypto" || chat.department?.title?.includes("Crypto"))
        .slice(0, 5);
    } else if (activeTab === "Bill Payments") {
      return chatData.data
        .filter((chat) => chat.department?.Type === "bill" || chat.department?.title?.includes("Bill"))
        .slice(0, 5);
    }
    return chatData.data.slice(0, 5);
  };

  const filteredChatData = getFilteredChats();

  const handleClickDepartment = (item: IDepartmentResponse["data"][number]) => {
    const route = item.title.includes("Gift Card")
      ? "giftcardcategories"
      : "cryptocategories";
    navigate(route, { departmentId: item.id.toString(),departmentTitle: item.title,departmentType:(item as any).Type });
  };

  const renderHeader = () => (
    <>
      <Header />
      <BalanceCard />
      <QuickActionIcons />
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

      <View style={{ marginHorizontal: -5, marginTop: 20 }}>
        <CardSwiper />
      </View>

      {/* Recent Transactions Section */}
      <View style={styles.recentTransactionsSection}>
        <Text
          style={[
            styles.recentTransactionsTitle,
            { color: dark ? COLORS.white : "#121212" },
          ]}
        >
          Recent Transactions
        </Text>
        <TransactionTabs activeTab={activeTab} onTabChange={setActiveTab} />
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
        data={filteredChatData || []}
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
    fontSize: isTablet ? 20 : 16,
    marginBottom: isTablet ? 20 : 16,
  },
  recentTransactionsSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  recentTransactionsTitle: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: "400",
    color: "#121212",
    marginBottom: 16,
  },
});
