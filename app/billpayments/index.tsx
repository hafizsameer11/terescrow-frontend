import React from 'react';
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
import { useRouter, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const billPaymentOptions = [
  {
    id: '1',
    title: 'Airtime',
    subtitle: 'Buy airtime for variouus networks',
    icon: images.airtime,
    color: '#2196F3',
    lightColor: '#E3F2FD',
  },
  {
    id: '2',
    title: 'Data',
    subtitle: 'Get affordable data plans',
    icon: images.data,
    color: '#8BC34A',
    lightColor: '#F1F8E9',
  },
  {
    id: '3',
    title: 'Electricity',
    subtitle: 'Pay your electricity bills with ease',
    icon: images.electricity,
    color: '#4CAF50',
    lightColor: '#E8F5E9',
  },
  {
    id: '4',
    title: 'Cable TV',
    subtitle: 'Subscribe to your favorite tv plans',
    icon: images.cable,
    color: '#9C27B0',
    lightColor: '#F3E5F5',
  },
  {
    id: '5',
    title: 'Betting',
    subtitle: 'Fund your betting accounts',
    icon: images.betting,
    color: '#F44336',
    lightColor: '#FFEBEE',
  },
];

const BillPayments = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();

  const handleOptionPress = (option: typeof billPaymentOptions[0]) => {
    if (option.id === '1') {
      // Navigate to Airtime screen
      navigate('airtime' as any);
    } else if (option.id === '2') {
      // Navigate to Data screen
      navigate('data' as any);
    } else if (option.id === '3') {
      // Navigate to Electricity screen
      navigate('electricity' as any);
    } else if (option.id === '4') {
      // Navigate to Cable TV screen
      navigate('cabletv' as any);
    } else if (option.id === '5') {
      // Navigate to Betting screen
      navigate('betting' as any);
    }
    // Add other navigation handlers as needed
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
          Bill Payment
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {billPaymentOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' },
            ]}
            onPress={() => handleOptionPress(option)}
          >
            <View style={[styles.iconContainer, { backgroundColor: option.lightColor }]}>
              <Image
                source={option.icon}
                style={styles.optionIcon}
                contentFit="contain"
              />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                {option.title}
              </Text>
              <Text style={[styles.optionSubtitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                {option.subtitle}
              </Text>
            </View>
            <Image
              source={icons.arrowRight}
              style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
              contentFit="contain"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillPayments;

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
    paddingBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F7F7F7',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIcon: {
    width: 24,
    height: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
  },
  arrowIcon: {
    width: 20,
    height: 20,
    marginLeft: 12,
  },
});

