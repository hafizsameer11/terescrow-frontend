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
import { getBillers, IBiller } from '@/utils/queries/accountQueries';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const ProviderModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    selectedProvider?: string;
    selectedBillerId?: string;
    returnTo?: string;
    sceneCode?: 'airtime' | 'data' | 'betting';
  }>();

  const [selectedProvider, setSelectedProvider] = useState<string | null>(params.selectedProvider || null);
  const [selectedBillerId, setSelectedBillerId] = useState<string | null>(params.selectedBillerId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const returnTo = params.returnTo || 'airtime';
  const sceneCode = params.sceneCode || (returnTo === 'data' ? 'data' : returnTo === 'betting' ? 'betting' : 'airtime');

  // Fetch billers from API
  const { data: billersData, isLoading: billersLoading } = useQuery({
    queryKey: ['billers', sceneCode],
    queryFn: () => getBillers(token, sceneCode),
    enabled: !!token && !!sceneCode,
  });

  const billers: IBiller[] = billersData?.data?.billers?.data || [];
  const activeBillers = billers.filter(b => b.status === 1);
  
  // Filter billers based on search query
  const filteredBillers = activeBillers.filter(biller =>
    biller.billerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    biller.billerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (biller: IBiller) => {
    setSelectedProvider(biller.billerName);
    setSelectedBillerId(biller.billerId);
    router.back();
    // Use a small delay to ensure navigation completes
    setTimeout(() => {
      const pathname = returnTo === 'data' ? '/billpayments/data' : returnTo === 'betting' ? '/billpayments/betting' : '/billpayments/airtime';
      // Use different param names based on returnTo
      const params: any = {
        selectedBillerId: biller.billerId,
      };
      if (returnTo === 'betting') {
        params.selectedBettingSite = biller.billerName;
      } else {
        params.selectedProvider = biller.billerName;
      }
      router.push({
        pathname: pathname as any,
        params,
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
                PROVIDER
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
                placeholder="Search provider"
                placeholderTextColor={dark ? COLORS.greyscale500 : COLORS.greyscale600}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Provider List */}
            {billersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Loading providers...
                </Text>
              </View>
            ) : activeBillers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  No providers available
                </Text>
              </View>
            ) : filteredBillers.length === 0 && searchQuery ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  No providers match your search. Try a different search term.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredBillers}
                keyExtractor={(item) => item.billerId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.providerItem,
                      dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.providerLogoContainer}>
                      {item.billerIcon ? (
                        <Image
                          source={{ uri: item.billerIcon }}
                          style={styles.providerLogo}
                          contentFit="contain"
                        />
                      ) : (
                        <View style={[styles.providerLogoPlaceholder, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#F7F7F7' }]} />
                      )}
                    </View>
                    <View style={styles.providerInfo}>
                      <Text
                        style={[
                          styles.providerName,
                          dark ? { color: COLORS.white } : { color: COLORS.black },
                        ]}
                      >
                        {item.billerName}
                      </Text>
                      {(item.minAmount !== null || item.maxAmount !== null) && (
                        <Text
                          style={[
                            styles.amountRange,
                            dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 },
                          ]}
                        >
                          {item.minAmount !== null && item.maxAmount !== null
                            ? `₦${(item.minAmount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ₦${(item.maxAmount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : item.minAmount !== null
                            ? `From ₦${(item.minAmount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : item.maxAmount !== null
                            ? `Up to ₦${(item.maxAmount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : ''}
                        </Text>
                      )}
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
            )}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProviderModal;

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
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '48%',
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? 16 : 13,
    fontWeight: '400',
    color: '#8A8A8A',
    textTransform: 'uppercase',
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
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  providerLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  providerLogo: {
    width: 40,
    height: 40,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  amountRange: {
    fontSize: isTablet ? 12 : 11,
    fontWeight: '400',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  separator: {
    height: 1,
    marginLeft: 52,
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
  },
  providerLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
  },
});

