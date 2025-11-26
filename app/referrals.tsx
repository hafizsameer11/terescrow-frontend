import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ImageBackground,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Referrals = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<'Rewards' | 'FAQs'>('Rewards');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);

  const referralCode = 'DEMSCR3ATIONS';
  const earningBalance = '$0.00';
  const numberOfReferrals = 14;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    Alert.alert('Copied', 'Referral code copied to clipboard');
  };

  const handleShareCode = () => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share functionality to be implemented');
  };

  const faqs = [
    {
      question: 'What are the benefits?',
      answer: [
        'Earn passive income for every transaction made by your referrals.',
        'Help grow our community while benefiting from their activity.',
        'Referral Leader Bonus: Get 30% of your referrals\' earnings',
      ],
    },
    {
      question: 'What is referral leader bonus?',
      answer: ['The referral leader bonus is a special reward for top referrers...'],
    },
    {
      question: 'Is there exclusive offer for new customers?',
      answer: ['Yes, new customers get special offers when they sign up...'],
    },
    {
      question: 'How to join the crowd ambassador programme ?',
      answer: ['You can join by sharing your referral code with friends...'],
    },
  ];

  const rewardsTable = [
    { service: 'Gift Card', txType: 'Buy', reward: 'N1,000' },
    { service: 'Gift Card', txType: 'Sell', reward: 'N1,000' },
    { service: 'Crypto', txType: 'All Services (Buy, Sell, Send, Receive)', reward: 'N1,000' },
    { service: 'Airtime', txType: 'Purchase', reward: 'N1,000' },
  ];

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
          Crowd Ambassador Program
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            { borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
            activeTab === 'Rewards' && styles.activeTab,
            activeTab === 'Rewards' && { backgroundColor: COLORS.black },
          ]}
          onPress={() => setActiveTab('Rewards')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Rewards' && styles.activeTabText,
              activeTab === 'Rewards' ? { color: COLORS.white } : { color: COLORS.greyscale600 },
            ]}
          >
            Rewards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { borderTopRightRadius: 16, borderBottomRightRadius: 16 },
            activeTab === 'FAQs' && styles.activeTab,
            activeTab === 'FAQs' && { backgroundColor: COLORS.black },
          ]}
          onPress={() => setActiveTab('FAQs')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'FAQs' && styles.activeTabText,
              activeTab === 'FAQs' ? { color: COLORS.white } : { color: COLORS.greyscale600 },
            ]}
          >
            FAQs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Rewards' ? (
          <>
            {/* Earning Balance Card */}
            <ImageBackground
              source={images.balanceBackground}
              style={styles.balanceCard}
              imageStyle={styles.balanceCardBackground}
              resizeMode="cover"
            >
              {/* Top Section */}
              <View style={styles.balanceTopSection}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceHeaderLabel}>Earning Balance</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setBalanceVisible(!balanceVisible)}
                  style={styles.eyeButton}
                >
                  <Image
                    source={balanceVisible ? icons.eyecloseup : icons.hide}
                    style={styles.eyeIcon}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              </View>

              {/* Balance Amount */}
              <View style={styles.balanceAmountSection}>
                <Text style={styles.balanceAmount}>
                  {balanceVisible ? earningBalance : '••••'}
                </Text>
              </View>

              {/* Referrals Count */}
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <View style={styles.referralsSection}>
                <Text style={styles.referralsLabel}>No of Referrals</Text>
                <Text style={styles.referralsCount}>{numberOfReferrals}</Text>
              </View>

              {/* Withdraw Button */}
              <TouchableOpacity
                style={styles.withdrawButton}
                onPress={() => navigate('withdrawaldetails')}
              >
                <Image
                  source={icons.balanceicon2}
                  style={styles.walletIcon}
                  contentFit="contain"
                />
                <Text style={styles.withdrawButtonText}>Withdraw to USDT</Text>
              </TouchableOpacity>
              </View>
            </ImageBackground>

            {/* Referral Code Section */}
            <View style={styles.referralCodeSection}>
              <Text style={[styles.referralCodeLabel, dark ? { color: COLORS.greyscale600 } : { color: COLORS.greyscale600 }]}>
                Your referral code
              </Text>
              <View style={[styles.referralCodeContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' }]}>
                <Text style={[styles.referralCode, dark ? { color: COLORS.black } : { color: COLORS.black }]}>
                  {referralCode}
                </Text>
                <View style={styles.referralCodeActions}>
                  <TouchableOpacity onPress={handleCopyCode} style={styles.codeActionButton}>
                    <Image
                      source={images.copy}
                      style={styles.codeActionIcon}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleShareCode} style={styles.codeActionButton}>
                    <Image
                      source={images.refsend}
                      style={styles.codeActionIcon}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Program Description */}
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionTitle, { color: COLORS.primary }]}>
                Crowd Ambassador Program!
              </Text>
              <Text style={[styles.descriptionText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                Refer your friends and unlock exclusive rewards. The more friends you bring in, the more you earn.
              </Text>
              <Text style={[styles.descriptionText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.greyscale600 }]}>
                It's simple — share your invite link and start stacking bonuses today!
              </Text>
            </View>

            {/* How It Works */}
            <View style={styles.howItWorksSection}>
              <View style={styles.stepContainer}>
                <View style={styles.stepLeft}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>1</Text>
                  </View>
                  <View style={styles.stepLine} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                    Invite a friend with your promo code for them to get 100% on their 1st deposit
                  </Text>
                </View>
              </View>
              <View style={styles.stepContainer}>
                <View style={styles.stepLeft}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <View style={styles.stepLine} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                    Referral performs a transaction.
                  </Text>
                </View>
              </View>
              <View style={styles.stepContainer}>
                <View style={styles.stepLeft}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>3</Text>
                  </View>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                    You earn for life on every transaction
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Video Section */}
            <View style={styles.videoSection}>
             
              <View style={[styles.videoContainer, dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: '#F7F7F7' }]}>
                <View style={styles.videoPlaceholder}>
                  <Image
                    source={icons.play}
                    style={styles.playIcon}
                    contentFit="contain"
                  />
                </View>
                <Text style={[styles.videoTitle, dark ? { color: COLORS.white } : { color: '##8A8A8A' }]}>
                How to earn on Tercescrow?
              </Text>
              </View>
              <Text style={[styles.videoDescription, dark ? { color: COLORS.greyscale500 } : { color: '#000000' }]}>
                Watch video to get more details on how to earn on tercescrow via your referrals
              </Text>
            </View>

            {/* Rewards Table */}
            <View style={styles.rewardsTableSection}>
              <Text style={[styles.tableTitle, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                Rewards Table
              </Text>
              <View style={styles.tableContainer}>
                <View style={[styles.tableHeader, { backgroundColor: '#46BE84' }]}>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Service</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Tx Type</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Reward/Txn</Text>
                </View>
                {rewardsTable.map((row, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                      index < rewardsTable.length - 1 && styles.tableRowBorder,
                    ]}
                  >
                    <Text style={[styles.tableCell, { flex: 1 }, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                      {row.service}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
                      {row.txType}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, color: COLORS.primary }]}>
                      {row.reward}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* FAQs Section */}
            <View style={styles.faqsSection}>
              <Text style={[styles.faqsTitle, dark ? { color: COLORS.white } : { color: '##00000080' }]}>
                Frequently Asked Questions (FAQs)
              </Text>
              {faqs.map((faq, index) => (
                <View
                  key={index}
                  style={[
                    styles.faqItem,
                    dark ? { borderColor: '#147341' } : { borderColor: '#147341' },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    style={[
                      styles.faqHeader,
                      dark ? { backgroundColor: expandedFAQ === index ? COLORS.dark2 : COLORS.dark1 } : { backgroundColor: expandedFAQ === index ? COLORS.white : '#F6F6F6' },
                    ]}
                  >
                    <Text style={[styles.faqQuestion, dark ? { color: COLORS.white } : { color: '#147341' }]}>
                      {faq.question}
                    </Text>
                    <Image
                      source={expandedFAQ === index ? icons.arrowDown : icons.arrowRight}
                      style={[styles.faqArrow, dark ? { tintColor: COLORS.white } : { tintColor: '#147341' }]}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                  {expandedFAQ === index && (
                    <View style={[
                      styles.faqAnswer,
                      dark ? { backgroundColor: COLORS.dark2 } : { backgroundColor: COLORS.white },
                    ]}>
                      {faq.answer.map((answer, answerIndex) => (
                        <Text
                          key={answerIndex}
                          style={[styles.faqAnswerText, dark ? { color: COLORS.greyscale500 } : { color: COLORS.black }]}
                        >
                          • {answer}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Referrals;

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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    // gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    // borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  activeTab: {
    backgroundColor: COLORS.black,
  },
  tabText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  balanceCardBackground: {
    borderRadius: 16,
  },
  balanceTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceHeaderLabel: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 14,
    fontWeight: '400',
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    width: isTablet ? 24 : 20,
    height: isTablet ? 24 : 20,
    tintColor: '#FFFFFF',
  },
  balanceAmountSection: {
    marginBottom: 16,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: isTablet ? 36 : 28,
    fontWeight: '400',
  },
  referralsSection: {
    marginBottom: 24,
  },
  referralsLabel: {
    fontSize: isTablet ? 16 : 12,
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: 8,
  },
  referralsCount: {
    fontSize: isTablet ? 24 : 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEFEFE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  walletIcon: {
    width: isTablet ? 20 : 16,
    height: isTablet ? 20 : 16,
  },
  withdrawButtonText: {
    fontSize: isTablet ? 16 : 10,
    fontWeight: '400',
    color: '#000',
  },
  referralCodeSection: {
    marginBottom: 24,
  },
  referralCodeLabel: {
    fontSize: isTablet ? 16 : 14,
    marginBottom: 8,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
  },
  referralCode: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    flex: 1,
  },
  referralCodeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  codeActionButton: {
    padding: 8,
  },
  codeActionIcon: {
    width: 20,
    height: 20,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: isTablet ? 16 : 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  howItWorksSection: {
    marginBottom: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepText: {
    fontSize: isTablet ? 16 : 14,
    lineHeight: 22,
  },
  videoSection: {
    marginBottom: 24,
  },
  videoTitle: {
    fontSize: isTablet ? 20 : 12,
    fontWeight: '400',
    marginBottom: 12,
    marginHorizontal:10,
    marginTop:10,
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 60,
    height: 60,
    tintColor: COLORS.white,
  },
  videoDescription: {
    fontSize: isTablet ? 14 : 14,
    lineHeight: 20,
    color:'#000000',
    // marginHorizontal:10,
    backgroundColor:'#F6F6F6',
    borderRadius:16,
    padding:10,
    paddingVertical:15,
  },
  rewardsTableSection: {
    marginBottom: 24,
  },
  tableTitle: {
    fontSize: isTablet ? 20 : 12,
    fontWeight: '400',
    marginBottom: 12,
  },
  tableContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#147341',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tableCell: {
    fontSize: isTablet ? 14 : 12,
  },
  faqsSection: {
    marginBottom: 24,
  },
  faqsTitle: {
    fontSize: isTablet ? 20 : 12,
    fontWeight: '400',
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#147341',
    marginBottom: 8,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
    flex: 1,
    color: '#147341',
  },
  faqArrow: {
    width: 20,
    height: 20,
    marginLeft: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: isTablet ? 14 : 12,
    lineHeight: 20,
    marginBottom: 8,
  },
});

