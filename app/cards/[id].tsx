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
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import CustomSelectField from '@/components/CustomSelectField';
import Button from '@/components/Button';
import CounterInput from '@/components/CounterInput';

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

  const renderInfoFields = () => {
    return (
      <View style={styles.inputFieldsContainer}>
        <CounterInput
          text="How many cards?"
          counter={cardsConter}
          setCounter={setCardsConter}
          type="counter"
        />
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
            {renderInfoFields()}
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
  input: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.greyscale300,
  },
});

export default CardScreen;
