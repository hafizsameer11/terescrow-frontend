import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert, AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { registerForPushNotificationsAsync, saveFcmTokenToServer } from '@/utils/notificationService';
// import { registerForPushNotificationsAsync, saveFcmTokenToServer } from '@/utils/notificationService';

export default function NotificationManager({ token, user }: { token: string, user: any }) {
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);
    const appState = useRef(AppState.currentState);
    const userId = user?.id;

    // Notification handler (system-level)
    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async (notification) => {
                const notifUserId = notification?.request?.content?.data?.userId;

                if (parseInt(notifUserId) === userId) {
                    return {
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: true,
                    };
                }

                return {
                    shouldShowAlert: false,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                };
            }
        });
    }, [userId]);

    useEffect(() => {
        if (!token || !userId) return;

        const setupNotifications = async () => {
            const fcmToken = await registerForPushNotificationsAsync();
            if (fcmToken) {
                await saveFcmTokenToServer(fcmToken, token);
                console.log('✅ FCM token saved for user:', userId);
            }

            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }

            notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
                const notifUserId = notification.request.content.data?.userId;
                console.log('📥 Notification received (background):', notification.request.content);
                if (parseInt(notifUserId) === userId) {
                    console.log('📥 Notification received (foreground):', notification.request.content);
                }
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
                const notifUserId = response.notification.request.content.data?.userId;
                if (parseInt(notifUserId) === userId) {
                    const body = response.notification.request.content.body || 'You have a new message!';
                    Alert.alert('📩 Notification', body);
                }
            });
        };

        setupNotifications();

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [token, userId]);

    return null;
}
