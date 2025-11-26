import {
  Keyboard,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
  Text,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, icons, images } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import MessageInput from "@/components/ChatAgent/MessageInput";
import MessageItem from "@/components/ChatAgent/MessageItem";

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
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickActionsShown, setQuickActionsShown] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Initialize with just the welcome message to show quick actions
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "1",
      text: "Welcome, how can we help you",
      isUser: false,
      sentAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    };
    setMessages([welcomeMessage]);
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = (message?: string, image?: string) => {
    if (!message && !image) return;

    setSendingMessage(true);
    // Simulate sending message
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message || "",
        isUser: true,
        sentAt: new Date(),
        image: image,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setQuickActionsShown(false);
      setSendingMessage(false);
      scrollToBottom();
    }, 300);
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
              Customer Support
            </Text>
            <Text style={styles.headerStatus}>Always online</Text>
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
});
