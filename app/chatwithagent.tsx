import {
  Keyboard,
  StyleSheet,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatPfpNav from '@/components/ChatPfpNav';
import { COLORS, images } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import { Image } from 'expo-image';
import { FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MessageInput from '@/components/ChatAgent/MessageInput';
import MessageItem from '@/components/ChatAgent/MessageItem';
import { useSocket } from '@/contexts/socketContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ISendMessageReq,
  sendMessageController,
} from '@/utils/mutations/chatMutations';
import { ApiError } from '@/utils/customApiCalls';
import { showTopToast } from '@/utils/helpers';
import { useAuth } from '@/contexts/authContext';
import { useNavigation } from 'expo-router';
import { NavigationProp, useRoute } from '@react-navigation/native';
import LoadingOverlay from '@/components/LoadingOverlay';
import { getChatDetails } from '@/utils/queries/chatQueries';

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  sentAt: Date;
  image?: string;
};

type newMessage = {
  message: string;
  id: number;
  senderId: number;
  receiverId: number;
  chatId: number;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const ChatWithAgent = () => {
  const { dark } = useTheme();
  const { navigate, goBack } = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { chatId }: { chatId: string } = route.params as any;

  if (!chatId) {
    return goBack();
  }

  const flatListRef = useRef<FlatList>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket } = useSocket();
  const { token, userData } = useAuth();
  const {
    data: chatDetailsData,
    isLoading: loadingChatDetails,
    isError: isErrorChatDetails,
    error: errorChatDetails,
  } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => getChatDetails(chatId, token),
  });
  const { mutate, isPending: sendingMessage } = useMutation({
    mutationKey: ['send-message'],
    mutationFn: (data: ISendMessageReq) => sendMessageController(data, token),
    onSuccess: (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.data.id.toString(),
          text: data.data.message,
          isUser: true,
          sentAt: data.data.createdAt,
        },
      ]);
    },
    onError: (error: ApiError) => {
      console.log(error);
      showTopToast({ type: 'error', text1: 'Error', text2: error.message });
    },
  });

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (socket) {
      socket.on(
        'message',
        ({ from, message }: { from: number; message: newMessage }) => {
          console.log(from, message);
          console.log('My id: ', userData?.id);
          console.log('agentId: ', chatDetailsData?.data.receiverDetails.id);
          if (
            from == userData?.id ||
            from != chatDetailsData?.data.receiverDetails.id
          )
            return;
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: message.id.toString(),
              text: message.message,
              isUser: false,
              sentAt: message.createdAt,
            },
          ]);
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      );
    }

    return () => {
      if (socket) {
        socket.off('message');
      }
    };
  }, [socket]);

  //handling chat details
  useEffect(() => {
    if (chatDetailsData) {
      const oldMessages = chatDetailsData.data.messages.map((message) => {
        return {
          id: message.id.toString(),
          text: message.message,
          isUser: message.senderId !== chatDetailsData.data.receiverDetails.id,
          sentAt: message.createdAt,
        };
      });
      
      setMessages((prevMessages) => [...prevMessages, ...oldMessages]);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [chatDetailsData]);

  const handleSendMessage = (message?: string, image?: any) => {
    if (!image && !message) return;

    let newMessage: Message;

    if (!image) {
      newMessage = {
        id: (messages.length + 1).toString(),
        text: message || '',
        isUser: true,
        sentAt: new Date(),
      };
    } else {
      newMessage = {
        id: (messages.length + 1).toString(),
        text: message || '',
        isUser: true,
        image: image,
        sentAt: new Date(),
      };
    }

    if (message) {
      console.log(message);
      mutate({
        message: message,
        chatId,
      });
    }
  };

  //this event listener scrolls to bottom to view full content
  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {
      // console.log('ok');
      setTimeout(() => scrollToBottom(), 200);
    });

    return () => {
      Keyboard.removeAllListeners;
    };
  }, []);

  const renderAgentChat = () => {
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
          renderItem={({ item }) => (
            <MessageItem item={item} setImagePreview={setImagePreview} />
          )}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={scrollToBottom}
        />

        <MessageInput
          sendMessage={handleSendMessage}
          sendingMessage={sendingMessage}
        />

        {imagePreview && (
          <Modal transparent={true} visible={!!imagePreview}>
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: imagePreview }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setImagePreview(null)}
              >
                <Ionicons name="arrow-back" size={40} color="black" />
              </TouchableOpacity>
            </View>
          </Modal>
        )}
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
    >
      <ChatPfpNav
        name={
          chatDetailsData?.data?.receiverDetails.firstname +
          ' ' +
          chatDetailsData?.data?.receiverDetails.lastname
        }
        status="Always Online"
        image={
          chatDetailsData?.data?.receiverDetails.profilePicture ||
          images.maskGroup
        }
      />
      {renderAgentChat()}
      <LoadingOverlay visible={loadingChatDetails} />
    </SafeAreaView>
  );
};

export default ChatWithAgent;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  chatContainer: { padding: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingStart: 20,
    paddingEnd: 60,
    borderRadius: 25,
    marginHorizontal: 10,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.grayscale400,
  },
  iconButton: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 50,
    borderColor: COLORS.grayscale400,
  },
  sendMessage: {
    position: 'absolute',
    right: 20,
    paddingVertical: 10,
    paddingRight: 20,
  },
  imagePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  optionButton: {
    backgroundColor: COLORS.white,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    padding: 5,
  },
});
