import { Stack } from 'expo-router';

export default function BillPaymentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="airtime"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="providermodal"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="reviewairtime"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="pinmodal"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="purchasesuccess"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="data"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="plantypemodal"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="reviewdata"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="electricity"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="billertypemodal"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="accounttypemodal"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="reviewelectricity"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="cabletv"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="cablebillertypemodal"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="billplanmodal"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="reviewcabletv"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="betting"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="bettingsitemodal"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="reviewbetting"
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack>
  );
}

