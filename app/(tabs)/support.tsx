import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/themeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, icons, images } from '@/constants';
import SupportTabs from '@/components/SupportTabs';
import SupportChatItem from '@/components/SupportChatItem';
import { useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/authContext';
import { getSupportChats, ISupportChat } from '@/utils/queries/accountQueries';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Support = () => {
  const { dark } = useTheme();
  const { navigate } = useNavigation<NavigationProp<any>>();
  const { token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Map UI category to API status
  const getStatusFilter = useMemo(() => {
    switch (selectedCategory) {
      case 'Completed':
        return 'completed';
      case 'Processing':
        return 'processing'; // API will filter by 'processing', but we'll also show 'pending' in the UI
      default:
        return undefined; // 'All' - no filter
    }
  }, [selectedCategory]);

  // Fetch support chats from API
  const {
    data: supportChatsData,
    isLoading: isLoadingChats,
    refetch: refetchChats,
  } = useQuery({
    queryKey: ['supportChats', getStatusFilter],
    queryFn: () => getSupportChats(token, { status: getStatusFilter, page: 1, limit: 50 }),
    enabled: !!token,
  });

  const supportChats: ISupportChat[] = supportChatsData?.data?.chats || [];

  // Filter and map data for display
  const getFilteredData = useMemo(() => {
    let filteredChats = supportChats;
    
    // Additional client-side filtering for 'Processing' tab to include 'pending' status
    if (selectedCategory === 'Processing') {
      filteredChats = supportChats.filter(
        (chat) => chat.status === 'processing' || chat.status === 'pending'
      );
    }
    
    return filteredChats.map((chat) => ({
      id: chat.id,
      department: { title: chat.category || 'General', icon: null },
      recentMessage: chat.lastMessage?.message || 'No messages yet',
      recentMessageTimestamp: chat.lastMessage?.createdAt || chat.createdAt,
      chatStatus: chat.status === 'completed' ? 'completed' : chat.status === 'processing' ? 'processing' : 'pending',
      agent: { profilePicture: chat.agent?.profilePicture || null },
    }));
  }, [supportChats, selectedCategory]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchChats();
    } catch (error) {
      console.log("Error refreshing support chats:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchChats]);

  const handleCreateChat = () => {
    navigate('createsupportchat' as any);
  };

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
        {isLoadingChats ? (
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
                heading={supportChats.find(c => c.id === item.id)?.subject || `Support - ${item.department?.title || 'General'}`}
                text={item.recentMessage || "No messages yet"}
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
              getFilteredData.length === 0 && !isLoadingChats ? (
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

      {/* Floating Action Button - Plus Icon */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateChat}
        activeOpacity={0.8}
      >
        <Image
          source={icons.plus}
          style={styles.fabIcon}
          contentFit="contain"
        />
      </TouchableOpacity>
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#147341',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
});

export default Support;
