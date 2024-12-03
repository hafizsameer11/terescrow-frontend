import { Text, View, StyleSheet, FlatList } from "react-native";
import { COLORS, icons } from "@/constants";
import TransactionItem from "./TransactionItem";
import { DUMMY_TRANS } from "../../utils/dummyTrans";
import { useTheme } from "@/contexts/themeContext";
const TransactionList = () => {
  const { dark } = useTheme();
  const data = DUMMY_TRANS;
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
        data={data}
        renderItem={({ item }) => (
          <TransactionItem
            icon={item.icon}
            heading={item.heading}
            date={item.date}
            price={item.price}
            productId={item.productId}
            route={item.route}
          />
        )}
        keyExtractor={(item) => item.key}
        numColumns={1}
        scrollEnabled={false}
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
});

export default TransactionList;
