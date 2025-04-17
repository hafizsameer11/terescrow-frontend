// components/ImagePreviewOverlay.tsx

import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { COLORS } from "@/constants";

interface Props {
  visible: boolean;
  imageUri: string | null;
  onSend: () => void;
  onCancel: () => void;
}

const ImagePreviewOverlay: React.FC<Props> = ({
  visible,
  imageUri,
  onSend,
  onCancel,
}) => {
  if (!visible || !imageUri) return null;

  return (
    <View style={styles.overlay}>
      <Image
        source={{ uri: imageUri }}
        style={styles.previewImage}
        contentFit="contain"
        onLoad={() => console.log("✅ Custom modal image loaded")}
        onError={(e) => console.log("❌ Custom modal image load error", e.nativeEvent)}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={onSend}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImagePreviewOverlay;

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: "rgba(0,0,0,0.95)",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "90%",
    height: "60%",
    borderRadius: 10,
  },
  actions: {
    flexDirection: "row",
    marginTop: 20,
  },
  button: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: COLORS.black,
    fontWeight: "bold",
    fontSize: 16,
  },
});
