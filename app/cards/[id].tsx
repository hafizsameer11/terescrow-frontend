import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { COLORS, images } from '@/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/themeContext';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NavigateBack from '@/components/NavigateBack';
import CardCom from '@/components/CardCom';
import InformationFields from '@/components/InformationFields';
import CustomProceed from '@/components/CustomProceed';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import CustomSelectField from '@/components/CustomSelectField';
import Button from '@/utils/Button';

interface CardData {
  id: string;
  card: string;
  text: string;
}

const data: CardData[] = [
  { id: '1', card: images.amazonCard, text: 'Amazon' },
  { id: '2', card: images.americanExpressCard, text: 'American Express' },
  { id: '3', card: images.visaCard, text: 'Visa Card' },
  { id: '4', card: images.ebayCard, text: 'Ebay' },
  { id: '5', card: images.footLockerCard, text: 'Footlocker' },
  { id: '6', card: images.googlePlayCard, text: 'Google Play' },
  { id: '7', card: images.itunesCard, text: 'iTunes' },
  { id: '8', card: images.nikeCard, text: 'Nike' },
];

const CardScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dark } = useTheme();
  const router = useRouter();
  const [cardsConter, setCardsConter] = React.useState(0);
  const cardData = data.find((item) => item.id === id);
  if (!cardData) {
    return null; // Optionally, render an error message or fallback
  }

  const renderCard = () => {
    return (
      <View style={styles.cardContainer}>
        <Image
          source={cardData.card}
          style={styles.cardImage}
          contentFit="contain"
        />
      </View>
    );
  };

  const renderInputFields = () => {
    return (
      <View style={styles.inputFieldsContainer}>
        {/* Input with Counter */}
        <View style={styles.inputWithCounter}>
          <Text
            style={[
              styles.mainText,
              dark ? { color: Colors.dark.text } : { color: Colors.light.text },
            ]}
          >
            How many cards?
          </Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              onPress={() =>
                setCardsConter(cardsConter > 0 ? cardsConter - 1 : 0)
              }
              style={styles.counterButton}
            >
              <Text style={[styles.counterText, styles.specialCase]}>-</Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.counterValue,
                dark
                  ? { color: Colors.dark.text }
                  : { color: Colors.light.text },
              ]}
            >
              {cardsConter}
            </Text>
            <TouchableOpacity
              onPress={() => setCardsConter(cardsConter + 1)}
              style={styles.counterButton}
            >
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Regular Input */}
        <TextInput
          style={[
            styles.input,
            dark ? { color: Colors.dark.text } : { color: Colors.light.text },
          ]}
          keyboardType="numeric"
          placeholder="Enter amount in USD"
          placeholderTextColor={'#888'}
        />
        <View style={{ flex: 1, marginTop: 24 }}>
          <CustomSelectField title="Category" />
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Disable the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      {/* <CardDetails card={cardData.card} text={cardData.text} /> */}
      <SafeAreaView
        style={[
          { flex: 1 },
          dark
            ? { backgroundColor: COLORS.black }
            : { backgroundColor: COLORS.white },
        ]}
      >
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <NavigateBack text={cardData.text} />
            {renderCard()}
            {renderInputFields()}
          </ScrollView>
          <View style={styles.footer}>
            <Button
              onPress={() => {
                router.push('/connectingagent');
              }}
              title="Proceed"
              filled
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  footer: {
    position: 'relative',
    bottom: 0,
    width: '100%',
    padding: 10,
  },
  cardContainer: {
    height: 220,
    marginTop: 25,
    marginHorizontal: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  inputFieldsContainer: {
    flex: 1,
    marginTop: 24,
    marginHorizontal: 16,
  },
  mainText: {
    fontSize: 16,
    color: COLORS.grayscale700,
    fontWeight: 'semibold',
  },
  inputWithCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingLeft: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.greyscale300,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    borderRadius: 50,
    marginHorizontal: 16,
    backgroundColor: COLORS.greyscale600,
  },
  counterText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'semibold',
    paddingHorizontal: 7,
  },
  counterValue: {
    fontSize: 16,
    color: '#333',
  },
  specialCase: {
    paddingHorizontal: 10,
  },
  input: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.greyscale300,
  },
});

export default CardScreen;
