import { Text, View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { COLORS, icons } from "@/constants";
import TransactionItem from "./TransactionItem";
import { useTheme } from "@/contexts/themeContext";
import { useQuery } from "@tanstack/react-query";
import { transactionHistory } from "@/utils/queries/transactionQueries";
import { useAuth } from "@/contexts/authContext";
import { useNavigation } from "expo-router";

const TransactionList = () => {
  const { dark } = useTheme();
  const { token } = useAuth();
  const { navigate } = useNavigation();

  const {
    data: transactionData,
    isLoading: transactionLoading,
    error: transactionError,
    isError: transactionIsError,
  } = useQuery({
    queryKey: ["transactionHistory"],
    queryFn: () => transactionHistory(token),
    enabled: !!token,
  });

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
      <FlatList
        data={transactionData?.data || []}
        renderItem={({ item }) => (
          <TransactionItem
            icon={item.department.icon || icons.gift} // Use default icon if null or empty
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
  },
  errorText: {
    fontSize: 16,
    color: COLORS.red,
  },
});

export default TransactionList;
