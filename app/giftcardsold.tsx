import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigateBack from "@/components/NavigateBack";
import { useTheme } from "@/contexts/themeContext";
import { COLORS, icons } from "@/constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import TransactionDetail from "@/components/TransactionDetail";
import {
  getGiftCardOrderById,
  getBillPaymentById,
  getWalletTransactions,
} from "@/utils/queries/accountQueries";

const GiftCardSold = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();

  // Extract transaction ID and type from params
  const transactionId = params.id?.toString() || '';
  const transactionType = params.type?.toUpperCase() || '';

  // Determine transaction type from ID format if not provided
  // Gift card orders typically have format like "order_123" or UUID
  // Bill payments have UUID format
  // Wallet transactions have UUID format
  // Crypto transactions have format like "BUY-..." or UUID
  const detectedType = React.useMemo(() => {
    if (transactionType) {
      // Check if it's a crypto-related type
      if (transactionType.includes('CRYPTO') || transactionType === 'BUY' || transactionType === 'SELL' || transactionType === 'SWAP') {
        // Redirect to crypto detail page
        return 'CRYPTO';
      }
      return transactionType;
    }
    // Try to detect from ID format
    if (transactionId.startsWith('order_')) return 'GIFT_CARD';
    // Crypto transaction IDs often start with transaction type (e.g., "BUY-", "SELL-")
    if (transactionId.match(/^(BUY|SELL|SWAP|SEND|RECEIVE)-/i)) return 'CRYPTO';
    // Default to GIFT_CARD for backward compatibility
    return 'GIFT_CARD';
  }, [transactionId, transactionType]);
  
  // If it's a crypto transaction, redirect to the appropriate crypto detail page
  React.useEffect(() => {
    if (detectedType === 'CRYPTO' && transactionId) {
      // Determine the correct crypto route based on transaction type
      const cryptoType = transactionType || transactionId.split('-')[0]?.toUpperCase() || 'BUY';
      let cryptoRoute = '/cryptobought';
      if (cryptoType === 'SELL' || cryptoType.includes('SELL')) {
        cryptoRoute = '/cryptosold';
      } else if (cryptoType === 'SWAP' || cryptoType.includes('SWAP')) {
        cryptoRoute = '/swapsuccess';
      }
      
      // Redirect to the correct crypto detail page
      router.replace({
        pathname: cryptoRoute as any,
        params: { id: transactionId }
      });
      return; // Don't continue with gift card logic
    }
  }, [detectedType, transactionId, transactionType, router]);

  // Fetch gift card order detail
  const {
    data: giftCardOrderData,
    isLoading: giftCardOrderLoading,
    isError: giftCardOrderError,
  } = useQuery({
    queryKey: ["giftCardOrder", transactionId],
    queryFn: () => getGiftCardOrderById(token, transactionId),
    enabled: !!token && !!transactionId && (detectedType === 'GIFT_CARD' || !detectedType) && detectedType !== 'CRYPTO',
  });

  // Fetch bill payment detail
  const {
    data: billPaymentData,
    isLoading: billPaymentLoading,
    isError: billPaymentError,
  } = useQuery({
    queryKey: ["billPayment", transactionId],
    queryFn: () => getBillPaymentById(token, transactionId),
    enabled: !!token && !!transactionId && detectedType === 'BILL_PAYMENT' && detectedType !== 'CRYPTO',
  });

  // Fetch wallet transaction detail (search in wallet transactions)
  const {
    data: walletTransactionsData,
    isLoading: walletTransactionsLoading,
    isError: walletTransactionsError,
  } = useQuery({
    queryKey: ["walletTransaction", transactionId],
    queryFn: () => getWalletTransactions(token, { page: 1, limit: 100 }),
    enabled: !!token && !!transactionId && (detectedType === 'WALLET' || detectedType === 'DEPOSIT' || detectedType === 'WITHDRAW' || detectedType === 'TRANSFER') && detectedType !== 'CRYPTO',
  });

  // Find the specific wallet transaction
  const walletTransaction = React.useMemo(() => {
    if (!walletTransactionsData?.data?.transactions) return null;
    return walletTransactionsData.data.transactions.find(
      (tx: any) => tx.id?.toString() === transactionId
    );
  }, [walletTransactionsData, transactionId]);

  const isLoading = giftCardOrderLoading || billPaymentLoading || walletTransactionsLoading;
  const isError = giftCardOrderError || billPaymentError || walletTransactionsError;

  // If redirecting to crypto page, show loading
  if (detectedType === 'CRYPTO') {
    return (
      <SafeAreaView
        style={[
          { flex: 1, justifyContent: "center", alignItems: "center" },
          dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          { flex: 1, justifyContent: "center", alignItems: "center" },
          dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Render error state
  if (isError) {
    return (
      <SafeAreaView
        style={[
          { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
          dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
        ]}
      >
        <Text style={[styles.errorText, { color: dark ? COLORS.white : COLORS.black }]}>
          Error loading transaction details
        </Text>
        <Text style={[styles.errorSubtext, { color: dark ? COLORS.greyscale500 : COLORS.greyscale600 }]}>
          Please try again later
        </Text>
      </SafeAreaView>
    );
  }

  // Prepare transaction data for TransactionDetail component
  let transactionData: any = null;

  if (detectedType === 'GIFT_CARD' && giftCardOrderData?.data) {
    const order = giftCardOrderData.data;
    transactionData = {
      id: order.orderId,
      type: 'GIFT_CARD',
      status: order.status,
      productName: order.productName,
      brandName: order.brandName,
      amount: order.totalAmount,
      currency: order.currencyCode,
      faceValue: order.faceValue,
      fees: order.fees,
      quantity: order.quantity,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      completedAt: order.completedAt,
    };
  } else if (detectedType === 'BILL_PAYMENT' && billPaymentData?.data?.billPayment) {
    const billPayment = billPaymentData.data.billPayment;
    transactionData = {
      id: billPayment.id,
      type: 'BILL_PAYMENT',
      status: billPayment.status,
      billType: billPayment.billType,
      billerName: billPayment.billerName,
      amount: parseFloat(billPayment.amount || '0'),
      currency: billPayment.currency,
      sceneCode: billPayment.sceneCode,
      rechargeAccount: billPayment.rechargeAccount,
      createdAt: billPayment.createdAt,
      updatedAt: billPayment.updatedAt,
      completedAt: billPayment.completedAt,
    };
  } else if (walletTransaction) {
    transactionData = {
      ...walletTransaction,
      id: walletTransaction.id?.toString() || transactionId,
    };
  }

  // If no transaction data found
  if (!transactionData) {
    return (
      <SafeAreaView
        style={[
          { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
          dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
        ]}
      >
        <Text style={[styles.errorText, { color: dark ? COLORS.white : COLORS.black }]}>
          Transaction not found
        </Text>
        <Text style={[styles.errorSubtext, { color: dark ? COLORS.greyscale500 : COLORS.greyscale600 }]}>
          The transaction you're looking for doesn't exist or has been removed.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
    >
      <NavigateBack text="Transaction Details" />
      <View style={{ flex: 1 }}>
        <TransactionDetail transaction={transactionData} />
      </View>
    </SafeAreaView>
  );
};

export default GiftCardSold;

const styles = StyleSheet.create({
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
