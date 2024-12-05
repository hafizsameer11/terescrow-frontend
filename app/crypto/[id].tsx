import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { COLORS, icons } from '@/constants';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/contexts/themeContext';
import CounterInput from '@/components/CounterInput';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigateBack from '@/components/NavigateBack';
import CryptoCardCom from '@/components/CryptoCardCom';
import CustomSelect from '@/components/CustomSelect';
import Button from '@/components/Button';

// Define the data structure for crypto
interface CryptoData {
  id: string;
  icon: string;
  text: string;
}

const cryptoData: CryptoData[] = [
  { id: '1', icon: icons.btc, text: 'Bitcoin Wallet' },
  { id: '2', icon: icons.usdt, text: 'Tether Wallet' },
  { id: '3', icon: icons.eth, text: 'Ethereum Wallet' },
  { id: '4', icon: icons.solana, text: 'Tether Wallet' },
  { id: '5', icon: icons.shibaInu, text: 'Tether Wallet' },
  { id: '6', icon: icons.dogeCoin, text: 'Tether Wallet' },
  { id: '7', icon: icons.dollarCoin, text: 'Ethereum Wallet' },
  { id: '8', icon: icons.bnb, text: 'Tether Wallet' },
  { id: '9', icon: icons.tonCoin, text: 'Ethereum Wallet' },
  { id: '10', icon: icons.tron, text: 'Tether Wallet' },
];

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
  { value: '4', label: 'Option 4' },
];

const CryptoScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>(); // Retrieve dynamic `id`
  const { dark } = useTheme();
  const router = useRouter();
  const [amount, setAmount] = React.useState('');
  const [selectedBlockchain, setSelectedBlockchain] = React.useState('');
  // Find the crypto data for the given id
  const cryptoDataItem = cryptoData.find((item) => item.id === id);

  if (!cryptoDataItem) {
    return null; // Optionally, render an error message or fallback view
  }

  const setFieldValue = (field: string, value: any) => {
    setSelectedBlockchain(value);
  };

  const renderInformationFields = () => {
    return (
      <View style={styles.inputFieldsContainer}>
        {/* Regular Input */}
        <TextInput
          style={[
            styles.input,
            dark ? { color: Colors.dark.text } : { color: Colors.light.text },
          ]}
          keyboardType="numeric"
          placeholder="Enter amount in USD"
          placeholderTextColor={'#888'}
          value={amount}
          onChangeText={(value) => setAmount(value)}
        />

        <View style={{ marginTop: 24 }}></View>
        <CounterInput
          counter={amount ? +(+amount * 0.22).toFixed(2) : 0.0}
          type="quantity"
          text="Quantity"
        />

        <View style={{ marginTop: 18 }}></View>
        <CustomSelect
          placeholder="Select Blockchain"
          setFieldValue={setFieldValue}
          currValue={selectedBlockchain}
          id="blockchain"
          options={options}
          modalLabel="Blockchain"
        />
      </View>
    );
  };

  return (
    <>
      {/* Disable the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={[
          { flex: 1 },
          dark
            ? { backgroundColor: COLORS.black }
            : { backgroundColor: COLORS.white },
        ]}
      >
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <NavigateBack text={cryptoDataItem.text} />
            <CryptoCardCom card={cryptoDataItem.icon} />
            {/* <InformationFields /> */}
            {renderInformationFields()}
          </ScrollView>
          <View style={styles.footer}>
            <Button
              title="Proceed"
              onPress={() => {
                router.push('/connectingagent');
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default CryptoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  footer: {
    position: 'relative',
    bottom: 0,
    width: '100%',
    padding: 10,
  },
  inputFieldsContainer: {
    flex: 1,
    marginTop: 24,
    marginHorizontal: 16,
  },
  input: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.greyscale300,
  },
});
