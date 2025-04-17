import { COLORS, icons } from '@/constants';
import { Image } from 'expo-image';
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/themeContext';
import { useNavigation } from 'expo-router';
import Button from '@/components/Button';
import DraggableModal from '../components/KycModal';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { useQuery } from '@tanstack/react-query';
import { getKycDetails } from '@/utils/queries/accountQueries';
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
  const themeStyles = {
    background: dark ? COLORS.dark1 : COLORS.white,
    normalText: dark ? COLORS.white : COLORS.black,
    verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
  };
  const openModal = () => setModalVisible(true);
  const { data: KycData, isLoading: KycLoading } = useQuery({
    // queryKey:'getKycDetails',
    queryKey: ['getKycDetails'],
    queryFn: () => getKycDetails(token),
  })
  useEffect(() => {
    if (KycData) {
      console.log(KycData)
    }
  })
  const { data: kycLimits } = useQuery({
    queryKey: ['getKycLimits'],
    queryFn: () => getKycLimits(token)
  })
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
        <ScrollView>
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
              {KycData?.data?.state === 'verified' ? 'Tier 2 - Verified' : 'Tier 1'}

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
                  { }
                  <Text style={styles.verifiedText}>{KycData?.data?.state || 'Not Verified'}</Text>
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

        <DraggableModal isVisible={isModalVisible} onClose={closeModal} />

        {
          KycData?.data?.state !== 'verified' && (
            <View style={styles.buttonContainer}>
              {KycData?.data?.state === 'pending' ? (
                <Text>Your request is submitted and will be processed soon</Text>
              ) : KycData?.data?.state === 'failed' ? (
                <Text>Your request has been failed because of reason {KycData?.data?.reason}</Text>
              ) : (
                <Button title="Upgrade to Tier 2" onPress={openModal} />
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
});

export default UpdateKycLevel;
