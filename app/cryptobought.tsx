import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DUMMY_CRYPTO_SOLDS_BOUGHT } from "@/utils/dummyTrans";
import NavigateBack from "@/components/NavigateBack";
import SearchInputField from "@/components/SearchInputField";
import TransactionData from "@/components/TransactionData";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";
import { getCryptoTransactionById, getCryptoTransactions } from "@/utils/queries/accountQueries";

const CryptoBought = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const transactionId = params.id;

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
        {transactionId && transactionDetail?.data ? (
          <TransactionData
            icon={""}
            heading={transactionDetail.data.type || "BUY"}
            date={new Date(transactionDetail.data.createdAt).toLocaleDateString()}
            price={`${transactionDetail.data.amount} ${transactionDetail.data.currency}`}
            productId={transactionDetail.data.id}
          />
        ) : (
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <TransactionData
                icon={item.icon || ""}
                heading={item.heading || item.type || "BUY"}
                date={item.date || new Date(item.createdAt || "").toLocaleDateString()}
                price={item.price || `${item.amount} ${item.currency}`}
                productId={item.productId || item.id}
              />
            )}
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
