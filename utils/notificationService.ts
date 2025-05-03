import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import axios from 'axios';

const API_URL = 'https://46.202.154.203/api/customer/utilities/sve-fcm-token';

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
      if (!Device.isDevice) {
        alert('Push notifications are only supported on physical devices.');
        return null;
      }
  
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
  
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
  
      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted.');
        return null;
      }
  
      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
      console.log('Expo Push Token:', expoPushToken);
      return expoPushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
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
