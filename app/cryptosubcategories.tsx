import React, { useEffect } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { COLORS, icons, images } from '@/constants';
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
import { NavigationProp, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import {
  getSubCategories,
  ICategoryResponse,
} from '@/utils/queries/quickActionQueries';
import { useAuth } from '@/contexts/authContext';

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

const CryptoScreen = () => {
  const { dark } = useTheme();
  const { navigate, goBack } = useNavigation<NavigationProp<any>>();
  const router = useRouter();
  const [blockChain, setBlockchain] = React.useState<string>('');
  const route = useRoute();
  const {
    departmentId,
    categoryData,
    departmentTitle
  }: {
    departmentId: string;
    departmentTitle:string;
    categoryData: ICategoryResponse['data']['categories'][number]['category'];
  } = route.params as any;
  if (!departmentId || !categoryData) {
    return goBack();
  }
  const [amount, setAmount] = React.useState('');
  const [quantity, setQuantity] = React.useState(0);
  const [selectedBlockchainId, setSelectedBlockchainId] = React.useState('');
  const [blockchains, setBlockchains] =
    React.useState<{ id: number; title: string }[]>();
  const { token } = useAuth();
  const {
    data: subcategoriesData,
    isLoading: isLoadingSubcategories,
    isError: isErrorSubcategories,
    error: errorSubcategories,
  } = useQuery({
    queryKey: [departmentId, categoryData.id.toString(), 'subcategories'],
    queryFn: () =>
      getSubCategories(token, departmentId, categoryData.id.toString()),
  });

  const setFieldValue = (field: string, value: any) => {
    console.log(value);
    setBlockchain(field);
    console.log('Selected Blockchain value:', field);
    setSelectedBlockchainId(value);
  };

  const handleNavigateToAgentConnection = () => {
    if (selectedBlockchainId && token) {
      navigate('connectingagent', {
        departmentId,
        categoryId: categoryData.id.toString(),
        categorytitle:categoryData.title,
        subCategoryId: selectedBlockchainId,
        departmentTitle: departmentTitle,
        amount,
        subcategorytitle: blockChain,
        quantity: '',
        icon:categoryData.image,
        type:"",
      });
    }
  };

  useEffect(() => {
    const options = subcategoriesData?.data?.subCategories;
    if (options) {
      setBlockchains(
        options.map((option) => ({
          id: option.subCategory.id,
          title: option.subCategory.title,
        }))
      );
    }
  }, [subcategoriesData]);

  useEffect(() => {
    if (selectedBlockchainId) {
      const blockChain = subcategoriesData?.data?.subCategories.find(
        (option) => option.subCategory.id === +selectedBlockchainId
      );
      if (blockChain?.subCategory.price) {
        setQuantity(+amount / blockChain.subCategory.price);
      }
    }
  }, [amount]);
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

        {/* <View style={{ marginTop: 24 }}></View>
        <CounterInput
          counter={quantity ? +quantity.toFixed(2) : 0.0}
          type="quantity"
          text="Quantity"
        /> */}

        <View style={{ marginTop: 18 }}></View>
        {blockchains && (
          <CustomSelect
            placeholder="Select Blockchain"
            setFieldValue={setFieldValue}
            currValue={selectedBlockchainId}
            id="blockchain"
            options={blockchains}
            modalLabel="Blockchain"
          />
        )}
      </View>
    );
  };

  return (
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
          {<NavigateBack text={categoryData.title} />}
          <CryptoCardCom
            card={categoryData.image || images.cryptoCard}
          />
          {/* <InformationFields /> */}
          {renderInformationFields()}
        </ScrollView>
        <View style={styles.footer}>
          <Button title="Proceed" onPress={handleNavigateToAgentConnection} />
        </View>
      </View>
    </SafeAreaView>
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
