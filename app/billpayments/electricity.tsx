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
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import Input from '@/components/CustomInput';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Electricity = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    selectedBiller?: string;
    selectedAccountType?: string;
  }>();
  const [selectedBiller, setSelectedBiller] = useState<string | null>(params.selectedBiller || null);
  const [selectedAccountType, setSelectedAccountType] = useState<string | null>(params.selectedAccountType || null);
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const balance = 'N5,000';

  useFocusEffect(
    React.useCallback(() => {
      if (params.selectedBiller) {
        setSelectedBiller(params.selectedBiller);
      }
      if (params.selectedAccountType) {
        setSelectedAccountType(params.selectedAccountType);
      }
    }, [params.selectedBiller, params.selectedAccountType])
  );

  const handleSelectBiller = () => {
    navigate('billertypemodal' as any, {
      selectedBiller: selectedBiller || '',
    });
  };

  const handleSelectAccountType = () => {
    navigate('accounttypemodal' as any, {
      selectedAccountType: selectedAccountType || '',
    });
  };

  const handleProceed = () => {
    if (!selectedBiller || !selectedAccountType || !meterNumber || !amount) {
      return;
    }
    navigate('reviewelectricity' as any, {
      biller: selectedBiller,
      accountType: selectedAccountType,
      meterNumber: meterNumber,
      amount: amount,
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
          Electricity
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Select Biller Type */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={styles.providerSelector}
            onPress={handleSelectBiller}
          >
            {selectedBiller ? (
              <Text style={styles.selectorValue}>
                {selectedBiller}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Biller Type
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Select Account Type */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={styles.providerSelector}
            onPress={handleSelectAccountType}
          >
            {selectedAccountType ? (
              <Text style={styles.selectorValue}>
                {selectedAccountType}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Account Type
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Meter Number */}
        <View style={styles.inputSection}>
          <Input
            label="Enter Meter Number"
            keyboardType="phone-pad"
            value={meterNumber}
            onChangeText={setMeterNumber}
            id="meterNumber"
            variant="signin"
            placeholder="Enter Meter Number"
          />
        </View>

        {/* Amount */}
        <View style={styles.inputSection}>
          <Input
            label="Enter Amount"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            id="amount"
            variant="signin"
            placeholder="Enter Amount"
          />
        </View>

        {/* Balance and Topup */}
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Balance: {balance}
          </Text>
          <TouchableOpacity 
            style={styles.topupButton}
            onPress={() => navigate('fundwalletmodal' as any)}
          >
            <Text style={styles.topupButtonText}>Topup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, (!selectedBiller || !selectedAccountType || !meterNumber || !amount) && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!selectedBiller || !selectedAccountType || !meterNumber || !amount}
      >
        <Text style={styles.proceedButtonText}>Proceed</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Electricity;

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
  inputSection: {
    // marginBottom: 20,
  },
  providerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    backgroundColor: '#FEFEFE',
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1e1e1e',
    flex: 1,
  },
  selectorPlaceholder: {
    fontSize: 16,
    fontWeight: '400',
    color: '#989898',
    flex: 1,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#989898',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: isTablet ? 16 : 12,
    fontWeight: '400',
  },
  topupButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topupButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 14 : 10,
    fontWeight: '400',
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

