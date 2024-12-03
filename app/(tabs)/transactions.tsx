import { StyleSheet, ScrollView, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DoughnutChart from "@/components/DoughnutChart";
import TransactionList from "@/components/Transaction/TransactionList";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";

const transactions = () => {
  const { dark } = useTheme();
  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <View>
        <Text
          style={[
            styles.pageTitle,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          Transaction
        </Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <DoughnutChart />
        </View>
        <View style={styles.transList}>
          <TransactionList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  pageTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 32,
  },
  transList: { flex: 1, marginHorizontal: 16, marginTop: 40 },
});

export default transactions;
