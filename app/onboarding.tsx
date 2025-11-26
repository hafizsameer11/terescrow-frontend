import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { images } from '@/constants';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string[];
  illustration: any;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Buy And Sell GiftCards',
    description: [
      'With our user-friendly system, you can now',
      'buy and sell Gift Cards with ease',
    ],
    illustration: images.splashGradientCard, // Using existing image, will need to update
  },
  {
    id: 2,
    title: 'INSTANT AI CHAT SUPPORT:',
    description: [
      'You chat with an intelligent AI assistant to trade ',
      'crypto and gift cards anytime, quickly and safely.',
    ],
    illustration: null, // Will use memoji avatars
  },
  {
    id: 3,
    title: 'Buy And Sell Crypto',
    description: [
      'With our user-friendly system, you can now',
      'trade your crypto with ease.',
    ],
    illustration: images.splashCoins, // Using existing image
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Mark onboarding as completed
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/signin' as any);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };


  const currentSlide = onboardingData[currentIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        
      <View style={styles.content}>
        {/* Illustration Section */}
        <View style={styles.illustrationContainer}>
          {currentIndex === 0 && (
            <View style={styles.giftCardContainer}>
              {/* Gift Cards Illustration - using Group 2076.png */}
              <ExpoImage
                source={images.group2076}
                style={styles.illustrationImage}
                contentFit="contain"
              />
            </View>
          )}

          {currentIndex === 1 && (
            <View style={styles.memojiContainer}>
              {/* AI Chat Support Illustration - using Group 2077.png */}
              <ExpoImage
                source={images.group2077}
                style={styles.illustrationImage}
                contentFit="contain"
              />
            </View>
          )}

          {currentIndex === 2 && (
            <View style={styles.cryptoContainer}>
              {/* Crypto Coins Illustration - matching Figma design */}
              <ExpoImage
                source={images.splashCoins}
                style={styles.cryptoImage}
                contentFit="contain"
              />
            </View>
          )}
        </View>

        {/* Text Content Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <View style={styles.descriptionContainer}>
            {currentSlide.description.map((line, index) => (
              <Text key={index} style={styles.description}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.nextButton,
                currentIndex === 0 && styles.fullWidthButton,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  giftCardContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    maxWidth: width * 0.9,
    maxHeight: height * 0.5,
  },
  memojiContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptoImage: {
    width: width * 0.9,
    height: height * 0.35,
  },
  textContainer: {
    paddingBottom: 32,
    gap: 8,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#121212',
    fontFamily: 'AeonikTRIAL-Bold',
    lineHeight: 28,
  },
  descriptionContainer: {
    gap: 0,
  },
  description: {
    fontSize: 14,
    color: '#616161',
    fontFamily: 'AeonikTRIAL-Regular',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    height: 53,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  fullWidthButton: {
    flex: 1,
    width: '100%',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#147341',
  },
  backButtonText: {
    fontSize: 17,
    color: '#147341',
    fontFamily: 'AeonikTRIAL-Regular',
    lineHeight: 21,
  },
  nextButton: {
    backgroundColor: '#147341',
  },
  nextButtonText: {
    fontSize: 17,
    color: '#FEFEFE',
    fontFamily: 'AeonikTRIAL-Regular',
    lineHeight: 21,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 32,
    backgroundColor: '#a2dfc2',
  },
  activeIndicator: {
    width: 20,
    height: 6,
    borderRadius: 16,
    backgroundColor: '#46be84',
  },
});

export default OnboardingScreen;

