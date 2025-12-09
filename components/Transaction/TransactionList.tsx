import { Text, View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { COLORS, icons } from "@/constants";
import TransactionItem from "./TransactionItem";
import { useTheme } from "@/contexts/themeContext";
import { useQuery } from "@tanstack/react-query";
import { transactionHistory } from "@/utils/queries/transactionQueries";
import { getWalletTransactions, getCryptoTransactions } from "@/utils/queries/accountQueries";
import { useAuth } from "@/contexts/authContext";
import { useNavigation } from "expo-router";

const TransactionList = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const { navigate } = useNavigation();

  // Wrapper function to safely handle errors for wallet transactions
  const fetchWalletTransactions = async () => {
    try {
      return await getWalletTransactions(token, { page: 1, limit: 100 });
    } catch (error: any) {
      // Only re-throw if it's a genuine auth error
      const isAuthError = error?.statusCode === 401 || 
        (error?.message?.toLowerCase() || '').includes('you are not logged in') ||
        (error?.message?.toLowerCase() || '').includes('unauthorized');
      if (isAuthError) {
        throw error; // Let auth errors propagate to global handler
      }
      // For other errors, return empty data instead of throwing
      console.log("Error fetching wallet transactions (non-auth):", error);
      return { data: { transactions: [] }, status: 'error', message: error?.message || 'Failed to fetch transactions' };
    }
  };

  // Wrapper function to safely handle errors for crypto transactions
  const fetchCryptoTransactions = async () => {
    try {
      return await getCryptoTransactions(token, { limit: 100, offset: 0 });
    } catch (error: any) {
      // Only re-throw if it's a genuine auth error
      const isAuthError = error?.statusCode === 401 || 
        (error?.message?.toLowerCase() || '').includes('you are not logged in') ||
        (error?.message?.toLowerCase() || '').includes('unauthorized');
      if (isAuthError) {
        throw error; // Let auth errors propagate to global handler
      }
      // For other errors, return empty data instead of throwing
      console.log("Error fetching crypto transactions (non-auth):", error);
      return { data: { transactions: [], total: 0, limit: 100, offset: 0 }, status: 'error', message: error?.message || 'Failed to fetch transactions' };
    }
  };

  // Use wallet transactions API (new API) - for non-crypto transactions
  const {
    data: walletTransactionsData,
    isLoading: transactionsLoading,
    isError: transactionsIsError,
  } = useQuery({
    queryKey: ["walletTransactions", "all"],
    queryFn: fetchWalletTransactions,
    enabled: !!token,
    retry: false,
  });

  // Use crypto transactions API
  const {
    data: cryptoTransactionsData,
    isLoading: cryptoTransactionsLoading,
    isError: cryptoTransactionsIsError,
  } = useQuery({
    queryKey: ["cryptoTransactions", "all"],
    queryFn: fetchCryptoTransactions,
    enabled: !!token,
    retry: false,
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

  const isLoading = transactionsLoading || cryptoTransactionsLoading || (transactionLoading && transactionsIsError);
  const isError = (transactionsIsError && cryptoTransactionsIsError) && transactionIsError;

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

  // Combine wallet and crypto transactions
  const walletTransactions = walletTransactionsData?.data?.transactions || [];
  const cryptoTransactions = (cryptoTransactionsData?.data?.transactions || []).map((tx: any) => ({
    id: tx.id,
    type: tx.type,
    amount: parseFloat(tx.amount || '0'),
    currency: tx.currency || 'USD',
    status: tx.status,
    createdAt: tx.createdAt,
    fromCurrency: tx.fromCurrency,
    toCurrency: tx.toCurrency,
    fromAmount: tx.fromAmount,
    toAmount: tx.toAmount,
    isCrypto: true, // Flag to identify crypto transactions
  }));
  
  const transactions = [...walletTransactions, ...cryptoTransactions];
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

            // Determine route based on transaction type
            const getTransactionRoute = () => {
              if (item.isCrypto) {
                // For crypto transactions, route to appropriate detail screen
                if (item.type === 'BUY') return 'cryptobought';
                if (item.type === 'SELL') return 'cryptosold';
                if (item.type === 'SWAP') return 'swapsuccess';
                return 'cryptobought'; // Default fallback
              }
              return 'giftcardsold'; // Default for other transaction types
            };

            return (
              <TransactionItem
                icon={icons.gift} // Default icon since wallet transactions don't have department info
                heading={item.type || 'Transaction'}
                date={formattedDate}
                price={formattedAmount}
                productId={item.id.toString()}
                id={item.id}
                route={getTransactionRoute()}
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
