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

interface showTopToastProps {
  type: 'error' | 'success' | 'info';
  text1: string;
  text2: string;
}
