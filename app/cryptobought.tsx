import React from "react";
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DUMMY_CRYPTO_SOLDS_BOUGHT } from "@/utils/dummyTrans";
import NavigateBack from "@/components/NavigateBack";
import SearchInputField from "@/components/SearchInputField";
import TransactionData from "@/components/TransactionData";
import TransactionDetail from "@/components/TransactionDetail";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";
import { getCryptoTransactionById, getCryptoTransactions } from "@/utils/queries/accountQueries";

const CryptoBought = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  // Ensure transactionId is always a string and properly extracted
  const transactionId = React.useMemo(() => {
    const id = params.id?.toString() || params.id || '';
    return id.trim();
  }, [params.id]);

  // If transactionId is provided, fetch single transaction detail
  const {
    data: transactionDetail,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
    queryKey: ["cryptoTransaction", transactionId],
    queryFn: () => getCryptoTransactionById(token, transactionId!),
    enabled: !!token && !!transactionId,
  });

  // If no transactionId, fetch list of BUY transactions
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
  } = useQuery({
    queryKey: ["cryptoTransactions", "BUY"],
    queryFn: () => getCryptoTransactions(token, { type: "BUY", limit: 100, offset: 0 }),
    enabled: !!token && !transactionId,
  });

  const isLoading = detailLoading || transactionsLoading;
  const data = transactionId && transactionDetail?.data 
    ? [transactionDetail.data] 
    : transactionsData?.data?.transactions || DUMMY_CRYPTO_SOLDS_BOUGHT;

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          { flex: 1, justifyContent: "center", alignItems: "center" },
          dark
            ? { backgroundColor: COLORS.black }
            : { backgroundColor: COLORS.white },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <NavigateBack text={transactionId ? "Transaction Details" : "Crypto Bought"} />
      {!transactionId && <SearchInputField />}
      <View style={{ flex: 1 }}>
        {transactionId ? (
          // If transactionId is provided, always show detail view (even if loading or error)
          detailLoading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 12, color: dark ? COLORS.white : COLORS.black }}>
                Loading transaction details...
              </Text>
            </View>
          ) : detailError ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
              <Text style={{ color: COLORS.red, textAlign: "center", marginBottom: 8 }}>
                Error loading transaction
              </Text>
              <Text style={{ color: dark ? COLORS.white : COLORS.black, textAlign: "center" }}>
                Transaction ID: {transactionId}
              </Text>
            </View>
          ) : transactionDetail?.data ? (
            <TransactionDetail transaction={transactionDetail.data} />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
              <Text style={{ color: dark ? COLORS.white : COLORS.black, textAlign: "center" }}>
                Transaction not found
              </Text>
              <Text style={{ color: dark ? COLORS.greyscale500 : COLORS.greyscale600, textAlign: "center", marginTop: 8 }}>
                ID: {transactionId}
              </Text>
            </View>
          )
        ) : (
          <FlatList
            data={data}
            renderItem={({ item }) => {
              const txId = item.id || item.productId;
              const transactionType = item.transactionType || item.type || 'BUY';
              
              // Determine route based on transaction type
              const getRoute = () => {
                if (transactionType === 'BUY') return 'cryptobought';
                if (transactionType === 'SELL') return 'cryptosold';
                if (transactionType === 'SWAP') return 'swapsuccess';
                return 'cryptobought';
              };

              return (
                <TouchableOpacity
                  onPress={() => {
                    if (txId) {
                      router.push({
                        pathname: getRoute() as any,
                        params: { id: txId.toString() }
                      });
                    }
                  }}
                >
                  <TransactionData
                    icon={item.icon || ""}
                    heading={item.tradeType || item.heading || transactionType || "BUY"}
                    date={item.date || new Date(item.createdAt || "").toLocaleDateString()}
                    price={item.amountUsd || item.price || `${item.amount || '0'} ${item.currency || ''}`}
                    productId={txId?.toString() || ''}
                  />
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.key || item.id || item.productId}
            numColumns={1}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default CryptoBought;
