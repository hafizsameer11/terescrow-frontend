import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { ThemeProvider } from "@/contexts/themeContext";

import { useColorScheme } from "@/hooks/useColorScheme";
import Toast from "react-native-toast-message";

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
      <Stack>
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="otpverification" options={{ headerShown: false }} />
        <Stack.Screen
          name="setpinscreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="notificationpage" options={{ headerShown: false }} />
        <Stack.Screen name="tercescrow" options={{ headerShown: false }} />
        <Stack.Screen name='splashsteam' options={{ headerShown: false }} />
        <Stack.Screen name="splashcrypto" options={{ headerShown: false }} />
        <Stack.Screen name="setnewpassword" options={{ headerShown: false }} />
        <Stack.Screen name="forgetpassword" options={{ headerShown: false }} />
        <Stack.Screen name="successmodal" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ headerShown: false }} />
        <Stack.Screen name='editprofile' options={{ headerShown: false }} />
        <Stack.Screen name="updatekyclevel" options={{ headerShown: false }} />
        <Stack.Screen name="instantuserschat" options={{ headerShown: false }} />
        <Stack.Screen name="bvnverification" options={{ headerShown: false }} />
        <Stack.Screen name="profilesecurity" options={{ headerShown: false }} />
        <Stack.Screen name="changepassword" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="sellgiftcard" options={{ headerShown: false }} />

        <Stack.Screen name="buygiftcard" options={{ headerShown: false }} />
        <Stack.Screen name="sellcrypto" options={{ headerShown: false }}  />
        <Stack.Screen name="buycrypto" options={{ headerShown: false }}  />
        {/* <Stack.Screen name="amazon" options={{ headerShown: false }}  /> */}
        {/* <Stack.Screen name="americanexpress" options={{ headerShown: false }}  /> */}
        <Stack.Screen name="connectingagent" options={{ headerShown: false }}  />
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
        <Stack.Screen name="giftcardsold" options={{ headerShown: false }}  />
        <Stack.Screen name="giftcardbought" options={{ headerShown: false }}  />
        <Stack.Screen name="cryptosold" options={{ headerShown: false }}  />
        <Stack.Screen name="cryptobought" options={{ headerShown: false }}  />
        <Stack.Screen name="chatwithagent" options={{ headerShown: false }}  />
      </Stack>
      <Toast />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
