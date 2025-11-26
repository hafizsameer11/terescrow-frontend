import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// DSTV plans - in real app, this would come from API based on selected biller
const dstvPlans = [
  { id: '1', name: 'DSTV Yanga', price: 'NGN3,500' },
  { id: '2', name: 'DSTV Confam', price: 'NGN30,600' },
  { id: '3', name: 'DSTV Padi', price: 'NGN30,600' },
  { id: '4', name: 'DSTV Compact', price: 'NGN30,600' },
  { id: '5', name: 'DSTV Compact Plus', price: 'NGN30,600' },
  { id: '6', name: 'DSTV Premium', price: 'NGN30,600' },
];

const BillPlanModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    selectedBillPlan?: string;
    biller?: string;
  }>();

  const [selectedBillPlan, setSelectedBillPlan] = useState<string | null>(params.selectedBillPlan || null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = dstvPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.price.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (planName: string) => {
    setSelectedBillPlan(planName);
    // Find the plan to get its price
    const selectedPlan = dstvPlans.find(p => p.name === planName);
    const planPrice = selectedPlan ? selectedPlan.price.replace('NGN', '').replace(/,/g, '') : '3500';
    
    router.back();
    // Use a small delay to ensure navigation completes
    setTimeout(() => {
      router.push({
        pathname: '/billpayments/cabletv',
        params: {
          selectedBillPlan: planName,
          selectedBiller: params.biller,
          planAmount: planPrice,
        },
      } as any);
    }, 100);
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={() => router.back()}
    >
      <Pressable style={styles.modalOverlay} onPress={() => router.back()}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView
            style={[
              styles.container,
              dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
            ]}
            edges={[]}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                SELECT BILL PLAN
              </Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' }]}>
              <Image
                source={icons.search}
                style={[styles.searchIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                contentFit="contain"
              />
              <TextInput
                style={[styles.searchInput, dark ? { color: COLORS.white } : { color: COLORS.black }]}
                placeholder="Search"
                placeholderTextColor={dark ? COLORS.greyscale500 : COLORS.greyscale600}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Plans List */}
            <FlatList
              data={filteredPlans}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.planItem,
                    dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                  ]}
                  onPress={() => handleSelect(item.name)}
                >
                  <View style={styles.planInfo}>
                    <Text
                      style={[
                        styles.planName,
                        dark ? { color: COLORS.white } : { color: COLORS.black },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.planPrice,
                        dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
                      ]}
                    >
                      {item.price}
                    </Text>
                  </View>
                  <Image
                    source={icons.arrowRight}
                    style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#E5E5E5' },
                  ]}
                />
              )}
              contentContainerStyle={styles.listContent}
            />
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BillPlanModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: isTablet ? 18 : 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#F7F7F7',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
  },
  listContent: {
    paddingBottom: 20,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
});

