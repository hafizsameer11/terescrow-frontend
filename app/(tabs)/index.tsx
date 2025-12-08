import { StyleSheet, View, FlatList, Text, Dimensions, RefreshControl, ActivityIndicator } from "react-native";
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
} from "@/utils/queries/quickActionQueries";
import { getAllChats } from "@/utils/queries/chatQueries";
import { getWalletTransactions } from "@/utils/queries/accountQueries";
import { router } from "expo-router";
import React from "react";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function HomeScreen() {
  const { dark } = useTheme();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState("All");
  const [refreshing, setRefreshing] = React.useState(false);

  // Map tab to API parameters - memoized to prevent recreation
  const getTransactionParams = React.useMemo(() => {
    switch (activeTab) {
      case "Gift Cards":
        return { type: "giftcard" };
      case "Crypto":
        return { type: "crypto" };
      case "Bill Payments":
        return { type: "bill" };
      default:
        return {}; // "All" - no filter
    }
  }, [activeTab]);


  const {
    data: walletTransactionsData,
    isLoading: transactionsLoading,
    isError: transactionsError,
    refetch: refetchTransactions,
    isFetching: transactionsFetching,
  } = useQuery({
    queryKey: ["walletTransactions", activeTab],
    queryFn: () => getWalletTransactions(token, { ...getTransactionParams, page: 1, limit: 20 }),
    enabled: !!token,
    staleTime: 10000, // Consider data fresh for 10 seconds to prevent unnecessary refetches when switching tabs quickly
    refetchOnWindowFocus: false, // Prevent refetch when window regains focus
  });

  // Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch all queries
      await Promise.all([
        refetchTransactions(),
      ]);
    } catch (error) {
      console.log("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchTransactions]);

  // Get transactions from API response - memoized to prevent unnecessary recalculations
  const transactions = React.useMemo(() => {
    return walletTransactionsData?.data?.transactions || [];
  }, [walletTransactionsData]);

  // Hardcoded quick actions matching the design
  const quickActions = React.useMemo(() => [
    {
      id: '1',
      title: 'Trade giftcards',
      description: 'Buy and sell your gift cards with ease',
      icon: icons.gift,
      onPress: () => {
        router.push('/buygiftcards');
      },
    },
    {
      id: '2',
      title: 'Trade Crypto',
      description: 'Buy, sell and send any crypto asset with ease',
      icon: icons.graph,
      onPress: () => {
        router.push({
          pathname: '/selectasset',
          params: { fromTradeCrypto: 'true' }
        });
      },
    },
    {
      id: '3',
      title: 'Bill Payments',
      description: 'Buy airtimes, mobile date, Subscriptions and more',
      icon: icons.payment,
      onPress: () => {
        router.push('/billpayments');
      },
    },
    {
      id: '4',
      title: 'Earn',
      description: 'Earn for life from our crowd Ambassador program',
      icon: icons.people,
      onPress: () => {
        router.push('/referrals');
      },
    },
  ], []);

  const renderHeader = React.useCallback(() => (
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
        <FlatList
          data={quickActions}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <QuickBoxItem
              icon={item.icon}
              title={item.title}
              description={item.description}
              onClick={item.onPress}
            />
          )}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          numColumns={2}
        />
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
  ), [activeTab, dark, quickActions]);


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
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        style={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          // Format date
          const transactionDate = new Date(item.createdAt);
          const formattedDate = transactionDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          
          // Format amount based on currency
          const formattedAmount = item.currency === 'NGN' 
            ? `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`
            : `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;

          return (
            <ChatItem
              id={item.id.toString()}
              icon={icons.chat}
              heading={item.type || 'Transaction'}
              text={`${item.type} transaction`}
              date={formattedDate}
              productId={item.id.toString()}
              price={formattedAmount}
              status={item.status}
            />
          );
        }}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          transactionsLoading ? (
            <View style={styles.emptyLoadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[styles.loadingText, { color: dark ? COLORS.white : COLORS.black }]}>
                Loading transactions...
              </Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: dark ? COLORS.white : COLORS.black }]}>
                No transactions found
              </Text>
              <Text style={[styles.emptySubtext, { color: dark ? COLORS.white : COLORS.black }]}>
                {activeTab === "All" 
                  ? "You don't have any transactions yet"
                  : `You don't have any ${activeTab.toLowerCase()} transactions yet`}
              </Text>
            </View>
          ) : null
        }
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyLoadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
});
