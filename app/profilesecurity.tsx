import React from "react";
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { COLORS, icons } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { router, useNavigation } from "expo-router";
import ProfileListItem from "@/components/profileListItem";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

// SecureStore Key
const BIOMETRIC_KEY = "BIOMETRIC_AUTH";

const ProfileSecurity = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();

  const themeStyles = {
    backgroundCont: dark ? COLORS.dark1 : COLORS.white,
    primaryText: dark ? COLORS.white : COLORS.dark1,
  };

  // Store Authentication Status in SecureStore
  const saveBiometricAuth = async (status: boolean) => {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_KEY, JSON.stringify(status));
      Alert.alert(
        "Success",
        `Biometric Authentication ${status ? "Enabled" : "Disabled"}`
      );
    } catch (error) {
      console.error("Error storing biometric status", error);
      Alert.alert("Error", "Failed to save biometric authentication status.");
    }
  };

  // Retrieve Authentication Status from SecureStore
  const getBiometricAuth = async () => {
    try {
      const result = await SecureStore.getItemAsync(BIOMETRIC_KEY);
      return result ? JSON.parse(result) : false;
    } catch (error) {
      console.error("Error retrieving biometric status", error);
      return false;
    }
  };

  // Biometric Authentication Handler
  const handleBiometricAuth = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert("Error", "Biometric authentication not available.");
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert("Error", "No biometric authentication methods found.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Biometrics",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      if (result.success) {
        await saveBiometricAuth(true);
      } else {
        Alert.alert("Failed", "Biometric Authentication Failed.");
      }
    } catch (error) {
      console.error("Biometric Error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.backgroundCont }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}>
            <Image
              source={icons.arrowBack}
              style={[styles.icon, { tintColor: themeStyles.primaryText }]}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeStyles.primaryText }]}>
            Security Settings
          </Text>
        </View>

        <View>
          <ProfileListItem
            text="Change Password"
            icon={icons.lock}
            onPress={() => router.push("/changepassword")}
          />
          <ProfileListItem
            text="Change Transaction Pin"
            icon={icons.lock}
            onPress={() => {
              router.push({
                pathname: "/setpinscreen",
                params: { title: "Enter New Pin", context: "transactionPin" },
              });
            }}
          />
          <ProfileListItem
            text="Face ID/Biometrics"
            icon={icons.scan2}
            onPress={handleBiometricAuth}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  icon: {
    width: 20,
    height: 20,
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
    marginVertical: 9,
  },
});

export default ProfileSecurity;
