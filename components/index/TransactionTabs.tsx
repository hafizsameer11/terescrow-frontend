import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '@/constants';
import { useTheme } from '@/contexts/themeContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface TransactionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TransactionTabs: React.FC<TransactionTabsProps> = ({ activeTab, onTabChange }) => {
  const { dark } = useTheme();

  const tabs = ['All', 'Gift Cards', 'Crypto', 'Bill Payments'];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              isActive && styles.activeTab,
            ]}
            onPress={() => onTabChange(tab)}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
                !isActive && { color: dark ? COLORS.white : COLORS.black },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TransactionTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    gap: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#030303',
  },
  tabText: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    color: '#121212',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

