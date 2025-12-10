import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DoughnutChart from "@/components/DoughnutChart";
import TransactionList from "@/components/Transaction/TransactionList";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";
import {
  getWalletTransactions,
  getCryptoTransactions,
} from "@/utils/queries/accountQueries";

const transactions = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Wrapper function to safely handle errors for wallet transactions
  const fetchWalletTransactions = async () => {
    try {
      return await getWalletTransactions(token, { page: 1, limit: 100 });
    } catch (error: any) {
      // Only re-throw if it's a genuine auth error
      const isAuthError =
        error?.statusCode === 401 ||
        (error?.message?.toLowerCase() || "").includes(
          "you are not logged in"
        ) ||
        (error?.message?.toLowerCase() || "").includes("unauthorized");
      if (isAuthError) {
        throw error; // Let auth errors propagate to global handler
      }
      // For other errors, return empty data instead of throwing
      console.log("Error fetching wallet transactions (non-auth):", error);
      return {
        data: { transactions: [] },
        status: "error",
        message: error?.message || "Failed to fetch transactions",
      };
    }
  };

  // Wrapper function to safely handle errors for crypto transactions
  const fetchCryptoTransactions = async () => {
    try {
      return await getCryptoTransactions(token, { limit: 100, offset: 0 });
    } catch (error: any) {
      // Only re-throw if it's a genuine auth error
      const isAuthError =
        error?.statusCode === 401 ||
        (error?.message?.toLowerCase() || "").includes(
          "you are not logged in"
        ) ||
        (error?.message?.toLowerCase() || "").includes("unauthorized");
      if (isAuthError) {
        throw error; // Let auth errors propagate to global handler
      }
      // For other errors, return empty data instead of throwing
      console.log("Error fetching crypto transactions (non-auth):", error);
      return {
        data: { transactions: [], total: 0, limit: 100, offset: 0 },
        status: "error",
        message: error?.message || "Failed to fetch transactions",
      };
    }
  };

  // Fetch wallet transactions (non-crypto)
  const {
    data: walletTransactionsData,
    isLoading: transactionsLoading,
    isError: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["walletTransactions", "all"],
    queryFn: fetchWalletTransactions,
    enabled: !!token,
    staleTime: 10000,
    retry: false, // Don't retry to prevent triggering global error handler multiple times
  });

  // Fetch crypto transactions
  const {
    data: cryptoTransactionsData,
    isLoading: cryptoTransactionsLoading,
    isError: cryptoTransactionsError,
    refetch: refetchCryptoTransactions,
  } = useQuery({
    queryKey: ["cryptoTransactions", "all"],
    queryFn: fetchCryptoTransactions,
    enabled: !!token,
    staleTime: 10000,
    retry: false, // Don't retry to prevent triggering global error handler multiple times
  });

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch all transaction types
      await Promise.all([
        refetchTransactions(),
        refetchCryptoTransactions(),
        queryClient.invalidateQueries({ queryKey: ["transactionHistory"] }),
      ]);
    } catch (error) {
      console.log("Error refreshing transactions:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchTransactions, refetchCryptoTransactions, queryClient]);

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View>
          <Text
            style={[
              styles.pageTitle,
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            Transaction
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <DoughnutChart />
        </View>
        <View style={styles.transList}>
          <TransactionList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  pageTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 32,
  },
  transList: { flex: 1, marginHorizontal: 16, marginTop: 40 },
});

export default transactions;
