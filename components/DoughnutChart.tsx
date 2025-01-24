import React from "react";
import { StyleSheet, Text, View, Dimensions, ActivityIndicator } from "react-native";
import PieChart from "react-native-pie-chart";
import { useAuth } from "@/contexts/authContext";
import { transactionHistory } from "@/utils/queries/transactionQueries";
import { useQuery } from "@tanstack/react-query";

const { width: screenWidth } = Dimensions.get("window");

const TestChart = () => {
  const widthAndHeight = screenWidth * 0.6;
  const { token } = useAuth();

  const {
    data: transactionData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["transactionHistory"],
    queryFn: () => transactionHistory(token),
    enabled: !!token,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (isError) {
    return <Text style={{textAlign: 'center'}}>No recent transactions</Text>;
  }

  const data = transactionData?.data || [];

  const series = data.map((item) => item.amount);
  const labels = data.map((item) => item.department.title);
  const colors = ["#147341", "#048096", "#191473", "#CA3900", "#FF5733", "#C70039"];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.chartContainer}>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={series}
            sliceColor={colors.slice(0, series.length)}
            coverRadius={0.7}
            coverFill={"#FFF"}
          />
        </View>

        {/* Legends */}
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={item.id} style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: colors[index] }]} />
              <Text style={[styles.legendText, { color: colors[index] }]}>
                {item.department.title}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TestChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  chartContainer: {
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 25,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 10,
  },
  legendText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 50,
    marginRight: 5,
  },
});
