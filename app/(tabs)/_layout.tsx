import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { COLORS, icons } from "@/constants";

export default function TabLayout() {
  const tabBarActiveTintColor = COLORS.primary;
  const tabBarInactiveTintColor = COLORS.greyscale600;
  const tabBarBackgroundColor = COLORS.white;

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
