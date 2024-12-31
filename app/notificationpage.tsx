import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { COLORS, icons } from "@/constants";
import { Colors } from "@/constants/Colors";
import NotifiItem from "@/components/notification/NotifiItem";
import { useTheme } from "@/contexts/themeContext";
import { getNotifications, markAllRead } from "@/utils/mutations/authMutations";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";
// import * as Notifications from "expo-notifications";

const NotificationPage: React.FC = () => {
  const router = useRouter();
  const { dark } = useTheme();
  const { token, setUserData } = useAuth();

  // Track notification count
  const [notificationCount, setNotificationCount] = useState<number>(0);

  // Fetch Notifications
  const {
    data: notificationData,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(token),
    refetchInterval: 5000, // Every 5 seconds
    refetchIntervalInBackground: true,
    enabled: !!token,
  });

  // Mutation for Marking All as Read
  const { mutate: handleMarkAllRead } = useMutation({
    mutationFn: () => markAllRead(token),
    onSuccess: () => {
      setNotificationCount(0); // Reset count
      router.push("(tabs)");
    },
    onError: (error) => {
      console.error("Error marking notifications as read:", error);
    },
  });
  useEffect(() => {
    if (notificationData?.data) {

      console.log("notification data", notificationData);
    }
  });

  // Trigger push notifications when count increases


  return (
    <SafeAreaView
      style={[
        styles.container,
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.closeIcon,
            dark
              ? { backgroundColor: COLORS.white }
              : { backgroundColor: COLORS.black },
          ]}
        >
          <Image
            source={icons.close2}
            style={[
              { width: 18, height: 18 },
              dark
                ? { tintColor: Colors.light.tint }
                : { tintColor: Colors.dark.tint },
            ]}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            dark ? { color: Colors.dark.text } : { color: Colors.light.text },
          ]}
        >
          Notifications
        </Text>

        <TouchableOpacity
          onPress={() => handleMarkAllRead()}
          style={[
            styles.markAllButton,
            dark
              ? { backgroundColor: COLORS.dark2 }
              : { backgroundColor: COLORS.primary },
          ]}
        >
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Content */}
      <View style={styles.content}>
        <FlatList
          data={notificationData?.data || []}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <NotifiItem
              id={item.id?.toString()}
              icon={icons.notification}
              title={item.title}
              description={item.description}
              date={item.createdAt.split("T")[0]}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default NotificationPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginLeft: 10,
  },
  closeIcon: {
    padding: 5,
    marginRight: 18,
    borderRadius: 50,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
});
