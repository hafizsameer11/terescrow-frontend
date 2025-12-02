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
    if (kycLimits) {
      if (KycData?.data?.state === 'verified') {
        setCurrentKycLimits(kycLimits?.data?.find((limit: KycLimit) => limit.tier === 'tier2'))
      } else {
        setCurrentKycLimits(kycLimits?.data?.find((limit: KycLimit) => limit.tier === 'tier1'))
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

          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={[
                { fontSize: isTablet?24: 16, marginVertical: 10 },
                { color: themeStyles.normalText },
              ]}
            >
              {kycStatusData?.data?.currentTier === 'tier2' 
                ? 'Tier 2 - Verified' 
                : kycStatusData?.data?.currentTier === 'tier1'
                ? 'Tier 1'
                : KycData?.data?.state === 'verified' 
                ? 'Tier 2 - Verified' 
                : 'Tier 1'}

            </Text>

            <View>
              <View style={styles.rowContainer}>
                <Text style={{ color: themeStyles.normalText,fontSize:isTablet?18:14 }}>
                  BVN Verification
                </Text>
                <View
                  style={[
                    styles.verifiedContainer,
                    { backgroundColor: themeStyles.verifiedBackground },
                  ]}
                >
                  <Text style={styles.verifiedText}>
                    {tier2StatusData?.data?.status === 'verified' 
                      ? 'Verified' 
                      : tier2StatusData?.data?.status === 'pending'
                      ? 'Pending'
                      : tier2StatusData?.data?.status === 'rejected'
                      ? 'Rejected'
                      : kycStatusData?.data?.tiers?.find(t => t.tier === 'tier2')?.status === 'verified'
                      ? 'Verified'
                      : kycStatusData?.data?.tiers?.find(t => t.tier === 'tier2')?.status === 'pending'
                      ? 'Pending'
                      : KycData?.data?.state || 'Not Verified'}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  {
                    fontSize: isTablet?20:16,
                    marginBottom: 15,
                    marginTop: 20,
                    fontWeight: 'bold',
                  },
                  { color: themeStyles.normalText },
                ]}
              >
                Current limit
              </Text>


              {/* <View style={styles.limitContainer}>
                <View style={styles.limitHeader}>
                  <Image
                    source={icons.activity}
                    style={{
                      width: 24,
                      height: 24,
                      marginRight: 10,
                      tintColor: themeStyles.normalText,
                    }}
                  />
                  <Text style={[{ color: themeStyles.normalText,fontSize:isTablet?20:16 }]}>
                    Crypto Limits
                  </Text>
                </View>


                <View style={styles.limitRow}>
                  <Text style={{ color: themeStyles.normalText,fontSize:isTablet?18:14 }}>
                    Crypto Sell
                  </Text>
                  <Text style={{ color: themeStyles.normalText ,fontSize:isTablet?18:14}}>
                    {currentKycLimit?.cryptoSellLimit}
                  </Text>
                </View>
                <View style={styles.limitRow}>
                  <Text style={{ color: themeStyles.normalText,fontSize:isTablet?18:14 }}>
                    Crypto Buy
                  </Text>
                  <Text style={{ color: themeStyles.normalText,fontSize:isTablet?18:14 }}>
                    {currentKycLimit?.cryptoBuyLimit}
                  </Text>
                </View>

              </View> */}
              <View style={styles.limitContainer}>
                <View style={styles.limitHeader}>
                  <Image
                    source={icons.activity}
                    style={{
                      width: 24,
                      height: 24,
                      marginRight: 10,
                      tintColor: themeStyles.normalText,
                    }}
                  />
                  <Text style={[{ color: themeStyles.normalText,fontSize:isTablet?20:16 }]}>
                    Gift Card Limits
                  </Text>
                </View>


                <View style={styles.limitRow}>
                  <Text style={{ color: themeStyles.normalText,fontSize:isTablet?18:14 }}>
                    Gift Card Sell
                  </Text>
                  <Text style={{ color: themeStyles.normalText }}>
                    {currentKycLimit?.giftCardSellLimit}
                  </Text>
                </View>
                <View style={styles.limitRow}>
                  <Text style={{ color: themeStyles.normalText,fontSize:isTablet?18:14 }}>
                    Gift Card Buy
                  </Text>
                  <Text style={{ color: themeStyles.normalText,fontSize:isTablet?18:14 }}>
                    {currentKycLimit?.giftCardBuyLimit}
                  </Text>
                </View>

              </View>

            </View>
          </View>
        </ScrollView>
        )}

        <DraggableModal isVisible={isModalVisible} onClose={closeModal} />
        <Button title="Upgrade to Tier 2" onPress={openModal} />

        {
          (kycStatusData?.data?.currentTier !== 'tier2' && tier2StatusData?.data?.status !== 'verified' && KycData?.data?.state !== 'verified') && (
            <View style={styles.buttonContainer}>
              {tier2StatusData?.data?.status === 'pending' || kycStatusData?.data?.tiers?.find(t => t.tier === 'tier2')?.status === 'pending' || KycData?.data?.state === 'pending' ? (
                <Text style={{ color: themeStyles.normalText, textAlign: 'center', paddingVertical: 10 }}>
                  Your Tier 2 request is submitted and will be processed soon
                </Text>
              ) : tier2StatusData?.data?.status === 'rejected' || KycData?.data?.state === 'failed' ? (
                <Text style={{ color: COLORS.red, textAlign: 'center', paddingVertical: 10 }}>
                  Your Tier 2 request has been {tier2StatusData?.data?.status === 'rejected' ? 'rejected' : 'failed'}
                  {tier2StatusData?.data?.submission?.reason && ` because of: ${tier2StatusData.data.submission.reason}`}
                  {KycData?.data?.reason && ` because of: ${KycData.data.reason}`}
                </Text>
              ) : (
                <Button title="Upgrade to Tier 2" onPress={openModal} />
              )}
            </View>
          )
        }

        {/* Tier 3 Upgrade Button */}
        {
          (tier2StatusData?.data?.status === 'verified' || kycStatusData?.data?.currentTier === 'tier2') && 
          (kycStatusData?.data?.currentTier !== 'tier3' && tier3StatusData?.data?.status !== 'verified') && (
            <View style={styles.buttonContainer}>
              {tier3StatusData?.data?.status === 'pending' || kycStatusData?.data?.tiers?.find(t => t.tier === 'tier3')?.status === 'pending' ? (
                <Text style={{ color: themeStyles.normalText, textAlign: 'center', paddingVertical: 10 }}>
                  Your Tier 3 request is submitted and will be processed soon
                </Text>
              ) : tier3StatusData?.data?.status === 'rejected' ? (
                <Text style={{ color: COLORS.red, textAlign: 'center', paddingVertical: 10 }}>
                  Your Tier 3 request has been rejected
                  {tier3StatusData?.data?.submission?.reason && ` because of: ${tier3StatusData.data.submission.reason}`}
                </Text>
              ) : (
                <Button title="Upgrade to Tier 3" onPress={() => router.push('/tier3verification')} />
              )}
            </View>
          )
        }

        {/* Tier 4 Upgrade Button */}
        {
          (tier3StatusData?.data?.status === 'verified' || kycStatusData?.data?.currentTier === 'tier3') && 
          (kycStatusData?.data?.currentTier !== 'tier4' && tier4StatusData?.data?.status !== 'verified') && (
            <View style={styles.buttonContainer}>
              {tier4StatusData?.data?.status === 'pending' || kycStatusData?.data?.tiers?.find(t => t.tier === 'tier4')?.status === 'pending' ? (
                <Text style={{ color: themeStyles.normalText, textAlign: 'center', paddingVertical: 10 }}>
                  Your Tier 4 request is submitted and will be processed soon
                </Text>
              ) : tier4StatusData?.data?.status === 'rejected' ? (
                <Text style={{ color: COLORS.red, textAlign: 'center', paddingVertical: 10 }}>
                  Your Tier 4 request has been rejected
                  {tier4StatusData?.data?.submission?.reason && ` because of: ${tier4StatusData.data.submission.reason}`}
                </Text>
              ) : (
                <Button title="Upgrade to Tier 4" onPress={() => router.push('/tier4verification')} />
              )}
            </View>
          )
        }




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
});

export default UpdateKycLevel;
