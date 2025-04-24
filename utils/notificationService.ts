import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import axios from 'axios';

const API_URL = 'https://earlybaze.hmstech.xyz/api/set-fcm-token';

// Configure how notifications are handled when received
// Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//         shouldShowAlert: true,
//         shouldPlaySound: true,
//         shouldSetBadge: false,
//     }),
// });

/**
 * Function to request notification permissions and get the FCM push token
 */
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    try {
        // Step 1: Ensure the app is running on a physical device
        if (!Device.isDevice) {
            alert('Push notifications are only supported on physical devices.');
            console.warn('Device check failed: Not a physical device.');
            return null;
        }

        // Step 2: Get current notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('Existing Notification Permission Status:', existingStatus);

        let finalStatus = existingStatus;

        // Step 3: Request permissions if not granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            console.log('Updated Notification Permission Status:', finalStatus);
        }

        // Step 4: Handle denied permissions
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notifications. Permissions not granted.');
            console.error('Notification permissions not granted.');
            return null;
        }

        // Step 5: Get the FCM push token using getDevicePushTokenAsync
        const tokenData = await Notifications.getDevicePushTokenAsync();
        const fcmToken = tokenData.data;
        console.log('FCM Push Token Retrieved:', fcmToken);

        return fcmToken; // Return the FCM token for further use
    } catch (error) {
        console.error('Error while registering for push notifications:', error);
        return null;
    }
};

// Define the expected structure of the API response
interface ApiResponse {
    message: string;
    [key: string]: any; // Allow additional optional fields
}

/**
 * Function to send the FCM token to the backend
 */
export const saveFcmTokenToServer = async (fcmToken: string, authToken: string): Promise<void> => {
    try {
        const response = await axios.post<ApiResponse>(
            API_URL,
            { fcmToken }, // Sending the FCM token to the backend
            {
                headers: {
                    Authorization: `Bearer ${authToken}`, // Include the auth token in the headers
                },
            }
        );

        console.log('FCM token saved successfully:', response.data.message);
    } catch (error) {
        // Check if the error is an Axios error with a response
        if (axios.isAxiosError(error) && error.response) {
            console.error('Failed to save FCM token:', error.response.data);
        } else {
            console.error('Error saving FCM token:', error.message);
        }
    }
};
