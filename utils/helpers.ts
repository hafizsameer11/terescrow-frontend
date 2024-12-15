import Toast from 'react-native-toast-message';

export const showTopToast = (props: showTopToastProps) => {
  Toast.show({
    type: props.type,
    text1: props.text1,
    text2: props.text2,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
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
    if (user.userId === agentId) {
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
