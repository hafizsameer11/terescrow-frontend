import { StyleSheet, View, FlatList, Text } from 'react-native';
import Header from '@/components/index/Header';
import CardSwiper from '@/components/index/CardSwiper';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuickBoxItem from '@/components/index/QuickBoxItem';
import ChatItem from '@/components/ChatItem';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getDepartments, IDepartmentResponse } from '@/utils/queries/quickActionQueries';
import { getAllChats } from '@/utils/queries/chatQueries';
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

export default function HomeScreen() {
  const { dark } = useTheme();
  const { token } = useAuth();
  const { navigate } = useNavigation<NavigationProp<any>>();

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    isError: departmentsIsError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getDepartments(token),
    enabled: !!token,
  });

  const {
    data: chatData,
    isLoading: chatLoading,
    isError: chatisError,
  } = useQuery({
    queryKey: ['allchats'],
    queryFn: () => getAllChats(token),
    enabled: !!token,
  });

  const handleClickDepartment = (item: IDepartmentResponse['data'][number]) => {
    const route = item.title.includes('Gift Card')
      ? 'giftcardcategories'
      : 'cryptocategories';

    navigate(route, { departmentId: item.id.toString() });
  };

  const renderHeader = () => (
    <>
      <Header />
      <CardSwiper />
      <View style={styles.quickContainer}>
        <Text style={[styles.quickHeading, { color: dark ? COLORS.white : COLORS.black }]}>
          Quick Actions
        </Text>
        {departmentsData?.data && (
          <FlatList
            data={departmentsData.data}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <QuickBoxItem
                icon={icons[item.icon as keyof typeof icons] || icons.gift}
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

      <View style={styles.recentContainer}>
        <Text
          style={[
            styles.recentHeading,
            { color: dark ? COLORS.greyscale500 : COLORS.grayscale700 },
          ]}
        >
          Recents
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={[{ flex: 1 }, dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white }]}
    >
      <FlatList
        data={chatData?.data || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ChatItem
            id={item.id.toString()}
            icon={icons.chat}
            heading={`${item.agent.firstname} ${item.agent.lastname}`}
            text={item.recentMessage}
            date={new Date(item.recentMessageTimestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            productId={item.id.toString()}
            price="$0.00"
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  quickContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  quickHeading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },
  recentHeading: {
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },
  recentContainer: {
    paddingHorizontal: 16,
  },
});
