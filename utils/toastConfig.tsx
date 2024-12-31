import Toast, { BaseToast } from 'react-native-toast-message';

const toastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <BaseToast
      {...rest}
      style={{ borderLeftColor: 'green', backgroundColor: '#e6f9e6' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'green' }}
      text2Style={{ fontSize: 14, color: 'black' }} // Ensure secondary text is visible
    />
  ),
  error: ({ text1, text2, ...rest }) => (
    <BaseToast
      {...rest}
      style={{ borderLeftColor: 'red', backgroundColor: '#ffe6e6' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
      text2Style={{ fontSize: 14, color: 'black' }} // Ensure secondary text is visible
    />
  ),
};

export default toastConfig;
