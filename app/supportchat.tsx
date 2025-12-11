import {
  Keyboard,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, icons, images } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { useEffect, useRef, useState, useCallback } from "react";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import MessageInput from "@/components/ChatAgent/MessageInput";
import MessageItem from "@/components/ChatAgent/MessageItem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authContext";
import { getSupportChatById, ISupportMessage } from "@/utils/queries/accountQueries";
import { sendSupportMessage } from "@/utils/mutations/authMutations";
import { showTopToast } from "@/utils/helpers";
import { ApiError } from "@/utils/customApiCalls";

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  sentAt: Date;
  image?: string;
  isSystemNotification?: boolean;
};

const SupportChat = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ chatId?: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickActionsShown, setQuickActionsShown] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const chatId = params.chatId ? parseInt(params.chatId, 10) : null;

  // Fetch chat messages from API
  const {
    data: chatData,
    isLoading: isLoadingChat,
    refetch: refetchChat,
  } = useQuery({
    queryKey: ['supportChat', chatId],
    queryFn: () => getSupportChatById(token, chatId!, { page: 1, limit: 50 }),
    enabled: !!token && !!chatId && !isNaN(chatId),
    refetchInterval: 5000, // Refetch every 5 seconds to get new messages
  });

  // Convert API messages to Message type
  useEffect(() => {
    if (chatData?.data?.messages) {
      const apiMessages: ISupportMessage[] = chatData.data.messages;
      const convertedMessages: Message[] = apiMessages.map((msg) => ({
        id: msg.id.toString(),
        text: msg.message,
        isUser: msg.senderType === 'user',
        sentAt: new Date(msg.createdAt),
      }));

      // If no messages, show welcome message
      if (convertedMessages.length === 0) {
        const welcomeMessage: Message = {
          id: "1",
          text: "Welcome, how can we help you",
          isUser: false,
          sentAt: new Date(Date.now() - 2 * 60 * 1000),
        };
        setMessages([welcomeMessage]);
        setQuickActionsShown(true);
      } else {
        setMessages(convertedMessages);
        setQuickActionsShown(false);
      }
      scrollToBottom();
    } else if (!isLoadingChat && !chatData) {
      // If no chat data and not loading, show welcome message
      const welcomeMessage: Message = {
        id: "1",
        text: "Welcome, how can we help you",
        isUser: false,
        sentAt: new Date(Date.now() - 2 * 60 * 1000),
      };
      setMessages([welcomeMessage]);
      setQuickActionsShown(true);
    }
  }, [chatData, isLoadingChat]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchChat();
    } catch (error) {
      console.error("Error refreshing messages:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Send message mutation
  const { mutate: sendMessage, isPending: sendingMessage } = useMutation({
    mutationKey: ['sendSupportMessage', chatId],
    mutationFn: (data: { message: string; senderType: 'user' }) =>
      sendSupportMessage(chatId!, data, token),
    onSuccess: (response: any) => {
      console.log('Send message response:', JSON.stringify(response, null, 2));
      
      // Extract message data from response - handle different possible response structures
      let messageId: number | undefined;
      let messageText: string | undefined;
      let senderType: 'user' | 'support' | undefined;
      let createdAt: string | undefined;
      
      if (response?.data?.id) {
        messageId = response.data.id;
        messageText = response.data.message;
        senderType = response.data.senderType;
        createdAt = response.data.createdAt;
      } else if (response?.data?.data?.id) {
        messageId = response.data.data.id;
        messageText = response.data.data.message;
        senderType = response.data.data.senderType;
        createdAt = response.data.data.createdAt;
      } else if (response?.id) {
        messageId = response.id;
        messageText = response.message;
        senderType = response.senderType;
        createdAt = response.createdAt;
      }

      // Only add message if we have valid data
      if (messageId && messageText && senderType && createdAt) {
        const newMessage: Message = {
          id: messageId.toString(),
          text: messageText,
          isUser: senderType === 'user',
          sentAt: new Date(createdAt),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setQuickActionsShown(false);
        scrollToBottom();
      }
      
      // Invalidate and refetch to get updated chat (this will also add the message if it wasn't added above)
      queryClient.invalidateQueries({ queryKey: ['supportChat', chatId] });
      queryClient.invalidateQueries({ queryKey: ['supportChats'] });
    },
    onError: (error: ApiError) => {
      console.error('Error sending message:', error);
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.statusCode === 400) {
        errorMessage = error.message || 'Cannot send message. Chat may be completed.';
      } else if (error.statusCode === 404) {
        errorMessage = 'Support chat not found.';
      }
      
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    },
  });

  const handleSendMessage = (message?: string, image?: string) => {
    if (!message && !image) return;
    
    if (!chatId || isNaN(chatId)) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Chat ID is missing. Please try again.',
      });
      return;
    }

    // For now, only text messages are supported by the API
    if (image) {
      showTopToast({
        type: 'info',
        text1: 'Info',
        text2: 'Image messages are not yet supported.',
      });
      return;
    }

    sendMessage({
      message: message || '',
      senderType: 'user',
    });
  };

  const handleQuickAction = (action: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `I need help regarding ${action}`,
      isUser: true,
      sentAt: new Date(Date.now() - 2 * 60 * 1000),
    };
    
    // Add system notification
    const systemNotification: Message = {
      id: (Date.now() + 1).toString(),
      text: "A customer care agent will join you shortly",
      isUser: false,
      sentAt: new Date(Date.now() - 2 * 60 * 1000),
      isSystemNotification: true,
    };
    
    // Add agent response
    const agentMessage: Message = {
      id: (Date.now() + 2).toString(),
      text: "Hello Sir.",
      isUser: false,
      sentAt: new Date(Date.now() - 2 * 60 * 1000),
    };
    
    setMessages((prev) => [...prev, userMessage, systemNotification, agentMessage]);
    setQuickActionsShown(false);
    scrollToBottom();
  };

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => scrollToBottom(), 200);
    });

    return () => {
      Keyboard.removeAllListeners("keyboardDidShow");
    };
  }, []);

  const renderSupportChat = () => {
    if (isLoadingChat) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, dark ? { color: COLORS.white } : { color: COLORS.black }]}>
            Loading messages...
          </Text>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        style={[
          styles.container,
          dark
            ? { backgroundColor: COLORS.black }
            : { backgroundColor: COLORS.white },
        ]}
        behavior="padding"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.isSystemNotification) {
              return (
                <View style={styles.systemNotificationContainer}>
                  <Text style={styles.systemNotificationText}>
                    {item.text}
                  </Text>
                </View>
              );
            }
            return <MessageItem item={item} setImagePreview={() => {}} />;
          }}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={scrollToBottom}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListFooterComponent={
            quickActionsShown && messages.length === 1 ? (
              <View style={styles.quickActionsWrapper}>
                <Text style={styles.timestampText}>2 mins ago</Text>
                <View style={styles.quickActionsContainer}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction("Gift Cards")}
                  >
                    <Text style={styles.quickActionText}>Gift Cards</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction("Crypto")}
                  >
                    <Text style={styles.quickActionText}>Crypto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.quickActionButton, styles.lastQuickActionButton]}
                    onPress={() => handleQuickAction("Bill Payments")}
                  >
                    <Text style={styles.quickActionText}>Bill Payments</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
        />

        <MessageInput
          sendMessage={handleSendMessage}
          sendingMessage={sendingMessage}
        />
      </KeyboardAvoidingView>
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
      edges={['top']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          dark ? { backgroundColor: COLORS.black } : { backgroundColor: COLORS.white },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={icons.arrowBack}
            style={[
              styles.backIcon,
              dark ? { tintColor: COLORS.white } : { tintColor: COLORS.black },
            ]}
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Image
            source={images.userProfile}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.headerText}>
            <Text
              style={[
                styles.headerTitle,
                dark ? { color: COLORS.white } : { color: COLORS.black },
              ]}
            >
              {/* {chatData?.data?.chat?.subject || 'Customer Support'} */}
              {'Customer Support'}
            </Text>
            {/* <Text style={styles.headerStatus}>
              {chatData?.data?.chat?.status === 'completed' 
                ? 'Completed' 
                : chatData?.data?.chat?.status === 'processing'
                ? 'Processing'
                : 'Always online'}
            </Text> */}
          </View>
        </View>
      </View>

      {renderSupportChat()}
    </SafeAreaView>
  );
};

export default SupportChat;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatContainer: { padding: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: 14,
    color: COLORS.primary,
  },
  quickActionsWrapper: {
    marginTop: 4,
    marginBottom: 20,
    width: "95%",
    alignSelf: "center",
  },
  timestampText: {
    fontSize: 12,
    color: "#8A8A8A",
    marginBottom: 12,
    marginLeft: 4,
  },
  quickActionsContainer: {
    backgroundColor: "#EFEFEF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    gap: 0,

    overflow: 'hidden',
  },
  quickActionButton: {
    backgroundColor: "transparent",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    marginBottom: 0,
    borderWidth: 0.5,
    borderColor: "#C6C6C6",
    marginTop:10,
  },
  lastQuickActionButton: {
    borderBottomWidth: 1,

  },
  quickActionText: {
    fontSize: 16,
    color: "#616161",
    textAlign: "left",
  },
  systemNotificationContainer: {
    backgroundColor: "transparent",
    borderRadius: 100,
    paddingVertical: 7,
    paddingHorizontal: 17,
    marginVertical: 8,
    alignSelf: "center",
    borderWidth: 0.5,
    borderColor: "#FFA500",
    maxWidth: "90%",
  },
  systemNotificationText: {
    fontSize: 12,
    color: "#FFA500",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});
