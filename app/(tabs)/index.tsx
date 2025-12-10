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
import { getWalletTransactions, getCryptoTransactions } from "@/utils/queries/accountQueries";
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
        return { type: "giftcard", useCryptoApi: false, showAll: false, excludeTypes: [] };
      case "Crypto":
        return { useCryptoApi: true, showAll: false, excludeTypes: [] };
      case "Bill Payments":
        return { type: "bill", useCryptoApi: false, showAll: false, excludeTypes: [] };
      case "Wallet":
        return { type: undefined, useCryptoApi: false, showAll: false, excludeTypes: ['giftcard', 'bill'] }; // Wallet tab excludes giftcard and bill
      default:
        return { useCryptoApi: false, showAll: true, excludeTypes: [] }; // "All" - show both wallet and crypto
    }
  }, [activeTab]);

  // Fetch wallet transactions (for non-crypto tabs, "All" tab, and "Wallet" tab)
  const {
    data: walletTransactionsData,
    isLoading: transactionsLoading,
    isError: transactionsError,
    refetch: refetchTransactions,
    isFetching: transactionsFetching,
  } = useQuery({
    queryKey: ["walletTransactions", activeTab],
    queryFn: () => getWalletTransactions(token, { type: getTransactionParams.type, page: 1, limit: 20 }),
    enabled: !!token && (!getTransactionParams.useCryptoApi || getTransactionParams.showAll || activeTab === 'Wallet'),
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // Fetch crypto transactions (for crypto tab and "All" tab)
  const {
    data: cryptoTransactionsData,
    isLoading: cryptoTransactionsLoading,
    isError: cryptoTransactionsError,
    refetch: refetchCryptoTransactions,
    isFetching: cryptoTransactionsFetching,
  } = useQuery({
    queryKey: ["cryptoTransactions", activeTab],
    queryFn: () => getCryptoTransactions(token, { limit: 20, offset: 0 }),
    enabled: !!token && (getTransactionParams.useCryptoApi || getTransactionParams.showAll),
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch all queries based on active tab
      if (activeTab === 'Wallet') {
        // Wallet tab - only wallet transactions (excluding giftcard and bill)
        await refetchTransactions();
      } else if (getTransactionParams.showAll) {
        await Promise.all([refetchTransactions(), refetchCryptoTransactions()]);
      } else if (getTransactionParams.useCryptoApi) {
        await refetchCryptoTransactions();
      } else {
        await refetchTransactions();
      }
    } catch (error) {
      console.log("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, refetchTransactions, refetchCryptoTransactions, getTransactionParams.useCryptoApi, getTransactionParams.showAll]);

  // Get transactions from API response - memoized to prevent unnecessary recalculations
  const transactions = React.useMemo(() => {
    let allTransactions: any[] = [];

    // Add wallet transactions (for non-crypto tabs and "All" tab)
    if (!getTransactionParams.useCryptoApi || getTransactionParams.showAll) {
      const walletTxs = (walletTransactionsData?.data?.transactions || [])
        .map((tx: any) => ({
          ...tx,
          isCrypto: false,
        }))
        // Filter out excluded types (for Wallet tab)
        .filter((tx: any) => {
          if (getTransactionParams.excludeTypes && getTransactionParams.excludeTypes.length > 0) {
            const txType = (tx.type || '').toLowerCase();
            return !getTransactionParams.excludeTypes.some(excludedType => 
              txType === excludedType.toLowerCase()
            );
          }
          return true;
        });
      allTransactions = [...allTransactions, ...walletTxs];
    }

    // Add crypto transactions (for crypto tab and "All" tab)
    // Wallet tab should NOT show crypto transactions
    if ((getTransactionParams.useCryptoApi || getTransactionParams.showAll) && activeTab !== 'Wallet') {
      const cryptoTxs = (cryptoTransactionsData?.data?.transactions || []).map((tx: any) => {
        // Map API response fields to consistent format
        // API returns transactionType, but we use type for consistency
        const transactionType = tx.transactionType || tx.type || 'UNKNOWN';
        
        // Parse amount - API returns string like "25ETH" or "$64717.25"
        let amount = 0;
        let currency = tx.currency || 'USD';
        
        if (tx.amount) {
          // Try to parse amount (remove currency symbols)
          const amountStr = tx.amount.toString().replace(/[^0-9.]/g, '');
          amount = parseFloat(amountStr) || 0;
        } else if (tx.amountUsd) {
          // Use USD amount if available
          const usdStr = tx.amountUsd.toString().replace(/[^0-9.]/g, '');
          amount = parseFloat(usdStr) || 0;
          currency = 'USD';
        }

        return {
          id: tx.id?.toString() || '', // Ensure ID is always a string
          type: transactionType, // Map transactionType to type
          transactionType: transactionType, // Keep original for reference
          amount: amount,
          currency: currency,
          status: tx.status || 'pending',
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt || tx.createdAt,
          // Crypto-specific fields
          fromCurrency: tx.fromCurrency,
          toCurrency: tx.toCurrency,
          fromAmount: tx.fromAmount,
          toAmount: tx.toAmount,
          fromAmountUsd: tx.fromAmountUsd,
          toAmountUsd: tx.toAmountUsd,
          amountUsd: tx.amountUsd,
          amountNaira: tx.amountNaira,
          youReceived: tx.youReceived,
          tradeType: tx.tradeType,
          cryptocurrencyType: tx.cryptocurrencyType,
          blockchain: tx.blockchain,
          isCrypto: true,
        };
      });
      allTransactions = [...allTransactions, ...cryptoTxs];
    }

    // Sort by createdAt (newest first) and limit to 6 for recent transactions
    const sorted = allTransactions.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    // Limit to 6 transactions for recent section
    return sorted.slice(0, 6);
  }, [walletTransactionsData, cryptoTransactionsData, getTransactionParams.useCryptoApi, getTransactionParams.showAll]);

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
        router.push('/allassets');
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
        keyExtractor={(item) => (item.id?.toString() || item.productId?.toString() || Math.random().toString())}
        style={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          // Ensure we have a valid transaction ID
          const itemId = item.id?.toString() || item.productId?.toString() || '';
          if (!itemId) {
            console.warn('Transaction item missing ID:', item);
            return null;
          }
          // Format date
          const transactionDate = new Date(item.createdAt);
          const formattedDate = transactionDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          
          // Format amount and heading based on transaction type
          let formattedAmount = '';
          let heading = item.type || 'Transaction';
          let description = `${item.type || 'Transaction'} transaction`;

          if (item.isCrypto) {
            // For crypto transactions, use the API response format
            if (item.type === 'BUY') {
              heading = item.tradeType || 'Crypto Buy';
              description = `${item.cryptocurrencyType || item.currency || 'Crypto'} purchase`;
              // Use amountUsd if available, otherwise format the amount
              if (item.amountUsd) {
                formattedAmount = item.amountUsd; // Already formatted as "$64717.25"
              } else {
                formattedAmount = `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;
              }
            } else if (item.type === 'SELL') {
              heading = item.tradeType || 'Crypto Sell';
              description = `${item.cryptocurrencyType || item.currency || 'Crypto'} sale`;
              // Use youReceived if available, otherwise amountNaira
              if (item.youReceived) {
                formattedAmount = item.youReceived; // Already formatted as "NGN1"
              } else if (item.amountNaira) {
                formattedAmount = item.amountNaira; // Already formatted as "NGN647172.5"
              } else {
                formattedAmount = `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;
              }
            } else if (item.type === 'SWAP') {
              heading = item.tradeType || 'Crypto Swap';
              description = `${item.fromCurrency || 'Crypto'} → ${item.toCurrency || 'Crypto'}`;
              // Use fromAmountUsd and toAmountUsd if available
              if (item.fromAmountUsd && item.toAmountUsd) {
                formattedAmount = `${item.fromAmountUsd} → ${item.toAmountUsd}`;
              } else if (item.fromAmount && item.toAmount) {
                formattedAmount = `${item.fromAmount} → ${item.toAmount}`;
              } else {
                formattedAmount = `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;
              }
            } else {
              // Fallback for other crypto transaction types
              if (item.amountUsd) {
                formattedAmount = item.amountUsd;
              } else {
                formattedAmount = `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;
              }
            }
          } else {
            // For wallet transactions (non-crypto)
            formattedAmount = item.currency === 'NGN' 
              ? `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`
              : `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;
          }

          // Determine route based on transaction type - always return a valid route
          const getTransactionRoute = (): string => {
            if (item.isCrypto) {
              // For crypto transactions, route to appropriate detail screen
              const transactionType = item.type || item.transactionType;
              if (transactionType === 'BUY') return '/cryptobought';
              if (transactionType === 'SELL') return '/cryptosold';
              if (transactionType === 'SWAP') return '/swapsuccess';
              return '/cryptobought'; // Default fallback for crypto
            }
            // For non-crypto transactions, determine route based on type
            if (item.type === 'giftcard') return '/giftcardsold';
            if (item.type === 'bill') return '/billpayments';
            return '/giftcardsold'; // Default for other transaction types
          };

          const transactionRoute = getTransactionRoute();
          const transactionId = itemId; // Use the validated itemId from above

          // Ensure we always have a valid route and transaction ID
          if (!transactionRoute) {
            console.error('Missing route for transaction:', { item, transactionType: item.type || item.transactionType });
            return null;
          }

          if (!transactionId) {
            console.error('Missing transaction ID:', { item });
            return null;
          }

          // Log navigation for debugging
          console.log('Navigating to transaction detail:', { route: transactionRoute, id: transactionId, type: item.type });

          // Double-check that route and ID are valid before rendering
          if (!transactionRoute || transactionRoute.trim() === '') {
            console.error('Invalid route for transaction:', { route: transactionRoute, item });
            return null;
          }

          if (!transactionId || transactionId.trim() === '') {
            console.error('Invalid transaction ID:', { id: transactionId, item });
            return null;
          }

          return (
            <ChatItem
              id={transactionId}
              icon={icons.chat}
              heading={heading}
              text={description}
              date={formattedDate}
              productId={transactionId}
              price={formattedAmount}
              status={item.status}
              route={transactionRoute}
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
          (transactionsLoading || cryptoTransactionsLoading) ? (
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
