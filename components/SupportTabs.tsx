import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '@/constants';
import { useTheme } from '@/contexts/themeContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface SupportTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SupportTabs: React.FC<SupportTabsProps> = ({ activeTab, onTabChange }) => {
  const { dark } = useTheme();

  const tabs = ['All', 'Completed', 'Processing'];

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
                !isActive && { color: dark ? COLORS.white : '#616161' },
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

export default SupportTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    gap: 0,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#147341',
  },
  tabText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    color: '#121212',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

