import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { SetStateAction } from "react";
import { Message } from "@/app/chatwithagent";
import { Image } from "expo-image";
import { COLORS } from "@/constants";
import { API_BASE_URL } from "@/utils/apiConfig";

type PropTypes = {
  item: Message;
  setImagePreview: React.Dispatch<SetStateAction<string | null>>;
};
const MessageItem = ({ item, setImagePreview }: PropTypes) => {
  // console.log(`${API_BASE_URL}/uploads/${item.image}`)
  return (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.otherMessage,
      ]}
    >
     {item.image && (
        <TouchableOpacity
          onPress={() =>
            setImagePreview(`${API_BASE_URL}/uploads/${item.image}` as string)
          }
          style={[
            styles.imageContainer,
            item.isUser
              ? styles.userImageBackground
              : styles.otherImageBackground,
          ]}
        >
          <Image
            source={{ uri: `${API_BASE_URL}/uploads/${item.image}` }}
            style={styles.dynamicImage}
          />
        </TouchableOpacity>
      )}
      {!item.image && (
        <Text
          style={[
            styles.messageText,
            item.isUser
              ? styles.userMessageTextColor
              : styles.otherMessageTextColor,
          ]}
        >
          {item.text}
        </Text>
      )}
      <Text
        style={[
          styles.timestamp,
          { alignSelf: item.isUser ? "flex-end" : "flex-start" },
        ]}
      >
        {item?.sentAt &&
          new Date(item.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
      </Text>
    </View>
  );
};

export default MessageItem;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "70%",
    borderRadius: 10,
    marginVertical: 5,
    paddingVertical: 10,
  },
  userMessage: { alignSelf: "flex-end" },
  otherMessage: { alignSelf: "flex-start" },
  userMessageTextColor: { backgroundColor: "#E1FFEF" },
  otherMessageTextColor: { backgroundColor: "#EFEFEF" },
  messageText: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  timestamp: { fontSize: 12, marginTop: 5, color: COLORS.grayscale400 },
  dynamicImage: { width: "100%", height: undefined, aspectRatio: 1 },
  imageContainer: {
    padding: 5, // Add padding around the image
    borderRadius: 12, // Make the corners round
  },
  userImageBackground: {
    backgroundColor: "#E1FFEF",
    borderColor: "#A7E8C1",
    borderWidth: 1,
  },
  otherImageBackground: {
    backgroundColor: "#EFEFEF",
    borderColor: "#D1D1D1",
    borderWidth: 1,
  },
});
