import { COLORS, icons } from "@/constants";
import { Image } from "expo-image";
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import { useNavigation } from "expo-router";
import Button from "@/utils/Button";
import DraggableModal from "./kycModal";
import { useState } from "react";

const UpdateKycLevel = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();

  const [isModalVisible, setModalVisible] = useState(false);

  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
    verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
  };
  const openModal = () => setModalVisible(true);

  const closeModal = () => setModalVisible(false);

  const currentLimits = [
    {
      icon: icons.activity2,
      title: "Crypto limit",
      limits: [
        { label: "Receive", value: "Unlimited" },
        { label: "Sell", value: "Unlimited" },
      ],
    },
    {
      icon: icons.gift,
      title: "Gift Card limit",
      limits: [
        { label: "Receive", value: "Unlimited" },
        { label: "Sell", value: "Unlimited" },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background }}>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <ScrollView>
          <View style={styles.container}>
            <TouchableOpacity
              style={{ position: "absolute", left: 15 }}
              onPress={goBack}
            >
              <Image
                source={icons.arrowBack}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: themeStyles.normalText,
                }}
              />
            </TouchableOpacity>
            <Text
              style={[
                { fontSize: 20, fontWeight: "bold" },
                { color: themeStyles.normalText },
              ]}
            >
              Update KYC Level
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={[
                { fontSize: 16, marginVertical: 10 },
                { color: themeStyles.normalText },
              ]}
            >
              Tier 2 - Current level
            </Text>

            <View>
              <View style={styles.rowContainer}>
                <Text style={{ color: themeStyles.normalText }}>
                  BVN Verification
                </Text>
                <View
                  style={[
                    styles.verifiedContainer,
                    { backgroundColor: themeStyles.verifiedBackground },
                  ]}
                >
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              <Text
                style={[
                  {
                    fontSize: 16,
                    marginBottom: 15,
                    marginTop: 20,
                    fontWeight: "bold",
                  },
                  { color: themeStyles.normalText },
                ]}
              >
                Current limit
              </Text>

              {currentLimits.map((item, index) => (
                <View key={index} style={styles.limitContainer}>
                  <View style={styles.limitHeader}>
                    <Image
                      source={item.icon}
                      style={{
                        width: 24,
                        height: 24,
                        marginRight: 10,
                        tintColor: themeStyles.normalText,
                      }}
                    />
                    <Text style={[{ color: themeStyles.normalText }]}>
                      {item.title}
                    </Text>
                  </View>

                  {item.limits.map((limit, idx) => (
                    <View key={idx} style={styles.limitRow}>
                      <Text style={{ color: themeStyles.normalText }}>
                        {limit.label}
                      </Text>
                      <Text style={{ color: themeStyles.normalText }}>
                        {limit.value}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <DraggableModal isVisible={isModalVisible} onClose={closeModal} />
        <View style={styles.buttonContainer}>
          <Button title="Upgrade to Tier 2" onPress={openModal} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  verifiedContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  verifiedText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  limitContainer: {
    marginBottom: 15,
  },
  limitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  limitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  buttonContainer: {
    padding: 20,
  },
});

export default UpdateKycLevel;
