import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useAuth } from '@/contexts/authContext';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BalanceCard = () => {
  const { dark } = useTheme();
  const { userData } = useAuth();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [balanceVisible, setBalanceVisible] = useState(true);

  // TODO: Replace with actual balance from API when available
  const nairaBalance = (userData as any)?.nairaBalance || 0;
  const dollarBalance = (userData as any)?.dollarBalance || 0;

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
        <Text style={styles.nairaBalance}>
          {balanceVisible ? `N${formatBalance(nairaBalance)}` : 'N••••••'}
        </Text>
        <Text style={styles.dollarBalance}>
          {balanceVisible ? `≈ $${formatBalance(dollarBalance)}` : '= $••••••'}
        </Text>
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
          onPress={() => navigate('withdrawpaymentmethodmodal' as any)}
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
});

