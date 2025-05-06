import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerForPushNotificationsAsync,
  saveFcmTokenToServer,
} from '@/utils/notificationService';
import { useAuth } from '@/contexts/authContext';

export default function NotificationManager() {
  const { token, userData } = useAuth();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Set iOS foreground notification behavior
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  useEffect(() => {
    if (!token || !userData?.id) return;

    let isActive = true;

    const setupNotifications = async () => {
      try {
        const expoPushToken = await registerForPushNotificationsAsync();
        if (!expoPushToken) throw new Error('No push token retrieved');

        const userTokenKey = `expoPushToken_user_${userData.id}`;
        const savedToken = await AsyncStorage.getItem(userTokenKey);

        if (savedToken !== expoPushToken) {
          await AsyncStorage.setItem(userTokenKey, expoPushToken);
          await saveFcmTokenToServer(expoPushToken, token);
          console.log(`✅ Push token saved for user ${userData.id}`);
        } else {
          console.log(`ℹ️ Push token already exists for user ${userData.id}`);
        }

        // Cleanup old listeners
        if (notificationListener.current)
          Notifications.removeNotificationSubscription(notificationListener.current);
        if (responseListener.current)
          Notifications.removeNotificationSubscription(responseListener.current);

        if (!isActive) return;

        // Foreground notifications
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
          console.log('📥 Notification received:', notification.request.content);
        });

        // Notification tap response
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          const body = response.notification.request.content.body || 'You have a new notification!';
          Alert.alert('📩 Notification', body);
          Notifications.setBadgeCountAsync(0);
        });
      } catch (error) {
        console.error('❌ Error during notification setup:', error);
      }
    };

    setupNotifications();

    return () => {
      isActive = false;
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
        notificationListener.current = null;
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
        responseListener.current = null;
      }
    };
  }, [token, userData?.id]);

  return null;
}
