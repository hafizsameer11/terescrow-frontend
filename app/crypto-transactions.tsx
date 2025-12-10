import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Pressable } from "react-native";
import SearchInputField from "@/components/SearchInputField";
import { useTheme } from "@/contexts/themeContext";
import { COLORS, icons } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "expo-router";
import { getCryptoTransactions } from "@/utils/queries/accountQueries";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const CryptoTransactions = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch crypto transactions based on active tab
  const {
    data: cryptoTransactionsData,
    isLoading: cryptoTransactionsLoading,
    refetch: refetchCryptoTransactions,
  } = useQuery({
    queryKey: ["cryptoTransactions", activeTab],
    queryFn: () => {
      const type = activeTab === "All" ? undefined : activeTab.toUpperCase();
      return getCryptoTransactions(token, { type, limit: 100, offset: 0 });
    },
    enabled: !!token,
    staleTime: 10000,
  });

  // Process and filter transactions
  const processedTransactions = useMemo(() => {
    let transactions = cryptoTransactionsData?.data?.transactions || [];

    // Filter by search term
    if (searchTerm) {
      transactions = transactions.filter((tx: any) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          tx.cryptocurrencyType?.toLowerCase().includes(searchLower) ||
          tx.currency?.toLowerCase().includes(searchLower) ||
          tx.transactionId?.toLowerCase().includes(searchLower) ||
          tx.tradeType?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort by date (newest first)
    return transactions.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [cryptoTransactionsData, searchTerm]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchCryptoTransactions();
    } catch (error) {
      console.log("Error refreshing transactions:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCryptoTransactions]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Get route for transaction detail based on type
  const getTransactionRoute = (transactionType: string): string => {
    const txType = transactionType.toUpperCase();
    if (txType === "BUY" || txType.includes("BUY")) return "/cryptobought";
    if (txType === "SELL" || txType.includes("SELL")) return "/cryptosold";
    if (txType === "SWAP" || txType.includes("SWAP")) return "/swapsuccess";
    if (txType === "SEND" || txType.includes("SEND")) return "/cryptosold";
    if (txType === "RECEIVE" || txType.includes("RECEIVE")) return "/cryptobought";
    return "/cryptobought";
  };

  // Handle transaction press
  const handleTransactionPress = (item: any) => {
    const route = getTransactionRoute(item.transactionType || item.type || "");
    const transactionId = item.transactionId || item.id;
    const transactionType = item.transactionType || item.type || activeTab;

    if (transactionId) {
      router.push({
        pathname: route as any,
        params: {
          id: String(transactionId),
          type: transactionType,
        },
      });
    }
  };

  // Tabs for crypto transactions
  const tabs = ["All", "Buy", "Sell", "Send", "Receive"];

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: any }) => {
    const cryptoName = item.cryptocurrencyType || item.currency || "Crypto";
    const date = formatDate(item.createdAt);
    // Format crypto amount - API returns string like "10USDT" or "0.001BTC"
    const cryptoAmount = item.amount || "0";
    // Format USD amount - API returns string like "$10" or "$2,400"
    const usdAmount = item.amountUsd || "$0";
    
    // Get icon - use symbol if available, otherwise default
    const icon = item.symbol || icons.gift;

    return (
      <TouchableOpacity
        onPress={() => handleTransactionPress(item)}
        style={[
          styles.transactionItem,
          dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
        ]}
      >
        <View style={styles.transactionLeft}>
          <View style={[styles.iconContainer, { backgroundColor: dark ? COLORS.dark2 : COLORS.grayscale100 }]}>
            {typeof icon === "string" && icon.includes("http") ? (
              <Image source={{ uri: icon }} style={styles.iconImage} contentFit="contain" />
            ) : (
              <Text style={styles.iconText}>₿</Text>
            )}
          </View>
          <View style={styles.transactionInfo}>
            <Text style={[styles.cryptoName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {cryptoName}
            </Text>
            <Text style={[styles.transactionDate, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              {date}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.cryptoAmount, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            {cryptoAmount}
          </Text>
          <Text style={[styles.usdAmount, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            {usdAmount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
      edges={['top']}
    >
      {/* Custom Header - matches photo design */}
      <View style={[styles.header, dark ? { backgroundColor: COLORS.white } : { backgroundColor: COLORS.white }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Image
            source={icons.arrowBack}
            style={[
              styles.backIcon,
              dark ? { tintColor: COLORS.white } : { tintColor: COLORS.black },
            ]}
            contentFit="contain"
          />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text
            style={[
              styles.headerTitle,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            Crypto Txns
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                isActive && styles.activeTab,
                dark && isActive && { backgroundColor: COLORS.black },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive
                    ? { color: COLORS.white, fontWeight: "600" }
                    : { color: dark ? COLORS.white : COLORS.black },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchInputField searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </View>

      {/* Transaction List */}
      {cryptoTransactionsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Loading transactions...
          </Text>
        </View>
      ) : processedTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            No transactions found
          </Text>
        </View>
      ) : (
        <FlatList
          data={processedTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => String(item.transactionId || item.id || Math.random())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.grayscale100, // Light gray background as per photo
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.black, // Black chevron as per photo
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginLeft: -40, // Offset to center the title
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black, // Bold black text as per photo
  },
  headerRight: {
    width: 40, // Balance the back button width
  },
  tabsContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale100,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: COLORS.black,
  },
  tabText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: "400",
  },
  searchContainer: {
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyscale300,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconImage: {
    width: 30,
    height: 30,
  },
  iconText: {
    fontSize: 20,
    color: COLORS.primary,
  },
  transactionInfo: {
    flex: 1,
  },
  cryptoName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: "400",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  cryptoAmount: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  usdAmount: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: "400",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CryptoTransactions;

