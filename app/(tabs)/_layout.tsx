import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { dark } = useTheme();

  // Tab colors based on dark mode
  const tabBarActiveTintColor =  COLORS.black;
  const tabBarInactiveTintColor =  COLORS.black2;
  const tabBarActiveBackgroundColor = COLORS.white 
  const tabBarBackgroundColor =  COLORS.white;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarActiveBackgroundColor: tabBarActiveBackgroundColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
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
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="chevron.left.forwardslash.chevron.right"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
  name="profile"
  options={{
    title: "Profile",

    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="person" size={size || 28} color={color} />
    ),
  }}
/>

    </Tabs>
  );
}
