import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Device from 'expo-device';

import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from 'expo-media-library';
import ImagePreviewModal from "./ImagePreviewModal";
import ImagePreviewOverlay from "./ImagePreviewOverlay";
import * as ImageManipulator from 'expo-image-manipulator'; // ✅

interface MessageInputProps {
  sendMessage: (message?: string, image?: string) => void;
  sendingMessage: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  sendMessage,
  sendingMessage,
}) => {
  const { dark } = useTheme();
  const [input, setInput] = useState<string>("");
  const [isImagePickerOpen, setIsImagePickerOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const selectedImageRef = useRef<string | null>(null);

  const handleSendMessage = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };
  async function compressImageAsync(uri: string) {
    try {
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], // Resize width to 1024px
        {
          compress: 0.7, // 70% quality for good balance
          format: ImageManipulator.SaveFormat.JPEG, // Always save as JPEG
        }
      );
      return compressedImage.uri;
    } catch (error) {
      console.error('Image compression error:', error);
      return uri; // fallback: send original if compression fails
    }
  }
  
  const confirmImageSend = async() => {
    if (selectedImage) {
      const compressedUri = await compressImageAsync(selectedImage);
      console.log('Compressed Image URI:', compressedUri);

      sendMessage("", compressedUri); // Send compressed image now

      // sendMessage("", selectedImage); // Send the selected image
      setSelectedImage(null); // Clear preview
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri); // Show preview
      setIsPreviewVisible(true); // trigger modal
      selectedImageRef.current = result.assets[0].uri;

      console.log("Image URI:", selectedImage);
      let uri = result.assets[0].uri;
      console.log("current image url", selectedImageRef.current)
      if (Platform.OS === "ios" && uri.startsWith("ph://")) {
        const asset = await MediaLibrary.getAssetInfoAsync(result.assets[0].assetId);
        uri = asset.localUri ?? uri;
      }

      console.log("Final usable URI:", uri);

      setIsImagePickerOpen(false); // Close picker modal
    }
  };

  const captureImage = async () => {
    if (!Device.isDevice) {
      Alert.alert("Not Supported", "Camera is not available on simulator.");
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required to take photos.");
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      selectedImageRef.current = imageUri;
      setIsPreviewVisible(true); // Open image preview
      setIsImagePickerOpen(false); // Close the picker modal
    }
  };
  
  useEffect(() => {
    if (selectedImage) {
      console.log("selectedImage updated:", selectedImage);
    }
  }, [selectedImage]);

  useEffect(() => {

    console.log("selectedImageRef updated:", selectedImageRef.current);
    console.log("is previeable:", isPreviewVisible);
  }, [isPreviewVisible]);
  useEffect(() => {
    console.log("🧠 MessageInput MOUNTED");
  }, []);
  useEffect(() => {
    console.log("📦 Modal mounted");
    return () => {
      console.log("🧹 Modal unmounted");
    };
  }, []);

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
          {sendingMessage ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={[
                { fontWeight: "bold" },
                dark ? { color: COLORS.white } : { color: COLORS.black },
              ]}
            >
              Send
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal */}
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

      {/* Image Preview Modal */}
      {/* {selectedImage && ( */}




      <ImagePreviewOverlay
        visible={isPreviewVisible}
        imageUri={selectedImage}
        onSend={() => {
          confirmImageSend();
          setIsPreviewVisible(false);
          setSelectedImage(null);
        }}
        onCancel={() => {
          setIsPreviewVisible(false);
          setSelectedImage(null);
        }}
      />

    </>
  );
};

export default MessageInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
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
    position: "absolute",
    right: 20,
    paddingVertical: 10,
    paddingRight: 20,
  },
  imagePickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  optionButton: {
    backgroundColor: COLORS.white,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: { width: "90%", height: "60%", resizeMode: "contain" },
  previewActions: {
    flexDirection: "row",
    marginTop: 20,
  },
  previewButton: {
    backgroundColor: COLORS.white,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    width: 120,
    alignItems: "center",
  },
});
