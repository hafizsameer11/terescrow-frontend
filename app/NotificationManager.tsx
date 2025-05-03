import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, saveFcmTokenToServer } from '@/utils/notificationService';
import { useAuth } from '@/contexts/authContext';

export default function NotificationManager() {
  const { token, userData } = useAuth();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // System-level notification handler (for iOS foreground notifications)
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  // Push registration + listener setup
  useEffect(() => {
    if (!token || !userData?.id) return;

    const setupNotifications = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('storedExpoPushToken');
        const expoPushToken = await registerForPushNotificationsAsync();

        if (expoPushToken && storedToken !== expoPushToken) {
          await AsyncStorage.setItem('storedExpoPushToken', expoPushToken);
          await saveFcmTokenToServer(expoPushToken, token);
          console.log('✅ Expo Push Token saved for user:', userData.id);
        } else {
          console.log('ℹ️ Expo token already saved. Skipping...');
        }

        // Clean previous listeners
        notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
        responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);

        // Foreground receive
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
          console.log('📥 Notification received:', notification.request.content);
        });

        // Tap response
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          const body = response.notification.request.content.body || 'You have a new notification!';
          Alert.alert('📩 Notification', body);

          // Clear badge on tap
          Notifications.setBadgeCountAsync(0);
        });

      } catch (err) {
        console.error('❌ Notification setup failed:', err);
      }
    };

    setupNotifications();

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [token, userData?.id]);

  return null;
}
