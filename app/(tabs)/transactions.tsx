import { StyleSheet, ScrollView, Text, View, RefreshControl, ActivityIndicator } from "react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DoughnutChart from "@/components/DoughnutChart";
import TransactionList from "@/components/Transaction/TransactionList";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";

const transactions = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch transaction history query (used by both DoughnutChart and TransactionList)
      await queryClient.invalidateQueries({ queryKey: ["transactionHistory"] });
    } catch (error) {
      console.log("Error refreshing transactions:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

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
