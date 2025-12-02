import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupportChat, ICreateSupportChatReq } from '@/utils/mutations/authMutations';
import Input from '@/components/CustomInput';
import Button from '@/components/Button';
import { showTopToast } from '@/utils/helpers';

const CreateSupportChat = () => {
  const { dark } = useTheme();
  const router = useRouter();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  const { mutate: createChat, isPending: isCreating } = useMutation({
    mutationKey: ['createSupportChat'],
    mutationFn: (data: ICreateSupportChatReq) => createSupportChat(data, token),
    onSuccess: (response: any) => {
      console.log('Create support chat response:', JSON.stringify(response, null, 2));
      
      // Extract chat ID from response - handle different possible response structures
      let chatId: number | undefined;
      
      // Try different possible response structures
      if (response?.data?.id) {
        chatId = response.data.id;
      } else if (response?.data?.data?.id) {
        chatId = response.data.data.id;
      } else if (response?.id) {
        chatId = response.id;
      } else if (response?.data?.chat?.id) {
        chatId = response.data.chat.id;
      } else if (response?.chat?.id) {
        chatId = response.chat.id;
      }

      showTopToast({
        type: 'success',
        text1: 'Success',
        text2: 'Support chat created successfully',
      });
      
      // Invalidate and refetch support chats
      queryClient.invalidateQueries({ queryKey: ['supportChats'] });
      
      // Navigate back first
      router.back();
      
      // Navigate to the chat screen if we have a chat ID
      if (chatId) {
        setTimeout(() => {
          router.push({
            pathname: '/supportchat' as any,
            params: { chatId: chatId.toString() },
          } as any);
        }, 300);
      } else {
        console.warn('Chat ID not found in response, navigating back to support list');
        console.warn('Response structure:', response);
        // If no chat ID, just stay on the support list (already navigated back)
      }
    },
    onError: (error: any) => {
      console.error('Create support chat error:', error);
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create support chat',
      });
    },
  });

  const handleSubmit = () => {
    if (!subject.trim()) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a subject',
      });
      return;
    }
    if (!category.trim()) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a category',
      });
      return;
    }
    if (!initialMessage.trim()) {
      showTopToast({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter an initial message',
      });
      return;
    }

    createChat({
      subject: subject.trim(),
      category: category.trim(),
      initialMessage: initialMessage.trim(),
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        dark ? { backgroundColor: COLORS.dark1 } : { backgroundColor: COLORS.white },
      ]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
    

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subject Input */}
          <View style={styles.inputSection}>
            <Input
              id="subject"
              label="Subject"
              variant="signin"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          {/* Category Input */}
          <View style={styles.inputSection}>
            <Input
              id="category"
              label="Category"
              variant="signin"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          {/* Initial Message Input */}
          <View style={styles.inputSection}>
            <Input
              id="initialMessage"
              label="Message"
              variant="signin"
              value={initialMessage}
              onChangeText={setInitialMessage}
              multiline
              numberOfLines={6}
              style={styles.messageInput}
            />
          </View>
        </ScrollView>

        {/* Submit Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <Button
            title={isCreating ? 'Creating...' : 'Create Chat'}
            onPress={handleSubmit}
            disabled={isCreating}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    backgroundColor: 'transparent',
  },
});

export default CreateSupportChat;

