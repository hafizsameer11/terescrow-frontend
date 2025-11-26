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

const Data = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const params = useLocalSearchParams<{
    selectedProvider?: string;
    selectedPlan?: string;
  }>();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(params.selectedProvider || null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(params.selectedPlan || null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [amount, setAmount] = useState('');
  const balance = 'N5,000';

  useFocusEffect(
    React.useCallback(() => {
      if (params.selectedProvider) {
        setSelectedProvider(params.selectedProvider);
      }
      if (params.selectedPlan) {
        setSelectedPlan(params.selectedPlan);
      }
    }, [params.selectedProvider, params.selectedPlan])
  );

  const handleSelectProvider = () => {
    navigate('providermodal' as any, {
      selectedProvider: selectedProvider || '',
      returnTo: 'data',
    });
  };

  const handleSelectPlan = () => {
    navigate('plantypemodal' as any, {
      selectedPlan: selectedPlan || '',
    });
  };

  const handleBuyData = () => {
    if (!selectedProvider || !selectedPlan || !mobileNumber || !amount) {
      return;
    }
    navigate('reviewdata' as any, {
      provider: selectedProvider,
      plan: selectedPlan,
      mobileNumber: mobileNumber,
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
          Data
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Select Provider */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={styles.providerSelector}
            onPress={handleSelectProvider}
          >
            {selectedProvider ? (
              <Text style={styles.selectorValue}>
                {selectedProvider}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Provider
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Select Plan */}
        <View style={[styles.inputSection, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={styles.providerSelector}
            onPress={handleSelectPlan}
          >
            {selectedPlan ? (
              <Text style={styles.selectorValue}>
                {selectedPlan}
              </Text>
            ) : (
              <Text style={styles.selectorPlaceholder}>
                Select Plan
              </Text>
            )}
            <Image
              source={icons.arrowDown}
              style={styles.arrowIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Mobile Number */}
        <View style={styles.inputSection}>
          <Input
            label="Enter Mobile Number"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            id="mobileNumber"
            variant="signin"
            placeholder="Enter Mobile Number"
          />
        </View>

        {/* Amount in Naira */}
        <View style={styles.inputSection}>
          <Input
            label="Amount in Naira"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            id="amount"
            variant="signin"
            placeholder="Amount in Naira"
          />
        </View>

        {/* Balance and Topup */}
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
            Balance: {balance}
          </Text>
          <TouchableOpacity style={styles.topupButton}>
            <Text style={styles.topupButtonText}>Topup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Buy Data Button */}
      <TouchableOpacity
        style={[styles.buyButton, (!selectedProvider || !selectedPlan || !mobileNumber || !amount) && styles.buyButtonDisabled]}
        onPress={handleBuyData}
        disabled={!selectedProvider || !selectedPlan || !mobileNumber || !amount}
      >
        <Text style={styles.buyButtonText}>Buy data</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Data;

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
  buyButton: {
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
  buyButtonDisabled: {
    backgroundColor: '#A2DFC2',
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});

