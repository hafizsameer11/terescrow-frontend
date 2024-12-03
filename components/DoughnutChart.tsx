import React, { Component } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import PieChart from "react-native-pie-chart";
const { width: screenWidth } = Dimensions.get("window");

export default class TestChart extends Component {
  render() {
    const widthAndHeight = screenWidth * 0.6; // 300
    const series = [200, 500, 300, 500];
    const sliceColor = ["#0EF302", "#048096", "#191473", "#CA3900"];

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.chartContainer}>
            <PieChart
              widthAndHeight={widthAndHeight}
              series={series}
              sliceColor={sliceColor}
              coverRadius={0.7}
              coverFill={"#FFF"}
            />
            <Text style={styles.totalPercentage}>100%</Text>
          </View>
          {/* Legends */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: "#CA3900" }]} />
              <Text style={[styles.legendText, { color: "#CA3900" }]}>
                Gift Card Sold
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: "#191473" }]} />
              <Text style={[styles.legendText, { color: "#191473" }]}>
                Gift Card Bought
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: "#048096" }]} />
              <Text style={[styles.legendText, { color: "#048096" }]}>
                Crypto Sold
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: "#0EF302" }]} />
              <Text style={[styles.legendText, { color: "#0EF302" }]}>
                Crypto Bought
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    margin: 10,
  },
  chartContainer: {
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
  },
  totalPercentage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    fontSize: 20,
    fontWeight: "bold",
    transform: "translate(-50%, -50%)",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  legendText: {
    fontWeight: "bold",
    fontSize: 7,
  },
  colorBox: {
    width: 5,
    height: 5,
    borderRadius: 50,
    marginRight: 5,
  },
});
