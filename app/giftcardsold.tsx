import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigateBack from "@/components/NavigateBack";
import SearchInputField from "@/components/SearchInputField";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
import { useRoute, RouteProp } from "@react-navigation/native";
import TransactionData from "@/components/TransactionData";
import { getTransactionByDepartment } from "@/utils/queries/transactionQueries";
import { useAuth } from "@/contexts/authContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const GiftCardSold = () => {
  const { dark } = useTheme();
  const { token } = useAuth();

  // Use React Navigation's useRoute to get route params
  const route = useRoute<RouteProp<{ params: { id: number } }, "params">>();
  const { id } = route.params;

  const {
    data: transactionData,
    isLoading: transactionLoading,
    error: transactionError,
    isError: transactionIsError,
  } = useQuery({
    queryKey: ["transactionByDepartment", id],
    queryFn: () => getTransactionByDepartment(token, id),
    enabled: !!id && !!token,
  });

  useEffect(() => {
    if (transactionIsError) {
      console.error("Error fetching transactions:", transactionError);
    }
    if (transactionData) {
      console.log("Transaction data:", transactionData);
    }
  }, [transactionData, transactionIsError, transactionError]);

  // Render loading state
  if (transactionLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  // Render error state
  if (transactionIsError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Error fetching transactions: {transactionError?.message || "Unknown error"}
        </Text>
      </View>
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
      <NavigateBack text={`Gift Card Sold - ID: ${id}`} />
      <SearchInputField searchTerm="" setSearchTerm={() => {}} />
      <View style={{ flex: 1 }}>
        <FlatList
          data={transactionData?.data || []}
          renderItem={({ item }) => (
            <TransactionData
              icon={item.category?.image || "icon-placeholder"}
              heading={item.category?.title || "No Title"}
              date={new Date(item.createdAt).toLocaleDateString()}
              price={`₦${item.amountNaira.toLocaleString()}`}
              productId={item.id.toString()}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default GiftCardSold;

const styles = {
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.red,
    fontSize: 16,
  },
};
