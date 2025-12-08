import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ImageBackground, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useAuth } from '@/contexts/authContext';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getWalletOverview } from '@/utils/queries/accountQueries';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BalanceCard = () => {
  const { dark } = useTheme();
  const { userData, token } = useAuth();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Fetch wallet overview
  const { 
    data: walletData, 
    isLoading: walletLoading,
    isError: walletError,
  } = useQuery({
    queryKey: ['walletOverview'],
    queryFn: () => getWalletOverview(token),
    enabled: !!token,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Extract balance from API response
  const totalBalance = walletData?.data?.totalBalance || 0;
  const currency = walletData?.data?.currency || 'NGN';
  
  // Convert to Naira and Dollar (assuming 1 USD = 1500 NGN for now, or use actual conversion rate)
  const nairaBalance = currency === 'NGN' ? totalBalance : totalBalance * 1500; // Adjust conversion rate as needed
  const dollarBalance = currency === 'NGN' ? totalBalance / 1500 : totalBalance; // Adjust conversion rate as needed

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <ImageBackground
      source={images.balanceBackground}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Naira Balance</Text>
          <TouchableOpacity
            onPress={() => navigate('switchwalletmodal' as any)}
          >
            <Image
              source={icons.arrowDown}
              style={[styles.chevronIcon, { tintColor: '#FFFFFF' }]}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => setBalanceVisible(!balanceVisible)}
          style={styles.eyeButton}
        >
          <Image
            source={balanceVisible ? icons.eyecloseup : icons.hide}
            style={styles.eyeIcon}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Balance Amount */}
      <View style={styles.balanceSection}>
        {walletLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading balance...</Text>
          </View>
        ) : walletError ? (
          <Text style={styles.nairaBalance}>
            {balanceVisible ? 'N0.00' : 'N••••••'}
          </Text>
        ) : (
          <>
            <Text style={styles.nairaBalance}>
              {balanceVisible ? `N${formatBalance(nairaBalance)}` : 'N••••••'}
            </Text>
            <Text style={styles.dollarBalance}>
              {balanceVisible ? `≈ $${formatBalance(dollarBalance)}` : '= $••••••'}
            </Text>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigate('fundwalletmodal' as any)}
        >
          <Image
            source={icons.balanceicon1}
            style={styles.buttonIcon}
            contentFit="contain"
          />
          <Text style={styles.buttonText}>Fund Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigate('withdraw' as any, { paymentMethod: 'Bank Transfer' })}
        >
          <Image
            source={icons.balanceicon2}
            style={styles.buttonIcon}
            contentFit="contain"
          />
          <Text style={styles.buttonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default BalanceCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  backgroundImage: {
    borderRadius: 16,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 14,
    fontWeight: '500',
  },
  chevronIcon: {
    width: isTablet ? 20 : 16,
    height: isTablet ? 20 : 16,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    width: isTablet ? 24 : 20,
    height: isTablet ? 24 : 20,
    tintColor: '#FFFFFF',
  },
  balanceSection: {
    marginBottom: 24,
    flexDirection: 'row',
  },
  nairaBalance: {
    color: '#FFFFFF',
    fontSize: isTablet ? 36 : 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  dollarBalance: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 14,
    fontWeight: '400',
    opacity: 0.9,
    marginTop:15,
    marginLeft:10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEFEFE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonIcon: {
    width: isTablet ? 20 : 16,
    height: isTablet ? 20 : 16,
  },
  buttonText: {
    color: '#000',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    marginLeft: 8,
  },
});

