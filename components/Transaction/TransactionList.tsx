import { Text, View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { COLORS, icons } from "@/constants";
import TransactionItem from "./TransactionItem";
import { useTheme } from "@/contexts/themeContext";
import { useQuery } from "@tanstack/react-query";
import { transactionHistory } from "@/utils/queries/transactionQueries";
import { getWalletTransactions } from "@/utils/queries/accountQueries";
import { useAuth } from "@/contexts/authContext";
import { useNavigation } from "expo-router";

const TransactionList = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const { navigate } = useNavigation();

  // Use wallet transactions API (new API)
  const {
    data: walletTransactionsData,
    isLoading: transactionsLoading,
    isError: transactionsIsError,
  } = useQuery({
    queryKey: ["walletTransactions", "all"],
    queryFn: () => getWalletTransactions(token, { page: 1, limit: 100 }),
    enabled: !!token,
  });

  // Fallback to old API if wallet transactions fail (for backward compatibility)
  const {
    data: transactionData,
    isLoading: transactionLoading,
    isError: transactionIsError,
  } = useQuery({
    queryKey: ["transactionHistory"],
    queryFn: () => transactionHistory(token),
    enabled: !!token && transactionsIsError, // Only use if wallet transactions failed
  });

  const isLoading = transactionsLoading || (transactionLoading && transactionsIsError);
  const isError = transactionsIsError && transactionIsError;

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text style={[styles.loadingText, { color: dark ? COLORS.white : COLORS.black }]}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  // Render error state
  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={[styles.errorText, { color: dark ? COLORS.white : COLORS.black }]}>
          Failed to load transactions
        </Text>
      </View>
    );
  }

  // Use wallet transactions if available, otherwise fall back to old transaction data
  const transactions = walletTransactionsData?.data?.transactions || [];
  const hasTransactions = transactions.length > 0 || (transactionData?.data && transactionData.data.length > 0);

  return (
    <View>
      <View>
        <Text
          style={[
            styles.mainHeading,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          Transaction History
        </Text>
      </View>
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={({ item }) => {
            // Format date
            const transactionDate = new Date(item.createdAt);
            const formattedDate = transactionDate.toLocaleDateString();
            
            // Format amount based on currency
            const formattedAmount = item.currency === 'NGN' 
              ? `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`
              : `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;

            return (
              <TransactionItem
                icon={icons.gift} // Default icon since wallet transactions don't have department info
                heading={item.type || 'Transaction'}
                date={formattedDate}
                price={formattedAmount}
                productId={item.id.toString()}
                id={item.id}
                route="giftcardsold"
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            !isLoading && transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: dark ? COLORS.white : COLORS.black }]}>
                  No transactions found
                </Text>
                <Text style={[styles.emptySubtext, { color: dark ? COLORS.white : COLORS.black }]}>
                  You don't have any transactions yet
                </Text>
              </View>
            ) : null
          }
        />
      ) : transactionData?.data && transactionData.data.length > 0 ? (
        // Fallback to old transaction data format
        <FlatList
          data={transactionData.data}
          renderItem={({ item }) => (
            <TransactionItem
              icon={item.department.icon || icons.gift}
              heading={item.department.title}
              date={new Date(item.createdAt).toLocaleDateString()}
              price={`₦${item.amountNaira.toLocaleString()}`}
              productId={item.id.toString()}
              id={item.department.id}
              route="giftcardsold"
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: dark ? COLORS.white : COLORS.black }]}>
            No transactions found
          </Text>
          <Text style={[styles.emptySubtext, { color: dark ? COLORS.white : COLORS.black }]}>
            You don't have any transactions yet
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    marginRight: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.red,
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

export default TransactionList;
