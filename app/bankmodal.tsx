import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getBanks, IBank } from '@/utils/queries/accountQueries';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BankModal = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const params = useLocalSearchParams<{
    selectedBankCode?: string;
    selectedBankName?: string;
    returnTo?: string;
  }>();

  const [selectedBankCode, setSelectedBankCode] = useState<string | null>(params.selectedBankCode || null);
  const [selectedBankName, setSelectedBankName] = useState<string | null>(params.selectedBankName || null);
  const [searchQuery, setSearchQuery] = useState('');
  const returnTo = params.returnTo || 'withdraw';

  // Fetch banks from API
  const { data: banksData, isLoading: banksLoading } = useQuery({
    queryKey: ['banks'],
    queryFn: () => getBanks(token, 0),
    enabled: !!token,
  });

  const banks: IBank[] = banksData?.data || [];

  // Filter banks based on search query
  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) {
      return banks;
    }
    const query = searchQuery.toLowerCase().trim();
    return banks.filter(
      (bank) =>
        bank.bankName.toLowerCase().includes(query) ||
        bank.bankCode.toLowerCase().includes(query)
    );
  }, [banks, searchQuery]);

  const handleSelect = (bank: IBank) => {
    setSelectedBankCode(bank.bankCode);
    setSelectedBankName(bank.bankName);
    router.back();
    // Use a small delay to ensure navigation completes
    setTimeout(() => {
      router.push({
        pathname: '/withdraw' as any,
        params: {
          selectedBankCode: bank.bankCode,
          selectedBankName: bank.bankName,
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
                SELECT BANK
              </Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchInputContainer, dark ? { backgroundColor: COLORS.dark2, borderColor: COLORS.greyscale300 } : { backgroundColor: '#FEFEFE', borderColor: '#e2d9ec' }]}>
                <Image
                  source={icons.search}
                  style={[styles.searchIcon, dark ? { tintColor: COLORS.greyscale500 } : { tintColor: '#989898' }]}
                  contentFit="contain"
                />
                <TextInput
                  style={[styles.searchInput, dark ? { color: COLORS.white } : { color: COLORS.black }]}
                  placeholder="Search bank..."
                  placeholderTextColor={dark ? COLORS.greyscale500 : '#989898'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <Text style={[styles.clearText, dark ? { color: COLORS.greyscale500 } : { color: '#989898' }]}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Bank List */}
            {banksLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  Loading banks...
                </Text>
              </View>
            ) : filteredBanks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                  {searchQuery ? 'No banks found' : 'No banks available'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredBanks}
                keyExtractor={(item) => item.bankCode}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.bankItem,
                      dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.bankLogoContainer}>
                      {item.bankUrl ? (
                        <Image
                          source={{ uri: item.bankUrl }}
                          style={styles.bankLogo}
                          contentFit="contain"
                        />
                      ) : (
                        <View style={[styles.bankLogoPlaceholder, dark ? { backgroundColor: COLORS.greyScale800 } : { backgroundColor: '#F7F7F7' }]} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.bankName,
                        dark ? { color: COLORS.white } : { color: COLORS.black },
                      ]}
                    >
                      {item.bankName}
                    </Text>
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
              />
            )}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BankModal;

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
    maxHeight: '80%',
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
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: '#FEFEFE',
    borderColor: '#e2d9ec',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearText: {
    fontSize: 18,
    color: '#989898',
    fontWeight: '300',
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  bankLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  bankLogo: {
    width: 40,
    height: 40,
  },
  bankName: {
    flex: 1,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
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
  bankLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
  },
});

