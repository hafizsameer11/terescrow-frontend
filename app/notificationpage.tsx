import React from "react";
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

const data = [
  {
    id: "1",
    icon: icons.notification,
    title: "New Message Received",
    description: "You have a new message from John. It is a dummy content",
    dateTime: "Aug 26, 2023, 9:28 AM",
  },
  {
    id: "2",
    icon: icons.notification,
    title: "Event Reminder",
    description:
      "Don't forget about the team meeting at 3 PM. It is a dummy content",
    dateTime: "Aug 26, 2023, 8:15 AM",
  },
  {
    id: "3",
    icon: icons.notification,
    title: "System Update",
    description:
      "Your system has been updated successfully. It is a dummy content",
    dateTime: "Aug 25, 2023, 7:42 PM",
  },
];

const NotificationPage: React.FC = () => {
  const router = useRouter();
  const { dark } = useTheme();
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
      </View>

      {/* Notification Content */}
      <View style={styles.content}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotifiItem
              id={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              date={item.dateTime}
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
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
});
