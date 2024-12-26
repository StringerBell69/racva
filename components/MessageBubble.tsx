import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Message } from "@/types/type";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  return (
    <View
      style={[
        styles.container,
        { alignSelf: isCurrentUser ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          styles.bubble,
          { backgroundColor: isCurrentUser ? "#CA8A04" : "#f4f4f4" }, // Gold for current user and light gray for recipient
        ]}
      >
        <Text
          style={[styles.text, { color: isCurrentUser ? "white" : "black" }]} // White text for current user, black for recipient
        >
          {message.message}
        </Text>
        <Text
          style={[
            styles.timestamp,
            {
              color: isCurrentUser
                ? "rgba(255, 255, 255, 0.7)" // Lighter white for timestamp of current user
                : "rgba(0, 0, 0, 0.5)", // Darker gray for timestamp of recipient
            },
          ]}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    maxWidth: "80%",
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    shadowColor: "rgba(0, 0, 0, 0.1)", // Light shadow for a soft 3D effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 5,
  },
});
