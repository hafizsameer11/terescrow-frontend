import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, saveFcmTokenToServer } from '@/utils/notificationService';
import { useAuth } from '@/contexts/authContext';

export default function NotificationManager() {
  const { token, userData } = useAuth();
  const userId = userData?.id;

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // System-level handler (required for iOS foreground behavior)
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const notifUserId = notification?.request?.content?.data?.userId;

        return {
          shouldShowAlert: String(notifUserId) === String(userId),
          shouldPlaySound: String(notifUserId) === String(userId),
          shouldSetBadge: String(notifUserId) === String(userId),
        };
      },
    });
  }, [userId]);

  // Push registration + listener setup
  useEffect(() => {
    if (!token || !userId) return;

    const setupNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem('storedFcmToken');
        const fcmToken = await registerForPushNotificationsAsync();

        if (fcmToken && stored !== fcmToken) {
          await saveFcmTokenToServer(fcmToken, token);
          await AsyncStorage.setItem('storedFcmToken', fcmToken);
          console.log('✅ FCM token saved for user:', userId);
        } else {
          console.log('ℹ️ FCM token already saved. Skipping...');
        }

        // Clean existing listeners if any
        notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
        responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);

        // Foreground + background receive
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
          console.log('📥 Notification received:', notification.request.content);
        });

        // Tap response
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          const body = response.notification.request.content.body || 'You have a new message!';
          Alert.alert('📩 Notification', body);
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
  }, [token, userId]);

  return null;
}
