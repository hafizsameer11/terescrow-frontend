import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
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

  const {
    data: chatData,
    isLoading: chatLoading,
    error: chatError,
    isError: chatisError,
  } = useQuery({
    queryKey: ['allchats'],
    queryFn: () => getAllChats(token),
    refetchInterval: 1000,       // Refetch every second
    refetchIntervalInBackground: true,  // Continue fetching even when app is minimized
    enabled: !!token,
  });

  const getFilteredData = useMemo(() => {
    if (!chatData) return [];
  
    switch (selectedCategory) {
      case 'completed':
        return chatData.data.filter((chat) => chat.chatStatus === 'successful');
      case 'processing':
        return chatData.data.filter((chat) => chat.chatStatus === 'pending');
      case 'declined':
        return chatData.data.filter((chat) => chat.chatStatus === 'declined');
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
        <Text style={styles.mainHeading}>Chat</Text>
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
              icon={icons.chat}
              heading={`${item.agent.firstname} ${item.agent.lastname}`}
              text={item.recentMessage}
              date={new Date(item.recentMessageTimestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              
              productId={item.id.toString()}
              price='$0.00'
            />
          )}
          style={styles.dataList}
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
});

export default Chat;
