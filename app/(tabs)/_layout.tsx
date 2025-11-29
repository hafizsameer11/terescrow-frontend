import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { COLORS, icons, images } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from "expo-notifications";

import { useQuery } from "@tanstack/react-query";
import { getunreadMessageCount } from "@/utils/queries/quickActionQueries";
import { useAuth } from "@/contexts/authContext";

// Only use TabBarBackground on iOS, where it's properly defined
const tabBarBackground = Platform.OS === 'ios' ? TabBarBackground : undefined;
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export default function TabLayout() {
  const tabBarActiveTintColor = COLORS.primary;
  const tabBarInactiveTintColor = '#989898';
  const tabBarBackgroundColor = COLORS.white;
  const [previeusCount, setPreviousCount] = useState(0);
  const { token } = useAuth();
  const { data: count } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: () => getunreadMessageCount(token),
    refetchInterval: 1000,
    enabled: !!token,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      try {
        const hasAskedBefore = await AsyncStorage.getItem("hasAskedNotificationPermission");

        if (!hasAskedBefore) {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowSound: true,
              allowBadge: true,
            },
          });

          if (status === "granted") {
            console.log("Notification permissions granted");
          } else {
            console.warn("Notification permissions not granted");
          }

          await AsyncStorage.setItem("hasAskedNotificationPermission", "true");
        }
      } catch (error) {
        console.error("Error checking or requesting notification permissions:", error);
      }
    };

    checkAndRequestPermissions();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        ...(tabBarBackground && { tabBarBackground }),
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: tabBarBackgroundColor,
            height: 83,
            paddingTop: 8,
            paddingBottom: 34,
          },
          default: {
            backgroundColor: tabBarBackgroundColor,
            height: 83,
            paddingTop: 8,
            paddingBottom: 34,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '400',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={icons.homeIcon}
                style={{ width: 20, height: 20, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={icons.messageIcon}
                style={{ width: 20, height: 20, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transaction",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={icons.receiptIcon}
                style={{ width: 20, height: 20, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: "Support",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={images.headphone}
                style={{ width: 20, height: 20, tintColor: color }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={icons.profileIcon}
                style={{ width: 20, height: 20, tintColor: color }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeBar: {
    width: 28,
    height: 2,
    marginTop: 5,
  },
});
