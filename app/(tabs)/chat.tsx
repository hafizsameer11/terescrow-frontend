import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '@/contexts/themeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, icons } from '@/constants';
import ChatCategories from '@/components/ChatCategories';
import ChatItem from '@/components/ChatItem';
import { useQuery } from '@tanstack/react-query';
import { getAllChats } from '@/utils/queries/chatQueries';
import { useAuth } from '@/contexts/authContext';

const Chat = () => {
  const { token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: chatData,
    isLoading: chatLoading,
    error: chatError,
    isError: chatisError,
    refetch: refetchChats,
  } = useQuery({
    queryKey: ['allchats'],
    queryFn: () => getAllChats(token),
    refetchInterval: 1000,       // Refetch every second
    refetchIntervalInBackground: true,  // Continue fetching even when app is minimized
    enabled: !!token,
  });

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchChats();
    } catch (error) {
      console.log("Error refreshing chats:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchChats]);

  const getFilteredData = useMemo(() => {
    if (!chatData) return [];
    // console.log(chatData.data?.[0].messagesCount);
  
    switch (selectedCategory) {
      case 'completed':
        return chatData.data.filter((chat) => chat.chatStatus === 'successful');
      case 'processing':
        return chatData.data.filter((chat) => chat.chatStatus === 'pending');
      case 'declined':
        return chatData.data.filter((chat) => chat.chatStatus === 'declined');
      case 'unsucessful':
        return chatData.data.filter((chat) => chat.chatStatus === 'unsucessful');
      default:
        return chatData.data;
    }
  }, [chatData, selectedCategory]);

  const { dark } = useTheme();

  if (chatLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  if (chatisError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching chats: {chatError.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainHeadingContainer}>
        <Text style={styles.mainHeading}>Trade History</Text>
      </View>
      <View
        style={[
          styles.mainContent,
          dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
        ]}
      >
        <ChatCategories
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <FlatList
          data={getFilteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ChatItem
            id={item.id.toString()}
              icon={item.department.icon || icons.chat}
              heading={item.department.title}
              text={item.recentMessage}
              date={new Date(item.recentMessageTimestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              status={item.chatStatus}
              productId={item.chatStatus}
              price={`$${item.transaction?.amount?.toString() || "0"} - ₦${item.transaction?.amountNaira?.toString() || "0"}`}
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
            chatLoading ? (
              <View style={styles.emptyLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: dark ? COLORS.white : COLORS.black }]}>
                  Loading chats...
                </Text>
              </View>
            ) : getFilteredData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: dark ? COLORS.white : COLORS.black }]}>
                  No chats found
                </Text>
                <Text style={[styles.emptySubtext, { color: dark ? COLORS.greyscale500 : COLORS.greyscale600 }]}>
                  {selectedCategory === 'all' 
                    ? "You don't have any trade history yet"
                    : `You don't have any ${selectedCategory} trades yet`}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.green,
  },
  mainHeadingContainer: {
    flex: 0.15,
    justifyContent: 'center',
  },
  mainHeading: {
    fontSize: 24,
    marginBottom: 20,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.red,
    fontSize: 16,
  },
  emptyLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default Chat;
