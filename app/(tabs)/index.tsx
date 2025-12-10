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
import {
  getWalletTransactions,
  getCryptoTransactions,
  getGiftCardOrders,
  getBillPaymentHistory,
} from "@/utils/queries/accountQueries";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { images } from "@/constants";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function HomeScreen() {
  const { dark } = useTheme();
  const { token } = useAuth();
  const params = useLocalSearchParams<{ activeTab?: string }>();
  const [activeTab, setActiveTab] = React.useState(params.activeTab || "All");
  const [refreshing, setRefreshing] = React.useState(false);

  // Update activeTab if params change
  React.useEffect(() => {
    if (params.activeTab) {
      setActiveTab(params.activeTab);
    }
  }, [params.activeTab]);

  // Map tab to API parameters - memoized to prevent recreation
  const getTransactionParams = React.useMemo(() => {
    switch (activeTab) {
      case "Gift Cards":
        return { useGiftCardApi: true, useCryptoApi: false, useBillPaymentApi: false, useWalletApi: false, showAll: false };
      case "Crypto":
        return { useGiftCardApi: false, useCryptoApi: true, useBillPaymentApi: false, useWalletApi: false, showAll: false };
      case "Bill Payments":
        return { useGiftCardApi: false, useCryptoApi: false, useBillPaymentApi: true, useWalletApi: false, showAll: false };
      case "Wallet":
        return { useGiftCardApi: false, useCryptoApi: false, useBillPaymentApi: false, useWalletApi: true, showAll: false };
      default:
        return { useGiftCardApi: false, useCryptoApi: true, useBillPaymentApi: false, useWalletApi: true, showAll: true }; // "All" - show crypto and wallet
    }
  }, [activeTab]);

  // Fetch gift card orders (for Gift Cards tab)
  const {
    data: giftCardOrdersData,
    isLoading: giftCardOrdersLoading,
    isError: giftCardOrdersError,
    refetch: refetchGiftCardOrders,
  } = useQuery({
    queryKey: ["giftCardOrders", activeTab],
    queryFn: () => getGiftCardOrders(token, { page: 1, limit: 20 }),
    enabled: !!token && getTransactionParams.useGiftCardApi,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // Fetch bill payment history (for Bill Payments tab)
  const {
    data: billPaymentHistoryData,
    isLoading: billPaymentHistoryLoading,
    isError: billPaymentHistoryError,
    refetch: refetchBillPaymentHistory,
  } = useQuery({
    queryKey: ["billPaymentHistory", activeTab],
    queryFn: () => getBillPaymentHistory(token, { page: 1, limit: 20 }),
    enabled: !!token && getTransactionParams.useBillPaymentApi,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // Fetch wallet transactions (for Wallet tab and "All" tab)
  const {
    data: walletTransactionsData,
    isLoading: walletTransactionsLoading,
    isError: walletTransactionsError,
    refetch: refetchWalletTransactions,
    isFetching: walletTransactionsFetching,
  } = useQuery({
    queryKey: ["walletTransactions", activeTab],
    queryFn: () => getWalletTransactions(token, { page: 1, limit: 20 }), // Omit type to get all wallet transaction types
    enabled: !!token && (getTransactionParams.useWalletApi || getTransactionParams.showAll),
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // Fetch crypto transactions (for Crypto tab and "All" tab)
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
      const refetchPromises: Promise<any>[] = [];
      
      if (getTransactionParams.showAll) {
        // "All" tab - refetch crypto and wallet
        refetchPromises.push(refetchCryptoTransactions(), refetchWalletTransactions());
      } else if (getTransactionParams.useCryptoApi) {
        refetchPromises.push(refetchCryptoTransactions());
      } else if (getTransactionParams.useWalletApi) {
        refetchPromises.push(refetchWalletTransactions());
      } else if (getTransactionParams.useBillPaymentApi) {
        refetchPromises.push(refetchBillPaymentHistory());
      } else if (getTransactionParams.useGiftCardApi) {
        refetchPromises.push(refetchGiftCardOrders());
      }
      
      await Promise.all(refetchPromises);
    } catch (error) {
      console.log("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [
    activeTab,
    refetchCryptoTransactions,
    refetchWalletTransactions,
    refetchBillPaymentHistory,
    refetchGiftCardOrders,
    getTransactionParams,
  ]);

  // Get transactions from API response - memoized to prevent unnecessary recalculations
  const transactions = React.useMemo(() => {
    let allTransactions: any[] = [];

    // Add gift card orders (for Gift Cards tab)
    // According to TRANSACTION_DETAIL_ROUTES.md, gift card orders use orderId field
    if (getTransactionParams.useGiftCardApi && giftCardOrdersData?.data?.orders) {
      const giftCardTxs = giftCardOrdersData.data.orders.map((order: any) => {
        // Map gift card order to transaction format
        return {
          // Gift card orders: use orderId for navigation (e.g., "order_123")
          id: order.orderId?.toString() || '',
          orderId: order.orderId, // Keep orderId for detail route
          type: 'GIFT_CARD',
          status: order.status || 'pending',
          amount: order.totalAmount || order.faceValue || 0,
          currency: order.currencyCode || 'USD',
          createdAt: order.createdAt,
          updatedAt: order.updatedAt || order.createdAt,
          // Gift card specific fields
          productName: order.productName,
          brandName: order.brandName,
          faceValue: order.faceValue,
          fees: order.fees,
          quantity: order.quantity,
          isCrypto: false,
          isGiftCard: true,
        };
      });
      allTransactions = [...allTransactions, ...giftCardTxs];
    }

    // Add bill payment history (for Bill Payments tab)
    // According to TRANSACTION_DETAIL_ROUTES.md, bill payments use id field (billPaymentId, UUID)
    if (getTransactionParams.useBillPaymentApi && billPaymentHistoryData?.data?.transactions) {
      const billPaymentTxs = billPaymentHistoryData.data.transactions.map((tx: any) => {
        // Map bill payment to transaction format
        return {
          // Bill payments: use id field (billPaymentId, UUID) for navigation
          id: tx.id?.toString() || tx.transactionId?.toString() || '',
          transactionId: tx.transactionId, // Keep transactionId for reference
          type: tx.billType?.toUpperCase() || 'BILL_PAYMENT',
          status: tx.status || 'pending',
          amount: parseFloat(tx.amount || '0'),
          currency: tx.currency || 'NGN',
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt || tx.createdAt,
          // Bill payment specific fields
          sceneCode: tx.sceneCode,
          billType: tx.billType,
          billerId: tx.billerId,
          billerName: tx.billerName,
          rechargeAccount: tx.rechargeAccount,
          isCrypto: false,
          isBillPayment: true,
        };
      });
      allTransactions = [...allTransactions, ...billPaymentTxs];
    }

    // Add wallet transactions (for Wallet tab and "All" tab)
    // According to TRANSACTION_DETAIL_ROUTES.md, wallet transactions include:
    // DEPOSIT, WITHDRAW, TRANSFER (but NOT BILL_PAYMENT - those come from bill payment history API)
    if ((getTransactionParams.useWalletApi || getTransactionParams.showAll) && walletTransactionsData?.data?.transactions) {
      const walletTxs = walletTransactionsData.data.transactions
        .map((tx: any) => ({
          ...tx,
          id: tx.id?.toString() || '', // Wallet transactions use id (UUID) field
          isCrypto: false,
        }))
        // Filter out BILL_PAYMENT types (they come from bill payment history API)
        .filter((tx: any) => {
          const txType = (tx.type || '').toUpperCase();
          // Exclude BILL_PAYMENT from wallet transactions (use bill payment history API instead)
          // Valid wallet transaction types: DEPOSIT, WITHDRAW, TRANSFER
          return txType !== 'BILL_PAYMENT';
        });
      allTransactions = [...allTransactions, ...walletTxs];
    }

    // Add crypto transactions (for Crypto tab and "All" tab)
    // According to TRANSACTION_DETAIL_ROUTES.md, crypto transactions use transactionId field
    if ((getTransactionParams.useCryptoApi || getTransactionParams.showAll) && cryptoTransactionsData?.data?.transactions) {
      const cryptoTxs = cryptoTransactionsData.data.transactions.map((tx: any) => {
        // Map API response fields to consistent format
        const transactionType = tx.transactionType || tx.type || 'UNKNOWN';
        
        // Parse amount - API returns string like "25ETH" or "$64717.25"
        let amount = 0;
        let currency = tx.currency || 'USD';
        
        if (tx.amount) {
          const amountStr = tx.amount.toString().replace(/[^0-9.]/g, '');
          amount = parseFloat(amountStr) || 0;
        } else if (tx.amountUsd) {
          const usdStr = tx.amountUsd.toString().replace(/[^0-9.]/g, '');
          amount = parseFloat(usdStr) || 0;
          currency = 'USD';
        }

        return {
          // Crypto transactions: use transactionId for navigation (e.g., "BUY-1765357258830-12-vjd7f336e")
          id: tx.transactionId?.toString() || tx.id?.toString() || '',
          transactionId: tx.transactionId || tx.id, // Keep transactionId for detail route
          type: transactionType,
          transactionType: transactionType, // Keep transactionType for routing
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
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    // Limit to 6 transactions for recent section
    return sorted.slice(0, 6);
  }, [
    giftCardOrdersData,
    billPaymentHistoryData,
    walletTransactionsData,
    cryptoTransactionsData,
    getTransactionParams,
    activeTab,
  ]);

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
      icon: images.trade_crypto,
      onPress: () => {
        router.push('/allassets');
      },
    },
    {
      id: '3',
      title: 'Bill Payments',
      description: 'Buy airtimes, mobile date, Subscriptions and more',
      icon: images.bill_pay,
      onPress: () => {
        router.push('/billpayments');
      },
    },
    {
      id: '4',
      title: 'Earn',
      description: 'Earn for life from our crowd Ambassador program',
      icon: images.earn,
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
          // Extract transaction ID based on transaction type according to TRANSACTION_DETAIL_ROUTES.md:
          // - Crypto: use transactionId (e.g., "BUY-1765357258830-12-vjd7f336e")
          // - Gift Cards: use orderId (e.g., "order_123")
          // - Bill Payments: use id (billPaymentId, UUID)
          // - Wallet: use id (UUID)
          let itemId = '';
          if (item.isCrypto && item.transactionId) {
            // Crypto transactions: use transactionId field
            itemId = item.transactionId.toString();
          } else if (item.isGiftCard && item.orderId) {
            // Gift card orders: use orderId field
            itemId = item.orderId.toString();
          } else if (item.isBillPayment && item.id) {
            // Bill payments: use id field (billPaymentId)
            itemId = item.id.toString();
          } else if (item.id) {
            // Wallet transactions and others: use id field (UUID)
            itemId = item.id.toString();
          } else if (item.transactionId) {
            // Fallback: try transactionId if id is not available
            itemId = item.transactionId.toString();
          }
          
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
              // Fallback for other crypto transaction types (SEND, RECEIVE)
              if (item.amountUsd) {
                formattedAmount = item.amountUsd;
              } else {
                formattedAmount = `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;
              }
            }
          } else if (item.isGiftCard) {
            // For gift card orders
            heading = item.productName || item.brandName || 'Gift Card';
            description = `${item.brandName || 'Gift Card'} - ${item.productName || 'Order'}`;
            const currency = item.currency || 'USD';
            formattedAmount = currency === 'NGN'
              ? `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`
              : `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;
          } else if (item.isBillPayment) {
            // For bill payment transactions
            heading = item.billerName || item.billType || 'Bill Payment';
            description = `${item.billerName || 'Bill Payment'} - ${item.billType || 'Payment'}`;
            const currency = item.currency || 'NGN';
            formattedAmount = currency === 'NGN'
              ? `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`
              : `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;
          } else {
            // For wallet transactions (non-crypto, non-giftcard, non-bill)
            const txType = (item.type || '').toUpperCase();
            if (txType === 'DEPOSIT') {
              heading = 'Deposit';
              description = 'Money deposited';
            } else if (txType === 'WITHDRAW') {
              heading = 'Withdrawal';
              description = 'Money withdrawn';
            } else if (txType === 'TRANSFER') {
              heading = 'Transfer';
              description = 'Money transferred';
            } else {
              heading = item.type || 'Transaction';
              description = `${item.type || 'Transaction'} transaction`;
            }
            formattedAmount = item.currency === 'NGN' 
              ? `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`
              : `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.amount)}`;
          }

          // Determine route based on transaction type - always return a valid detail page route
          // NEVER return transaction history routes - only detail pages
          // According to TRANSACTION_DETAIL_ROUTES.md:
          // - Crypto transactions come from /api/v2/crypto/transactions and use transactionId
          // - Wallet transactions come from /api/v2/wallets/transactions and use id (UUID)
          // - Only route to crypto pages if item.isCrypto === true (from crypto API)
          const getTransactionRoute = (): string => {
            // Only route to crypto detail pages if this is actually a crypto transaction
            // (i.e., it came from the crypto transactions API, not wallet transactions API)
            if (item.isCrypto) {
              // For crypto transactions, route to appropriate detail screen based on transactionType
              const transactionType = item.transactionType || item.type || '';
              const normalizedType = transactionType.toUpperCase();
              
              if (normalizedType === 'BUY' || normalizedType.includes('BUY')) {
                return '/cryptobought';
              }
              if (normalizedType === 'SELL' || normalizedType.includes('SELL')) {
                return '/cryptosold';
              }
              if (normalizedType === 'SWAP' || normalizedType.includes('SWAP')) {
                return '/swapsuccess';
              }
              if (normalizedType === 'SEND' || normalizedType.includes('SEND')) {
                return '/cryptosold'; // SEND uses cryptosold route
              }
              if (normalizedType === 'RECEIVE' || normalizedType.includes('RECEIVE')) {
                return '/cryptobought'; // RECEIVE uses cryptobought route
              }
              return '/cryptobought'; // Default fallback for crypto
            }
            
            // For gift card orders (from /api/v2/giftcards/orders)
            if (item.isGiftCard) return '/giftcardsold';
            
            // For bill payment transactions (from /api/v2/bill-payments/history)
            if (item.isBillPayment) return '/giftcardsold'; // TODO: Update when bill payment detail page exists
            
            // For wallet transactions (from /api/v2/wallets/transactions)
            // Valid types: DEPOSIT, WITHDRAW, TRANSFER, BILL_PAYMENT
            // Note: Even if type contains "CRYPTO", it's still a wallet transaction and uses UUID id
            const txType = (item.type || '').toUpperCase();
            if (txType === 'DEPOSIT') return '/giftcardsold'; // TODO: Update when deposit detail page exists
            if (txType === 'WITHDRAW') return '/giftcardsold'; // TODO: Update when withdraw detail page exists
            if (txType === 'TRANSFER') return '/giftcardsold'; // TODO: Update when transfer detail page exists
            if (txType === 'BILL_PAYMENT') return '/giftcardsold'; // TODO: Update when bill payment detail page exists
            // For any other wallet transaction type (including CRYPTO_SELL, CRYPTO_BUY, etc.)
            return '/giftcardsold'; // Default for wallet transactions
            // Note: Never return '/transactions' or any history page route
          };

          const transactionRoute = getTransactionRoute();
          // Use the extracted itemId as the transaction ID for navigation
          // This is already correctly set based on transaction type above
          const transactionId = itemId;
          
          // Determine transaction type for routing parameter
          // This helps the detail page identify what type of transaction it is
          let transactionTypeParam = '';
          if (item.isCrypto) {
            // For crypto transactions, use the transactionType field
            const txType = (item.transactionType || item.type || '').toUpperCase();
            if (txType === 'BUY' || txType.includes('BUY')) {
              transactionTypeParam = 'BUY';
            } else if (txType === 'SELL' || txType.includes('SELL')) {
              transactionTypeParam = 'SELL';
            } else if (txType === 'SWAP' || txType.includes('SWAP')) {
              transactionTypeParam = 'SWAP';
            } else if (txType === 'SEND' || txType.includes('SEND')) {
              transactionTypeParam = 'SEND';
            } else if (txType === 'RECEIVE' || txType.includes('RECEIVE')) {
              transactionTypeParam = 'RECEIVE';
            } else {
              transactionTypeParam = txType || 'CRYPTO';
            }
          } else if (item.isGiftCard) {
            transactionTypeParam = 'GIFT_CARD';
          } else if (item.isBillPayment) {
            transactionTypeParam = 'BILL_PAYMENT';
          } else {
            // For wallet transactions, use the type field as-is (DEPOSIT, WITHDRAW, TRANSFER, BILL_PAYMENT, CRYPTO_SELL, etc.)
            // Even if it's CRYPTO_SELL, it's still a wallet transaction and should use UUID id, not transactionId
            transactionTypeParam = (item.type || 'WALLET').toUpperCase();
          }

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

          // Build route with transaction ID and type
          // Format: /route?id=transactionId&type=transactionType
          const routeWithParams = `${transactionRoute}?id=${encodeURIComponent(transactionId)}&type=${encodeURIComponent(transactionTypeParam)}`;
          
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
              route={routeWithParams}
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
          (giftCardOrdersLoading || billPaymentHistoryLoading || walletTransactionsLoading || cryptoTransactionsLoading) ? (
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
