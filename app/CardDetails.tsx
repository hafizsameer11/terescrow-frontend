import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavigateBack from "@/components/NavigateBack";
import CardCom from "@/components/CardCom";
import { COLORS } from "@/constants";
import InformationFields from "@/components/InformationFields";
import CustomProceed from "@/components/CustomProceed";
import { useTheme } from "@/contexts/themeContext";

interface CardDetailsProps {
  card: any; // Replace `any` with the specific type of your card image
  text: string;
}

const CardDetails = ({ card, text }: CardDetailsProps) => {
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
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View>
            <NavigateBack text={text} />
          </View>
          <View>
            <CardCom card={card} />
          </View>
          <View>
            <InformationFields />
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <CustomProceed />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  footer: {
    position: "relative",
    bottom: 0,
    width: "100%",
    padding: 10,
  },
});

export default CardDetails;
