import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/themeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, icons, images } from '@/constants';
import SupportTabs from '@/components/SupportTabs';
import SupportChatItem from '@/components/SupportChatItem';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dummy data for support chats
const dummySupportChats = [
  {
    id: 1,
    department: { title: 'Crypto', icon: null },
    recentMessage: 'Your complaint is being reviewed',
    recentMessageTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    chatStatus: 'pending',
    agent: { profilePicture: null },
  },
  {
    id: 2,
    department: { title: 'Crypto', icon: null },
    recentMessage: 'Your complaint is being reviewed',
    recentMessageTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    chatStatus: 'pending',
    agent: { profilePicture: null },
  },
  {
    id: 3,
    department: { title: 'Crypto', icon: null },
    recentMessage: 'Your complaint is being reviewed',
    recentMessageTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    chatStatus: 'pending',
    agent: { profilePicture: null },
  },
  {
    id: 4,
    department: { title: 'Crypto', icon: null },
    recentMessage: 'Your complaint is being reviewed',
    recentMessageTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    chatStatus: 'pending',
    agent: { profilePicture: null },
  },
  {
    id: 5,
    department: { title: 'Crypto', icon: null },
    recentMessage: 'Your complaint is being reviewed',
    recentMessageTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    chatStatus: 'pending',
    agent: { profilePicture: null },
  },
  {
    id: 6,
    department: { title: 'Gift cards', icon: null },
    recentMessage: 'Your complaint is being reviewed',
    recentMessageTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    chatStatus: 'successful',
    agent: { profilePicture: null },
  },
];

const Support = () => {
  const { dark } = useTheme();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter dummy data based on selected category
  const getFilteredData = useMemo(() => {
    switch (selectedCategory) {
      case 'Completed':
        return dummySupportChats.filter((chat) => chat.chatStatus === 'successful');
      case 'Processing':
        return dummySupportChats.filter((chat) => chat.chatStatus === 'pending');
      default:
        return dummySupportChats;
    }
  }, [selectedCategory]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would refetch data here
      // await refetchSupportChats();
    } catch (error) {
      console.log("Error refreshing support chats:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainHeadingContainer}>
        <Text style={styles.mainHeading}>Support Chats</Text>
      </View>
      <View
        style={[
          styles.mainContent,
          dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
        ]}
      >
        <SupportTabs
          activeTab={selectedCategory}
          onTabChange={setSelectedCategory}
        />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: dark ? COLORS.white : COLORS.black }]}>
              Loading support chats...
            </Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <SupportChatItem
                id={item.id.toString()}
                icon={item.department?.icon || icons.chat}
                heading={`Support - ${item.department?.title || 'General'}`}
                text={item.recentMessage || "Your complaint is being reviewed"}
                date={new Date(item.recentMessageTimestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                status={item.chatStatus}
                profileImage={item.agent?.profilePicture || undefined}
              />
            )}
            style={styles.dataList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              getFilteredData.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: dark ? COLORS.white : COLORS.black }]}>
                    No support chats found
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#147341',
  },
  mainHeadingContainer: {
    flex: 0.15,
    justifyContent: 'center',
  },
  mainHeading: {
    fontSize: 24,
    // marginBottom: 10,
    marginTop: 10,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  dataList: {
    marginTop: 10,
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default Support;
