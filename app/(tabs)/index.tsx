import { StyleSheet, View, ScrollView, FlatList, Text } from 'react-native';
import Header from '@/components/index/Header';
import CardSwiper from '@/components/index/CardSwiper';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecentContainer from '@/components/index/RecentContainer';
import { useTheme } from '@/contexts/themeContext';
import { COLORS, icons } from '@/constants';
import { Route, useNavigation, useRouter } from 'expo-router';
import QuickBoxItem from '@/components/index/QuickBoxItem';
import { Colors } from '@/constants/Colors';
import ChatItem from '@/components/ChatItem';
import { DUMMY_DATA_ALL } from '@/utils/DummyData';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import {
  getCategories,
  getDepartments,
  IDepartmentResponse,
} from '@/utils/queries/quickActionQueries';
import { NavigationProp } from '@react-navigation/native';

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
  const { token } = useAuth();
  const { navigate } = useNavigation<NavigationProp<any>>();

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    error: departmentsError,
    isError: departmentsIsError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getDepartments(token),
    enabled: token !== '',
  });

  const handleClickDepartment = (item: IDepartmentResponse['data'][number]) => {
    console.log(item.title);
    if (item.title.includes('Gift Card')) {
      navigate('giftcardcategories', {
        departmentId: item.id.toString(),
      });
    }
    if (item.title.includes('crypto')) {
      navigate('cryptocategories', {
        departmentId: item.id.toString(),
      });
    }
    // navigate('');
  };

  // console.log('caegory', token);

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
          {departmentsData?.data && (
            <FlatList
              data={departmentsData.data}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <QuickBoxItem
                  icon={icons[item.icon as keyof typeof icons] as string}
                  title={item.title}
                  description={item.description}
                  onClick={() => handleClickDepartment(item)}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              numColumns={2}
            />
          )}
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
