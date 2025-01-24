import Toast from 'react-native-toast-message';
import { API_BASE_URL } from './apiConfig';

export const showTopToast = (props: showTopToastProps) => {
  Toast.show({

    type: props.type,
    text1: props.text1,
    text2: props.text2,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,

    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    text1Style: {
      color: 'black', // White text for better contrast
      fontSize: 16,
      fontWeight: 'bold',

    },
    text2Style: {
      color: 'black', // Optional for additional details
      fontSize: 14,
    },
  });
};

export const checkOnlineStatus = (
  agentId: any,
  onlineUsers: { userId: string; socketId: string }[]
) => {
  console.log(onlineUsers);
  let isOnline = false;

  if (!agentId) return isOnline;
  onlineUsers.forEach((user) => {
    if (user.userId == agentId) {
      isOnline = true;
    }
  });
  return isOnline;
};

interface showTopToastProps {
  type: 'error' | 'success' | 'info';
  text1: string;
  text2: string;
}
export const getImageUrl = (imageName: string): string => {
  return `${API_BASE_URL}/uploads/${imageName}`;
};