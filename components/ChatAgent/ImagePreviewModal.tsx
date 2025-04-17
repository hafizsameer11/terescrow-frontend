// components/ImagePreviewModal.tsx

import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/constants";

interface Props {
  visible: boolean;
  imageUri: string | null;
  onSend: () => void;
  onCancel: () => void;
}

const ImagePreviewModal: React.FC<Props> = ({
  visible,
  imageUri,
  onSend,
  onCancel,
}) => {
//   if (!visible || !imageUri) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      presentationStyle="overFullScreen"
      onRequestClose={onCancel}
    >
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.previewImage}
          contentFit="contain"
          onLoad={() => console.log("✅ Image loaded")}
          onError={(e) =>
            console.log("❌ Image load error:", e.nativeEvent)
          }
        />

        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.previewButton} onPress={onSend}>
            <Text style={styles.optionText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.previewButton} onPress={onCancel}>
            <Text style={styles.optionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ImagePreviewModal;

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "90%",
    height: "60%",
    resizeMode: "contain",
  },
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
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
});
