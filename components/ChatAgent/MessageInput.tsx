import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/themeContext';
import { COLORS } from '@/constants';
import * as ImagePicker from 'expo-image-picker';

interface MessageInputProps {
  sendMessage: (message?: string, image?: string) => void;
  sendingMessage: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  sendMessage,
  sendingMessage,
}) => {
  const { dark } = useTheme();
  const [input, setInput] = useState<string>('');
  const [isImagePickerOpen, setIsImagePickerOpen] = useState<boolean>(false);

  const handleSendMessage = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      sendMessage('', result.assets[0].uri);
      setIsImagePickerOpen(false);
    }
  };

  const captureImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      sendMessage('', result.assets[0].uri);
    }
    setIsImagePickerOpen(false);
  };

  return (
    <>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={() => setIsImagePickerOpen(true)}
          style={styles.iconButton}
        >
          <Ionicons
            name="image-outline"
            size={24}
            color={dark ? COLORS.white : COLORS.black}
          />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={dark ? COLORS.white : COLORS.black}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          style={styles.sendMessage}
          disabled={sendingMessage}
        >
          <Text
            style={[
              { fontWeight: 'bold' },
              dark ? { color: COLORS.white } : { color: COLORS.black },
            ]}
          >
            {sendingMessage ? <ActivityIndicator size="small" /> : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>

      {isImagePickerOpen && (
        <Modal transparent={true} visible={isImagePickerOpen}>
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.optionButton}>
              <Text style={styles.optionText}>Pick from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={captureImage}
              style={styles.optionButton}
            >
              <Text style={styles.optionText}>Capture from Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsImagePickerOpen(false)}
              style={styles.optionButton}
            >
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </>
  );
};

export default MessageInput;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  chatContainer: { padding: 10 },
  messageContainer: {
    maxWidth: '70%',
    borderRadius: 10,
    marginVertical: 5,
    paddingVertical: 10,
  },
  userMessage: { alignSelf: 'flex-end' },
  otherMessage: { alignSelf: 'flex-start' },
  userMessageTextColor: { backgroundColor: '#DCF8C6' },
  otherMessageTextColor: { backgroundColor: '#E5E5E5' },
  messageText: { fontSize: 16, padding: 15, borderRadius: 8 },
  timestamp: { fontSize: 12, marginTop: 5, color: COLORS.grayscale400 },
  dynamicImage: { width: '100%', height: undefined, aspectRatio: 1 },
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
