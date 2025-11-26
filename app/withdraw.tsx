import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dummy bank accounts data
const bankAccounts = [
  {
    id: '1',
    accountName: 'Qmardeen Malik',
    accountNumber: '1239584226',
    bankName: 'Access Bank',
  },
  {
    id: '2',
    accountName: 'Qmardeen Malik',
    accountNumber: '1239584226',
    bankName: 'Kuda Bank',
  },
  {
    id: '3',
    accountName: 'Qmardeen Malik',
    accountNumber: '1239584226',
    bankName: 'Kuda Bank',
  },
];

const Withdraw = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    paymentMethod?: string;
  }>();

  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>(bankAccounts[0].id);
  const balance = 25000; // Dummy balance

  const handleCopyAccountNumber = async (accountNumber: string) => {
    await Clipboard.setStringAsync(accountNumber);
    // You could show a toast notification here
  };

  const handleAddNew = () => {
    navigate('addwithdrawaccount' as any);
  };

  const handleProceed = () => {
    if (!amount || !selectedAccount) {
      return;
    }
    const selectedAccountData = bankAccounts.find(acc => acc.id === selectedAccount);
    navigate('reviewwithdraw' as any, {
      amount: amount,
      accountName: selectedAccountData?.accountName,
      accountNumber: selectedAccountData?.accountNumber,
      bankName: selectedAccountData?.bankName,
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
      ]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image
            source={icons.arrowBack}
            style={[styles.backIcon, dark ? { tintColor: COLORS.black } : { tintColor: COLORS.black }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
          Withdraw
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructional Text */}
        <Text style={[styles.instructionText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
          Withdraw directly into your Nigerian bank account
        </Text>

        {/* Amount Input */}
        <View style={styles.inputSection}>
          <Input
            label=""
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            id="amount"
            variant="signin"
            placeholder="Amount"
          />
        </View>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceLabel, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Balance : N{balance.toLocaleString()}
          </Text>
        </View>

        {/* Select Withdrawal Account Section */}
        <View style={[styles.accountSection, { backgroundColor: '#E5FFF2' }]}>
          <View style={styles.accountSectionHeader}>
            <Text style={[styles.accountSectionTitle, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
              Select withdrawal account
            </Text>
            <TouchableOpacity onPress={handleAddNew}>
              <Text style={[styles.addNewText, { color: COLORS.primary }]}>Add new</Text>
            </TouchableOpacity>
          </View>

          {/* Bank Accounts List */}
          {bankAccounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountCard,
                selectedAccount === account.id
                  ? { backgroundColor: COLORS.primary }
                  : { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D4D4D4' },
              ]}
              onPress={() => setSelectedAccount(account.id)}
            >
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text
                style={[
                  styles.accountInfo,
                  selectedAccount === account.id ? { color: COLORS.white } : { color: COLORS.black },
                ]}
              >
                Account name: 
              </Text>
              <Text style={[styles.accountInfo,{fontSize:15}, 
                selectedAccount === account.id ? { color: COLORS.white } : { color: COLORS.black }]}>{account.accountName}</Text>
              </View>
              <View style={styles.accountNumberRow}>
                <Text
                  style={[
                    styles.accountInfo,
                    selectedAccount === account.id ? { color: COLORS.white } : { color: COLORS.black },
                  ]}
                >
                  Account number:
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center', gap:3,}}>
                <Text style={[styles.accountInfo,{fontSize:15}, selectedAccount === account.id ? { color: COLORS.white } : { color: COLORS.black }]}>{account.accountNumber}</Text>
                <TouchableOpacity
                  onPress={() => handleCopyAccountNumber(account.accountNumber)}
                  style={styles.copyButton}
                >
                  <Image
                    source={images.copy}
                    style={[
                      styles.copyIcon,
                      selectedAccount === account.id ? { tintColor: COLORS.white } : { tintColor: COLORS.black },
                    ]}
                    contentFit="contain"
                  />
                </TouchableOpacity>
                </View>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text
                style={[
                  styles.accountInfo,
                  selectedAccount === account.id ? { color: COLORS.white } : { color: COLORS.black },
                ]}
              >
                Bank name:
              </Text>
              <Text style={[styles.accountInfo,{fontSize:15}, selectedAccount === account.id ? { color: COLORS.white } : { color: COLORS.black }]}>{account.bankName}</Text>
                </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, (!amount || !selectedAccount) && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!amount || !selectedAccount}
      >
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Withdraw;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  instructionText: {
    fontSize: isTablet ? 14 : 14,
    fontWeight: '400',
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 12,
  },
  balanceContainer: {
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
  },
  accountSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    padding: 16,
    marginBottom: 24,
  },
  accountSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountSectionTitle: {
    fontSize: isTablet ? 16 : 12,
    fontWeight: '600',
    color: COLORS.black,
  },
  addNewText: {
    fontSize: isTablet ? 14 : 14,
    fontWeight: '600',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  accountCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  accountInfo: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    marginBottom: 8,
   
  },
  accountNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    width: 16,
    height: 16,
  },
  proceedButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 100,
  },
  proceedButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});

