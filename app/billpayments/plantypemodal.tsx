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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getBillPaymentItems, IBillPaymentItem } from '@/utils/queries/accountQueries';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const PlanTypeModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    selectedPlan?: string;
    selectedItemId?: string;
    sceneCode?: 'airtime' | 'data' | 'betting';
    billerId?: string;
  }>();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(params.selectedPlan || null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(params.selectedItemId || null);
  const [searchQuery, setSearchQuery] = useState('');

  const sceneCode = params.sceneCode || 'data';
  const billerId = params.billerId || '';

  // Fetch items from API
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['billPaymentItems', sceneCode, billerId],
    queryFn: () => getBillPaymentItems(token, sceneCode, billerId),
    enabled: !!token && !!billerId && !!sceneCode,
  });

  const items: IBillPaymentItem[] = itemsData?.data?.items?.data || [];
  const activeItems = items.filter(item => item.status === 1);

  const formatAmount = (amount: number) => {
    return `NGN${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
  };

  const filteredItems = activeItems.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    formatAmount(item.amount).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: IBillPaymentItem) => {
    setSelectedPlan(item.itemName);
    setSelectedItemId(item.itemId);
    router.back();
    // Use a small delay to ensure navigation completes
    setTimeout(() => {
      let pathname = '/billpayments/data';
      if (sceneCode === 'airtime') {
        pathname = '/billpayments/airtime';
      } else if (sceneCode === 'betting') {
        pathname = '/billpayments/betting';
      }
      router.push({
        pathname: pathname as any,
        params: {
          selectedPlan: item.itemName,
          selectedItemId: item.itemId,
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
                PLAN TYPE
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
            {itemsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Loading plans...
                </Text>
              </View>
            ) : !itemsData ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  Unable to load plans. Please try again.
                </Text>
              </View>
            ) : itemsData?.data?.items?.status === false ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  {itemsData?.data?.items?.respMsg || 'No plans available for this provider'}
                </Text>
              </View>
            ) : itemsData?.data?.items?.data === null || itemsData?.data?.items?.data?.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  No plans available for this provider. Please try another provider.
                </Text>
              </View>
            ) : activeItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  No active plans available for this provider.
                </Text>
              </View>
            ) : filteredItems.length === 0 && searchQuery ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                  No plans match your search. Try a different search term.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.itemId}
                renderItem={({ item }) => {
                  // Format amount - if isFixAmount is 1, show fixed amount, otherwise show range
                  const amountDisplay = item.isFixAmount === 1
                    ? formatAmount(item.amount)
                    : item.minAmount && item.maxAmount
                      ? `${formatAmount(item.minAmount)} - ${formatAmount(item.maxAmount)}`
                      : formatAmount(item.amount);

                  return (
                    <TouchableOpacity
                      style={[
                        styles.planItem,
                        dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <View style={styles.planInfo}>
                        <Text
                          style={[
                            styles.planName,
                            dark ? { color: COLORS.white } : { color: COLORS.black },
                          ]}
                        >
                          {item.itemName}
                        </Text>
                        <Text
                          style={[
                            styles.planPrice,
                            dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
                          ]}
                        >
                          {amountDisplay}
                        </Text>
                      </View>
                      <Image
                        source={icons.arrowRight}
                        style={[styles.arrowIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: COLORS.greyscale600 }]}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  );
                }}
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
            )}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PlanTypeModal;

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.greyscale600,
    textAlign: 'center',
  },
});

