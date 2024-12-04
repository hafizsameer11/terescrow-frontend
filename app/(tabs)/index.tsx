import { StyleSheet, View, ScrollView, FlatList, Text } from 'react-native';
import Header from '@/components/index/Header';
import CardSwiper from '@/components/index/CardSwiper';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecentContainer from '@/components/index/RecentContainer';
import { useTheme } from '@/contexts/themeContext';
import { COLORS, icons } from '@/constants';
import { Route, useRouter } from 'expo-router';
import QuickBoxItem from '@/components/index/QuickBoxItem';
import { Colors } from '@/constants/Colors';
import ChatItem from '@/components/ChatItem';
import { DUMMY_DATA_ALL } from '@/utils/DummyData';

const data = [
  {
    icon: icons.gift,
    key: '1',
    heading: 'Sell Gift Card',
    text: 'Exchange your gift cards for instant cash',
    route: '/sellgiftcard',
  },
  {
    icon: icons.gift,
    key: '2',
    heading: 'Buy Gift Cards',
    text: 'Get great deals and instant delivery',
    route: '/buygiftcard',
  },
  {
    icon: icons.bitCoin,
    key: '3',
    heading: 'Sell crypto',
    text: 'Convert your crypto into cash easily',
    route: '/sellcrypto',
  },
  {
    icon: icons.bitCoin,
    key: '4',
    heading: 'Buy crypto',
    text: 'Purchase popular crypto quickly and securely',
    route: '/buycrypto',
  },
];

export default function HomeScreen() {
  const { dark } = useTheme();
  const router = useRouter();
  console.log(dark);

  const QuickActions = () => {
    const { dark } = useTheme();
    return (
      <View style={styles.quickContainer}>
        <View>
          <Text
            style={[
              styles.quickHeading,
              { color: dark ? COLORS.grayscale100 : COLORS.greyscale900 },
            ]}
          >
            Quick Actions
          </Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 16 }}>
          <FlatList
            data={data}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <QuickBoxItem
                icon={item.icon}
                heading={item.heading}
                text={item.text}
                onSend={() => router.push(item.route as Route)}
              />
            )}
            keyExtractor={(item) => item.key}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            numColumns={2}
          />
        </View>
      </View>
    );
  };

  const RecentContainer = () => {
    return (
      <View style={styles.recentContainer}>
        <View>
          <Text
            style={[
              styles.recentHeading,
              { color: dark ? COLORS.greyscale500 : COLORS.grayscale700 },
            ]}
          >
            Recents
          </Text>
        </View>
        <FlatList
          data={DUMMY_DATA_ALL}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ChatItem
              icon={item.icon}
              heading={item.heading}
              text={item.text}
              date={item.date}
              price={item.price}
              productId={item.productId}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={1}
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <View>
        <Header />
      </View>
      <ScrollView style={{ flex: 1 }}>
        <CardSwiper />
        <QuickActions />
        <RecentContainer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  quickContainer: {
    marginTop: 20,
  },
  quickHeading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
    marginLeft: 16,
  },
  recentHeading: {
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 16,
    // paddingHorizontal: 12,
    marginBottom: 16,
    // marginRight: 16,
    color: COLORS.greyscale600,
  },
  recentContainer: {
    paddingHorizontal: 16,
  },
});
