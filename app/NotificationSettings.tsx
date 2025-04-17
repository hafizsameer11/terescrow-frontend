import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { useTheme } from "@/contexts/themeContext";
import { Image } from "expo-image";
import { COLORS, icons } from "@/constants";
import * as SecureStore from "expo-secure-store";

const NOTIFICATION_KEY = "NOTIFICATION_ENABLED";

const NotificationSettings = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const [isEnabled, setIsEnabled] = useState(false);

  const themeStyles = {
    backgroundCont: dark ? COLORS.dark1 : COLORS.white,
    primaryText: dark ? COLORS.white : COLORS.dark1,
  };

  const toggleSwitch = async () => {
    try {
      const newValue = !isEnabled;
      setIsEnabled(newValue);
      await SecureStore.setItemAsync(NOTIFICATION_KEY, JSON.stringify(newValue));
      Alert.alert("Success", `Notifications ${newValue ? "Enabled" : "Disabled"}`);
    } catch (err) {
      console.error("Toggle failed", err);
      Alert.alert("Error", "Failed to update notification preference.");
    }
  };

  const getNotificationSetting = async () => {
    try {
      const storedValue = await SecureStore.getItemAsync(NOTIFICATION_KEY);
      if (storedValue !== null) {
        setIsEnabled(JSON.parse(storedValue));
      }
    } catch (error) {
      console.error("Failed to load setting", error);
    }
  };

  useEffect(() => {
    getNotificationSetting();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.backgroundCont }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}>
            <Image
              source={icons.arrowBack}
              style={[styles.icon, { tintColor: themeStyles.primaryText }]}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeStyles.primaryText }]}>
            Notification Settings
          </Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingText, { color: themeStyles.primaryText }]}>
            Enable Notifications
          </Text>
          <Switch
            trackColor={{ false: "#ccc", true: COLORS.primary }}
            thumbColor={isEnabled ? COLORS.white : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 30,
  },
  icon: {
    width: 20,
    height: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale200,
  },
  settingText: {
    fontSize: 18,
  },
});
