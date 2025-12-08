import { StyleSheet, ScrollView, Text, View, RefreshControl, ActivityIndicator } from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DoughnutChart from "@/components/DoughnutChart";
import TransactionList from "@/components/Transaction/TransactionList";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";
import { getWalletTransactions, getCryptoTransactions } from "@/utils/queries/accountQueries";

const transactions = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wallet transactions (non-crypto)
  const {
    data: walletTransactionsData,
    isLoading: transactionsLoading,
    isError: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["walletTransactions", "all"],
    queryFn: () => getWalletTransactions(token, { page: 1, limit: 100 }),
    enabled: !!token,
    staleTime: 10000,
  });

  // Fetch crypto transactions
  const {
    data: cryptoTransactionsData,
    isLoading: cryptoTransactionsLoading,
    isError: cryptoTransactionsError,
    refetch: refetchCryptoTransactions,
  } = useQuery({
    queryKey: ["cryptoTransactions", "all"],
    queryFn: () => getCryptoTransactions(token, { limit: 100, offset: 0 }),
    enabled: !!token,
    staleTime: 10000,
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
