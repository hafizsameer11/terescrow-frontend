import React from "react";
import { Text, View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { COLORS, icons } from "@/constants";
import TransactionItem from "./TransactionItem";
import { useTheme } from "@/contexts/themeContext";
import { ITransactionOverviewType } from "@/utils/queries/accountQueries";
import { useRouter } from "expo-router";

interface TransactionListProps {
  overviewData?: {
    chart: any;
    history: ITransactionOverviewType[];
  };
  isLoading?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ overviewData, isLoading: overviewLoading }) => {
  const { dark } = useTheme();
  const router = useRouter();

  // Get icon for transaction type
  const getIconForType = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      'Crypto': icons.crypto || icons.gift,
      'Gift Card': icons.gift,
      'Bill Payments': icons.bill || icons.gift,
      'Naira Transactions': icons.wallet || icons.gift,
    };
    return iconMap[type] || icons.gift;
  };

  // Map transaction type to dedicated transaction list pages according to TRANSACTION_DETAIL_ROUTES.md
  const getRouteForType = (type: string): { pathname: string; params?: any } => {
    // Map overview transaction types to dedicated transaction list pages
    const typeToRouteMap: { [key: string]: string } = {
      'Crypto': '/crypto-transactions',
      'Gift Card': '/giftcard-transactions',
      'Gift Cards': '/giftcard-transactions',
      'Bill Payments': '/(tabs)/transactions', // TODO: Create /billpayment-transactions when needed
      'Bill Payment': '/(tabs)/transactions', // TODO: Create /billpayment-transactions when needed
      'Naira Transactions': '/(tabs)/transactions', // TODO: Create /wallet-transactions when needed
      'Wallet': '/(tabs)/transactions', // TODO: Create /wallet-transactions when needed
    };
    
    const route = typeToRouteMap[type] || '/(tabs)/transactions';
    return {
      pathname: route,
    };
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // Format amount - show both USD and NGN if available
  const formatAmount = (type: ITransactionOverviewType): string => {
    const usd = parseFloat(type.totalUsd || '0');
    const ngn = parseFloat(type.totalNgn || '0');
    
    if (usd > 0 && ngn > 0) {
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ₦${ngn.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (usd > 0) {
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (ngn > 0) {
      return `₦${ngn.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return '$0.00';
  };

  // Render loading state
  if (overviewLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text style={[styles.loadingText, { color: dark ? COLORS.white : COLORS.black }]}>
          Loading transactions...
        </Text>
      </View>
    );
  }

  // Get history data from overview
  const history = overviewData?.history || [];
  const hasTransactions = history.length > 0 && history.some((item) => item.count > 0);

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
      {hasTransactions ? (
        <FlatList
          data={history.filter((item) => item.count > 0)}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  // Navigate to home page with appropriate tab selected
                  // This will show filtered transactions for the selected type
                  const route = getRouteForType(item.type);
                  router.push({
                    pathname: route.pathname as any,
                    params: route.params,
                  });
                }}
              >
                <View
                  style={[
                    styles.transactionTypeItem,
                    dark
                      ? { backgroundColor: COLORS.dark2 }
                      : { backgroundColor: COLORS.grayscale100 },
                  ]}
                >
                  <View style={styles.transactionTypeLeft}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.iconText}>
                        {item.icon === 'crypto' ? '₿' : 
                         item.icon === 'gift-card' ? '🎁' :
                         item.icon === 'bill-payment' ? '💳' :
                         item.icon === 'naira' ? '₦' : '📊'}
                      </Text>
                    </View>
                    <View style={styles.transactionTypeInfo}>
                      <Text
                        style={[
                          styles.transactionTypeName,
                          { color: dark ? COLORS.white : COLORS.black },
                        ]}
                      >
                        {item.type}
                      </Text>
                      <Text
                        style={[
                          styles.transactionTypeMeta,
                          { color: dark ? COLORS.greyscale500 : COLORS.greyscale600 },
                        ]}
                      >
                        {item.count} transaction{item.count !== 1 ? 's' : ''} • Last: {formatDate(item.latestDate)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionTypeRight}>
                    <Text
                      style={[
                        styles.transactionTypeAmount,
                        { color: dark ? COLORS.white : COLORS.black },
                      ]}
                    >
                      {formatAmount(item)}
                    </Text>
                    <Text
                      style={[
                        styles.transactionTypePercentage,
                        { color: dark ? COLORS.greyscale500 : COLORS.greyscale600 },
                      ]}
                    >
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.type}
          numColumns={1}
          scrollEnabled={false}
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
  transactionTypeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionTypeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  transactionTypeInfo: {
    flex: 1,
  },
  transactionTypeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionTypeMeta: {
    fontSize: 12,
  },
  transactionTypeRight: {
    alignItems: "flex-end",
  },
  transactionTypeAmount: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionTypePercentage: {
    fontSize: 12,
  },
});

export default TransactionList;
