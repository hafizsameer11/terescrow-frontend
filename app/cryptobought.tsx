import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, Dimensions, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import NavigateBack from "@/components/NavigateBack";
import SearchInputField from "@/components/SearchInputField";
import TransactionDetail from "@/components/TransactionDetail";
import { useTheme } from "@/contexts/themeContext";
import { COLORS, icons } from "@/constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";
import { getCryptoTransactionById, getCryptoTransactions } from "@/utils/queries/accountQueries";
import { showTopToast } from "@/utils/helpers";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const CryptoBought = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  // Ensure transactionId is always a string and properly extracted
  const transactionId = useMemo(() => {
    const id = params.id?.toString() || params.id || '';
    return id.trim();
  }, [params.id]);

  // If transactionId is provided, fetch single transaction detail
  const {
    data: transactionDetail,
    isLoading: detailLoading,
    isError: detailError,
    error: detailErrorData,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["cryptoTransaction", transactionId],
    queryFn: () => getCryptoTransactionById(token, transactionId!),
    enabled: !!token && !!transactionId,
    retry: false,
  });

  // Handle transaction not found error
  useEffect(() => {
    if (transactionId && !detailLoading) {
      // Check if transaction was not found (error or no data)
      const hasError = detailError || !transactionDetail?.data;
      if (hasError) {
        const errorMessage = (detailErrorData as any)?.message || "Transaction not found";
        showTopToast({
          type: 'error',
          text1: 'Transaction Not Found',
          text2: errorMessage,
        });
        // Navigate back after a short delay
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    }
  }, [transactionId, detailLoading, detailError, transactionDetail, detailErrorData, router]);

  // If no transactionId, fetch list of BUY transactions
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["cryptoTransactions", "BUY"],
    queryFn: () => getCryptoTransactions(token, { type: "BUY", limit: 100, offset: 0 }),
    enabled: !!token && !transactionId,
  });

  // Process and filter transactions (only API data, no dummy data)
  const processedTransactions = useMemo(() => {
    if (!transactionsData?.data?.transactions) return [];
    
    let transactions = transactionsData.data.transactions;

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
  }, [transactionsData, searchTerm]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (transactionId) {
        await refetchDetail();
      } else {
        await refetchTransactions();
      }
    } catch (error) {
      console.log("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [transactionId, refetchDetail, refetchTransactions]);

  // Format date to match photo: "11 Nov. 2024"
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

  // Handle transaction press
  const handleTransactionPress = (item: any) => {
    const transactionId = item.transactionId || item.id;
    const transactionType = item.transactionType || item.type || "BUY";

    if (transactionId) {
      router.push({
        pathname: "/cryptobought" as any,
        params: {
          id: String(transactionId),
          type: transactionType,
        },
      });
    }
  };

  // Render transaction item matching photo design
  const renderTransactionItem = ({ item }: { item: any }) => {
    const cryptoName = item.cryptocurrencyType || item.currency || "Crypto";
    const date = formatDate(item.createdAt);
    // Format crypto amount - API returns string like "10USDT" or "0.001BTC"
    const cryptoAmount = item.amount || "0";
    // Format USD amount - API returns string like "$10" or "$2,400"
    const usdAmount = item.amountUsd || "$0";
    
    // Get icon - use symbol if available, otherwise default
    const icon = item.symbol || icons.crypto || icons.gift;

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

  // If transactionId is provided, show detail view
  if (transactionId) {
    if (detailLoading) {
      return (
        <SafeAreaView
          style={[
            { flex: 1, justifyContent: "center", alignItems: "center" },
            dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
          ]}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: dark ? COLORS.white : COLORS.black }}>
            Loading transaction details...
          </Text>
        </SafeAreaView>
      );
    }

    if (transactionDetail?.data) {
      return (
        <SafeAreaView
          style={[
            { flex: 1 },
            dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
          ]}
        >
          <NavigateBack text="Transaction Details" />
          <TransactionDetail transaction={transactionDetail.data} />
        </SafeAreaView>
      );
    }

    // If error or no data, show loading while toast is displayed and navigation happens
    if (detailError || !transactionDetail?.data) {
      return (
        <SafeAreaView
          style={[
            { flex: 1, justifyContent: "center", alignItems: "center" },
            dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
          ]}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: dark ? COLORS.white : COLORS.black }}>
            Transaction not found. Redirecting...
          </Text>
        </SafeAreaView>
      );
    }
  }

  // List view - styled to match photo
  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
    >
      {/* Header - removed NavigateBack as requested */}
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchInputField searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </View>

      {/* Transaction List */}
      {transactionsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Loading transactions...
          </Text>
        </View>
      ) : processedTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            {searchTerm ? "No transactions found matching your search" : "No buy transactions found"}
          </Text>
          <Text style={[styles.emptySubtext, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            {searchTerm ? "Try adjusting your search terms" : "You haven't made any crypto purchases yet"}
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
    paddingHorizontal: 20,
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

export default CryptoBought;
