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
import { getGiftCardOrders, getTransactionGroup } from "@/utils/queries/accountQueries";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const GiftCardTransactions = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("Buy");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch gift card orders for Buy tab
  const {
    data: giftCardOrdersData,
    isLoading: giftCardOrdersLoading,
    refetch: refetchGiftCardOrders,
  } = useQuery({
    queryKey: ["giftCardOrders", "Buy"],
    queryFn: () => getGiftCardOrders(token, { page: 1, limit: 100 }),
    enabled: !!token && activeTab === "Buy",
    staleTime: 10000,
  });

  // Fetch transaction group for Sell tab
  const {
    data: transactionGroupData,
    isLoading: transactionGroupLoading,
    refetch: refetchTransactionGroup,
    isError: transactionGroupError,
    error: transactionGroupErrorData,
  } = useQuery({
    queryKey: ["transactionGroup", "Sell"],
    queryFn: () => getTransactionGroup(token),
    enabled: !!token && activeTab === "Sell",
    staleTime: 10000,
    retry: false,
  });

  // Process and filter transactions based on active tab
  const processedTransactions = useMemo(() => {
    let transactions: any[] = [];

    if (activeTab === "Buy") {
      // For Buy tab, use gift card orders
      transactions = giftCardOrdersData?.data?.orders || [];
    } else if (activeTab === "Sell") {
      // For Sell tab, use transaction group data
      // Check if error message indicates no data found
      const errorMessage = (transactionGroupErrorData as any)?.message;
      if (errorMessage === "TransactionGroupData not found" || transactionGroupError) {
        // Return empty array if data not found
        transactions = [];
      } else {
        // Use the data array if available
        transactions = transactionGroupData?.data || [];
      }
    }

    // Filter by search term
    if (searchTerm) {
      transactions = transactions.filter((item: any) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.productName?.toLowerCase().includes(searchLower) ||
          item.brandName?.toLowerCase().includes(searchLower) ||
          item.orderId?.toLowerCase().includes(searchLower) ||
          item.transactionId?.toLowerCase().includes(searchLower) ||
          item.id?.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort by date (newest first)
    return transactions.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();
      return dateB - dateA;
    });
  }, [giftCardOrdersData, transactionGroupData, transactionGroupError, transactionGroupErrorData, activeTab, searchTerm]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === "Buy") {
        await refetchGiftCardOrders();
      } else {
        await refetchTransactionGroup();
      }
    } catch (error) {
      console.log("Error refreshing transactions:", error);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, refetchGiftCardOrders, refetchTransactionGroup]);

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

  // Handle transaction press - navigate to gift card detail
  const handleTransactionPress = (item: any) => {
    const transactionId = item.orderId || item.id || item.transactionId;
    const transactionType = "GIFT_CARD";

    if (transactionId) {
      router.push({
        pathname: "/giftcardsold" as any,
        params: {
          id: String(transactionId),
          type: transactionType,
        },
      });
    }
  };

  // Tabs for gift card transactions
  const tabs = ["Buy", "Sell"];

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: any }) => {
    // Handle both Buy (gift card orders) and Sell (transaction group) data structures
    const productName = item.productName || item.brandName || item.name || "Gift Card";
    const date = formatDate(item.createdAt || item.date);
    const currency = item.currencyCode || item.currency || "USD";
    const amount = item.totalAmount || item.faceValue || item.amount || 0;
    const formattedAmount = currency === "NGN"
      ? `₦${typeof amount === 'number' ? amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount}`
      : `$${typeof amount === 'number' ? amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount}`;

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
            {item.productImage ? (
              <Image source={{ uri: item.productImage }} style={styles.iconImage} contentFit="contain" />
            ) : (
              <Text style={styles.iconText}>🎁</Text>
            )}
          </View>
          <View style={styles.transactionInfo}>
            <Text style={[styles.productName, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
              {productName}
            </Text>
            <Text style={[styles.transactionDate, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              {date}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.amount, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            {formattedAmount}
          </Text>
          <Text style={[styles.status, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            {item.status || "Pending"}
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
            Gift Card Txns
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Segmented Control Tabs - matches photo design */}
      <View style={styles.segmentedControlContainer}>
        <View style={[styles.segmentedControl, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.grayscale100 }]}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segment,
                  isActive && styles.activeSegment,
                  dark && isActive && { backgroundColor: COLORS.black },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isActive
                      ? { color: COLORS.white, fontWeight: "600" }
                      : { color: dark ? COLORS.greyscale500 : COLORS.greyscale600 },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchInputField searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </View>

      {/* Transaction List */}
      {(activeTab === "Buy" ? giftCardOrdersLoading : transactionGroupLoading) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Loading transactions...
          </Text>
        </View>
      ) : processedTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            {activeTab === "Sell" && (transactionGroupError || (transactionGroupErrorData as any)?.message === "TransactionGroupData not found")
              ? "No sell transactions found"
              : searchTerm
              ? "No transactions match your search"
              : activeTab === "Buy"
              ? "No buy transactions found"
              : "No sell transactions found"}
          </Text>
          {!searchTerm && activeTab === "Sell" && (
            <Text style={[styles.emptySubtext, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
              You haven't sold any gift cards yet
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={processedTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => String(item.orderId || item.id || item.transactionId || Math.random())}
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
  segmentedControlContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: COLORS.grayscale100,
    borderRadius: 8,
    padding: 3,
    gap: 0,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  activeSegment: {
    backgroundColor: COLORS.black, // Black background for active segment
  },
  segmentText: {
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
  },
  transactionInfo: {
    flex: 1,
  },
  productName: {
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
  amount: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  status: {
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
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default GiftCardTransactions;

