import { COLORS, icons } from '@/constants';
import { Image } from 'expo-image';
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/themeContext';
import { useNavigation, router } from 'expo-router';
import Button from '@/components/Button';
import DraggableModal from '../components/KycModal';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/authContext';
import { useQuery } from '@tanstack/react-query';
import { getKycDetails, getKycStatus, getTier2Status, getTier3Status, getTier4Status } from '@/utils/queries/accountQueries';
import { getKycLimits, KycLimit } from '@/utils/queries/quickActionQueries';
const { width } = Dimensions.get('window');
const isTablet = width >= 768; // iPads and larger devices

const UpdateKycLevel = () => {
  const verifiedLimits = [
    {
      icon: icons.activity2,
      title: 'Crypto limit',
      limits: [
        { label: 'Receive', value: 'Unlimited' },
        { label: 'Sell', value: 'Unlimited' },
      ],
    },
    {
      icon: icons.gift,
      title: 'Gift Card limit',
      limits: [
        { label: 'Receive', value: 'Unlimited' },
        { label: 'Sell', value: 'Unlimited' },
      ],
    },
  ];
  const unverifiedLimits = [
    {
      icon: icons.activity2,
      title: 'Crypto limit',
      limits: [
        { label: 'Receive', value: 'Limited' },
        { label: 'Sell', value: 'Limited' },
      ],
    },
    {
      icon: icons.gift,
      title: 'Gift Card limit',
      limits: [
        { label: 'Receive', value: 'Limited' },
        { label: 'Sell', value: 'Limited' },
      ],
    },
  ];
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const [currentLimits, setCurrentLimits] = useState(verifiedLimits);
  const { userData } = useAuth();
  const { token } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentKycLimit, setCurrentKycLimits] = useState<KycLimit | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
    verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
  };
  const openModal = () => setModalVisible(true);
  // Use new V2 KYC status API
  const { 
    data: kycStatusData, 
    isLoading: kycStatusLoading,
    refetch: refetchKycStatus,
  } = useQuery({
    queryKey: ['kycStatus'],
    queryFn: () => getKycStatus(token),
    enabled: !!token,
  });

  // Get Tier 2 specific status
  const { 
    data: tier2StatusData, 
    isLoading: tier2StatusLoading,
    refetch: refetchTier2Status,
  } = useQuery({
    queryKey: ['tier2Status'],
    queryFn: () => getTier2Status(token),
    enabled: !!token,
  });

  // Get Tier 3 specific status
  const { 
    data: tier3StatusData, 
    isLoading: tier3StatusLoading,
    refetch: refetchTier3Status,
  } = useQuery({
    queryKey: ['tier3Status'],
    queryFn: () => getTier3Status(token),
    enabled: !!token,
  });

  // Get Tier 4 specific status
  const { 
    data: tier4StatusData, 
    isLoading: tier4StatusLoading,
    refetch: refetchTier4Status,
  } = useQuery({
    queryKey: ['tier4Status'],
    queryFn: () => getTier4Status(token),
    enabled: !!token,
  });

  // Fallback to old API for backward compatibility
  const { 
    data: KycData, 
    isLoading: KycLoading,
    refetch: refetchKycData,
  } = useQuery({
    queryKey: ['getKycDetails'],
    queryFn: () => getKycDetails(token),
    enabled: !!token && !kycStatusData, // Only use if V2 API fails
  });

  const { 
    data: kycLimits,
    refetch: refetchKycLimits,
  } = useQuery({
    queryKey: ['getKycLimits'],
    queryFn: () => getKycLimits(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (kycStatusData) {
      console.log('KYC Status:', kycStatusData);
    }
    if (tier2StatusData) {
      console.log('Tier 2 Status:', tier2StatusData);
    }
    if (tier3StatusData) {
      console.log('Tier 3 Status:', tier3StatusData);
    }
    if (tier4StatusData) {
      console.log('Tier 4 Status:', tier4StatusData);
    }
  }, [kycStatusData, tier2StatusData, tier3StatusData, tier4StatusData]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchKycStatus(),
        refetchTier2Status(),
        refetchTier3Status(),
        refetchTier4Status(),
        refetchKycData(),
        refetchKycLimits(),
      ]);
    } catch (error) {
      console.log("Error refreshing KYC data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchKycStatus, refetchTier2Status, refetchKycData, refetchKycLimits]);
  const closeModal = () => setModalVisible(false);
  useEffect(() => {
    if (userData?.isVerified) {
      setCurrentLimits(verifiedLimits);
    } else {
      setCurrentLimits(unverifiedLimits);
    }
  }, [userData?.isVerified])
  console.log(userData)
  useEffect(() => {
    if (kycLimits && Array.isArray(kycLimits?.data)) {
      if (KycData?.data?.state === 'verified') {
        setCurrentKycLimits(kycLimits?.data?.find((limit: KycLimit) => limit.tier === 'tier2') || null)
      } else {
        setCurrentKycLimits(kycLimits?.data?.find((limit: KycLimit) => limit.tier === 'tier1') || null)
      }
    }

  })

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background }}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        {(kycStatusLoading || tier2StatusLoading) && !kycStatusData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: themeStyles.normalText }]}>
              Loading KYC details...
            </Text>
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          >
          <View style={styles.container}>
            <TouchableOpacity
              style={{ position: 'absolute', left: 15 }}
              onPress={goBack}
            >
              <Image
                source={icons.arrowBack}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: themeStyles.normalText,
                }}
              />
            </TouchableOpacity>
            <Text
              style={[
                { fontSize: isTablet?24: 20, fontWeight: 'bold' },
                { color: themeStyles.normalText },
              ]}
            >
              Update KYC Level
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            {/* Display all 4 tiers */}
            {kycStatusData?.data?.tiers?.map((tier, index) => {
              const isCurrentTier = kycStatusData?.data?.currentTier === tier.tier;
              const tierNumber = tier.tier.replace('tier', '');
              const tierNames: { [key: string]: string } = {
                tier1: 'Basic Verification',
                tier2: 'Standard Verification',
                tier3: 'Enhanced Verification',
                tier4: 'Advanced Verification',
              };

              const getStatusBadgeColor = (status: string) => {
                if (status === 'verified') return COLORS.primary;
                if (status === 'pending') return '#FFA500';
                return '#FF6B6B';
              };

              const getStatusText = (status: string) => {
                if (status === 'verified') return 'Verified';
                if (status === 'pending') return 'Pending';
                return 'Unverified';
              };

              const formatAmount = (amount: string) => {
                const num = parseFloat(amount);
                if (isNaN(num) || num === 0) return 'NGN 0';
                // Format with commas for thousands
                return `NGN ${num.toLocaleString('en-US')}`;
              };

              return (
                <View
                  key={tier.tier}
                  style={[
                    styles.tierCard,
                    {
                      backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                      marginBottom: index < 3 ? 16 : 0,
                    },
                  ]}
                >
                  {/* Tier Header */}
                  <View style={styles.tierHeader}>
                    <Text
                      style={[
                        styles.tierTitle,
                        { color: themeStyles.normalText },
                        isCurrentTier && { fontWeight: '700' },
                      ]}
                    >
                      Tier {tierNumber} {isCurrentTier && '(Current level)'}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBadgeColor(tier.status) },
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {getStatusText(tier.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Tier Name */}
                  <Text
                    style={[
                      styles.tierName,
                      { color: themeStyles.normalText },
                    ]}
                  >
                    {tierNames[tier.tier] || tier.tier}
                  </Text>

                  {/* Deposit Limits */}
                  <View style={styles.limitSection}>
                    <View style={styles.limitLabelRow}>
                      <Image
                        source={icons.activity}
                        style={[
                          styles.limitIcon,
                          { tintColor: themeStyles.normalText },
                        ]}
                      />
                      <Text style={[styles.limitLabel, { color: themeStyles.normalText }]}>
                        Deposit limit:
                      </Text>
                    </View>
                    <View style={styles.limitValueRow}>
                      <Text style={[styles.limitValue, { color: themeStyles.normalText }]}>
                        Daily: {formatAmount(tier.limits.deposit.daily)}
                      </Text>
                      <Text style={[styles.limitValue, { color: themeStyles.normalText }]}>
                        Monthly: {formatAmount(tier.limits.deposit.monthly)}
                      </Text>
                    </View>
                  </View>

                  {/* Withdrawal Limits */}
                  <View style={styles.limitSection}>
                    <View style={styles.limitLabelRow}>
                      <Image
                        source={icons.activity}
                        style={[
                          styles.limitIcon,
                          { tintColor: themeStyles.normalText },
                        ]}
                      />
                      <Text style={[styles.limitLabel, { color: themeStyles.normalText }]}>
                        Withdrawal limit:
                      </Text>
                    </View>
                    <View style={styles.limitValueRow}>
                      <Text style={[styles.limitValue, { color: themeStyles.normalText }]}>
                        Daily: {formatAmount(tier.limits.withdrawal.daily)}
                      </Text>
                      <Text style={[styles.limitValue, { color: themeStyles.normalText }]}>
                        Monthly: {formatAmount(tier.limits.withdrawal.monthly)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
        )}

        <DraggableModal isVisible={isModalVisible} onClose={closeModal} />

        {/* Upgrade Button - Show for next tier that can be upgraded */}
        {(() => {
          const currentTier = kycStatusData?.data?.currentTier || 'tier1';
          const tiers = kycStatusData?.data?.tiers || [];
          
          // Find the next tier that can be upgraded
          let nextTierToUpgrade: typeof tiers[0] | null = null;
          let nextTierNumber = 0;

          if (currentTier === 'tier1') {
            nextTierToUpgrade = tiers.find(t => t.tier === 'tier2') || null;
            nextTierNumber = 2;
          } else if (currentTier === 'tier2') {
            nextTierToUpgrade = tiers.find(t => t.tier === 'tier3') || null;
            nextTierNumber = 3;
          } else if (currentTier === 'tier3') {
            nextTierToUpgrade = tiers.find(t => t.tier === 'tier4') || null;
            nextTierNumber = 4;
          }

          // For tier 2, always show button if status is 'unverified' (user can always try to upgrade from tier1 to tier2)
          // For other tiers, check canUpgrade flag
          if (!nextTierToUpgrade) {
            return null;
          }

          // Allow upgrade if:
          // 1. Tier 2 and status is 'unverified' (always allow upgrade from tier1)
          // 2. Any tier with canUpgrade === true
          // 3. Status is not 'verified' (already verified)
          const canShowUpgradeButton = 
            (nextTierNumber === 2 && nextTierToUpgrade.status === 'unverified') ||
            (nextTierToUpgrade.canUpgrade && nextTierToUpgrade.status !== 'verified');

          if (!canShowUpgradeButton) {
            return null;
          }

          const tierStatus = nextTierToUpgrade.status;

          return (
            <View style={styles.buttonContainer}>
              {tierStatus === 'pending' ? (
                <Text style={{ color: themeStyles.normalText, textAlign: 'center', paddingVertical: 10 }}>
                  Your Tier {nextTierNumber} request is submitted and will be processed soon
                </Text>
              ) : (
                <Button
                  title={`Upgrade to tier ${nextTierNumber}`}
                  onPress={() => {
                    if (nextTierNumber === 2) {
                      // Open modal which will navigate to tier2verification
                      openModal();
                    } else if (nextTierNumber === 3) {
                      router.push('/tier3verification');
                    } else if (nextTierNumber === 4) {
                      router.push('/tier4verification');
                    }
                  }}
                />
              )}
            </View>
          );
        })()}




      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  verifiedContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  verifiedText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  limitContainer: {
    marginBottom: 15,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  buttonContainer: {
    padding: 20,
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
  tierCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2d9ec',
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: isTablet ? 12 : 10,
    fontWeight: '600',
  },
  tierName: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
    marginBottom: 16,
    opacity: 0.7,
  },
  limitSection: {
    marginBottom: 12,
  },
  limitLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  limitIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  limitLabel: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '500',
  },
  limitValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 22,
  },
  limitValue: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '400',
  },
});

export default UpdateKycLevel;
