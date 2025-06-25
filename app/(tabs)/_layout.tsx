import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { COLORS, icons } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from "expo-notifications";

import { useQuery } from "@tanstack/react-query";
import { getunreadMessageCount } from "@/utils/queries/quickActionQueries";
import { useAuth } from "@/contexts/authContext";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export default function TabLayout() {
  const tabBarActiveTintColor = COLORS.primary;
  const tabBarInactiveTintColor = COLORS.greyscale600;
  const tabBarBackgroundColor = COLORS.white;
  const [previeusCount, setPreviousCount] = useState(0);
  const { token } = useAuth();
  const { data: count } = useQuery({
    queryKey: ["notificationCount"],
    queryFn: () => getunreadMessageCount(token),
    refetchInterval: 1000,
    enabled: !!token,
    refetchIntervalInBackground: true, // Keep polling in the background
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

          // Save that the permission was asked
          await AsyncStorage.setItem("hasAskedNotificationPermission", "true");
        }
      } catch (error) {
        console.error("Error checking or requesting notification permissions:", error);
      }
    };

    checkAndRequestPermissions();
  }, []);

  // Trigger push notification on count changes
  // useEffect(() => {
  //   if (count?.data > previeusCount) {
  //     pushNotification(count?.data - previeusCount);
  //   }
  //   Notifications.setBadgeCountAsync(count?.data || 0).catch(console.warn);

  //   setPreviousCount(count?.data || 0);
  // }, [count]);

  // // Push notification function
  // const pushNotification = async (newMessages) => {
  //   const content = {
  //     title: "New Messages!",
  //     body: `You have ${newMessages} new messages.`,
  //     sound: "default", // Play default notification sound
  //     data: { count: newMessages },
  //   };

  //   await Notifications.scheduleNotificationAsync({
  //     content,
  //     trigger: null, // Show immediately
  //   });
  // };


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: tabBarBackgroundColor,
          },
          default: {
            backgroundColor: tabBarBackgroundColor,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={icons.homeIcon}
                style={{ width: 28, height: 28, tintColor: color }}
              />
              {focused && <View style={[styles.activeBar, { backgroundColor: tabBarActiveTintColor }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={icons.messageIcon}
                style={{ width: 28, height: 28, tintColor: color }}
              />
              {focused && <View style={[styles.activeBar, { backgroundColor: tabBarActiveTintColor }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={icons.receiptIcon}
                style={{ width: 28, height: 28, tintColor: color }}
              />
              {focused && <View style={[styles.activeBar, { backgroundColor: tabBarActiveTintColor }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Image
                source={icons.profileIcon}
                style={{ width: 28, height: 28, tintColor: color }}
              />
              {focused && <View style={[styles.activeBar, { backgroundColor: tabBarActiveTintColor }]} />}
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
