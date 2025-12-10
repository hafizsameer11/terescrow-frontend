import React from "react";
import { StyleSheet, Text, View, Dimensions, ActivityIndicator } from "react-native";
import PieChart from "react-native-pie-chart";
import { ITransactionOverviewChart } from "@/utils/queries/accountQueries";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";

const { width: screenWidth } = Dimensions.get("window");

interface DoughnutChartProps {
  overviewData?: {
    chart: ITransactionOverviewChart;
    history: any[];
  };
  isLoading?: boolean;
}

const TestChart: React.FC<DoughnutChartProps> = ({ overviewData, isLoading }) => {
  const { dark } = useTheme();
  const widthAndHeight = screenWidth * 0.6;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!overviewData?.chart?.types || overviewData.chart.types.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: dark ? COLORS.white : COLORS.black }]}>
          No transaction data available
        </Text>
      </View>
    );
  }

  // Filter out types with 0 percentage and sort by percentage (descending)
  const chartTypes = overviewData.chart.types
    .filter((type) => type.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  if (chartTypes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: dark ? COLORS.white : COLORS.black }]}>
          No transactions to display
        </Text>
      </View>
    );
  }

  // Map transaction types to colors
  const getColorForType = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      'Crypto': '#147341',
      'Gift Card': '#048096',
      'Bill Payments': '#191473',
      'Naira Transactions': '#CA3900',
    };
    return colorMap[type] || '#FF5733';
  };

  const series = chartTypes.map((type) => parseFloat(type.totalUsd) || 0);
  const colors = chartTypes.map((type) => getColorForType(type.type));

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.chartContainer}>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={series}
            sliceColor={colors}
            coverRadius={0.7}
            coverFill={"#FFF"}
          />
        </View>

        {/* Legends */}
        <View style={styles.legendContainer}>
          {chartTypes.map((type, index) => (
            <View key={type.type} style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: colors[index] }]} />
              <Text style={[styles.legendText, { color: dark ? COLORS.white : COLORS.black }]}>
                {type.type} ({type.percentage.toFixed(1)}%)
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
