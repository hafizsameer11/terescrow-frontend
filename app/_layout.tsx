import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider } from '@/contexts/themeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '@/contexts/authContext';
import { SocketProvider } from '@/contexts/socketContext';
import toastConfig from '@/utils/toastConfig';
import { QueryClientWrapper } from '@/components/QueryClientWrapper';
import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientWrapper>
          <SocketProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="otpverification"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="setpinscreen"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="notificationpage"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="tercescrow"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="splashsteam"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="splashcrypto"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="setnewpassword"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="forgetpassword"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="successmodal"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="signin" options={{ headerShown: false }} />
              <Stack.Screen
                name="editprofile"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="updatekyclevel"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="instantuserschat"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="bvnverification"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="profilesecurity"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="changepassword"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="+not-found" />
              <Stack.Screen
                name="giftcardcategories"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="giftcardsubcategories"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="cryptosubcategories"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="cryptocategories"
                options={{ headerShown: false }}
              />
              {/* <Stack.Screen name="amazon" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="americanexpress" options={{ headerShown: false }}  /> */}
              <Stack.Screen
                name="connectingagent"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NotificationSettings"
                options={{ headerShown: false }}
              />
              {/* <Stack.Screen name="ebaycard" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="visacard" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="footlocker" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="googleplaycard" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="itunescard" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="nikecard" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="btc" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="usdt" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="eth" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="solana" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="shibuinu" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="dogecoin" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="usdc" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="bnb" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="toncoin" options={{ headerShown: false }}  /> */}
              {/* <Stack.Screen name="tron" options={{ headerShown: false }}  /> */}
              <Stack.Screen
                name="giftcardsold"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="giftcardbought"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="cryptosold"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="cryptobought"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="chatwithagent"
                options={{ headerShown: false }}
                // component={require('@/app/chatwithagent.rtsx')}
              />
              <Stack.Screen
                name="supportchat"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="allassets"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="assetdetail"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="selectasset"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="assetnetwork"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="swap"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="swapsuccess"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="referrals"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="withdrawaldetails"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="blockchainmodal"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="withdrawalsuccess"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="withdrawaccounts"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="addwithdrawaccount"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="billpayments"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="sendcrypto"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="receivecrypto"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="reviewcryptosend"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="buycrypto"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="currencymodal"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="paymentmethodmodal"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="buysummary"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="sellcrypto"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="sellsummary"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="fundwalletmodal"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="withdrawpaymentmethodmodal"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="withdraw"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="reviewwithdraw"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="switchwalletmodal"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="buygiftcards"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="giftcarddetail"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="countrymodal"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="giftcardtypemodal"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="giftcardpurchasesuccess"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="giftcarddetails"
                options={{ headerShown: false }}
              />
            </Stack>
          </SocketProvider>
          <Toast />
          <StatusBar style="auto" />
        </QueryClientWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
}
