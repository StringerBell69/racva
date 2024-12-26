import React from "react";
import { ScrollView, View, Text } from "react-native";
import { MessageBubble } from "@/components/MessageBubble";
import { Message } from "@/types/type";

interface ChatMessagesProps {
  messages: Message[];
  userId: number;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, userId }) => {
  if (messages.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">No Messages Yet</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isCurrentUser={msg.sender_id === userId}
        />
      ))}
    </ScrollView>
  );
};