import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Message } from "@/types/type";
import { useWebSocket } from "@/hooks/useWebsockets";
import { MessageBubble } from "@/components/MessageBubble";
import { icons } from "@/constants";
import { MessageInput } from "@/components/MessageInput";
import { useUser } from "@/store/index";

interface ChatProps {
  userId: string;
  recipientId: number;
  chat_id: string;
  setSelectedChat: React.Dispatch<
    React.SetStateAction<{ chatId: string; recipientId: number } | null>
  >;
}

const Chat: React.FC<ChatProps> = ({
  userId,
  recipientId,
  chat_id,
  setSelectedChat,
}) => {
  const { id } = useUser(); // Récupérer l'ID de l'utilisateur connecté du store
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket, isConnected, error, sendMessage } = useWebSocket(
    chat_id.toString()
  );
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (socket && isConnected) {
      console.log("Chat: WebSocket connecté pour l'utilisateur:", id);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Chat a reçu un message:", data);

        if (data.type === "chat_history" && data.messages) {
          setMessages(data.messages);
        } else if (
          data.type === "new_message" &&
          data.message &&
          data.message.chat_id === chat_id
        ) {
          setMessages((prev) => [...prev, data.message]);
        }
      };

      const fetchChatMessage = { type: "fetch_chat", chatId: chat_id };
      console.log("Demande de l'historique du chat:", fetchChatMessage);
      socket.send(JSON.stringify(fetchChatMessage));
    }
  }, [socket, isConnected, id, chat_id]);

  // Assurer que l'ID est un nombre valide ou tomber en arrière sur -1 ou 0
  const currentUserId = id ? parseInt(id) : -1;
  console.log(currentUserId);
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const message = {
      type: "new_message",
      message: {
        chat_id: chat_id,
        sender_id: currentUserId.toString(),
        recipient_id: recipientId,
        message: text,
      },
    };
    console.log("Envoi du message:", message);
    sendMessage(message);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1">
          <View className="absolute top-2 left-2 z-10">
            <Pressable
              onPress={() => setSelectedChat(null)}
              className="p-3 bg-gold rounded-full"
            >
              <Image
                source={icons.backArrow}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </Pressable>
          </View>
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-2 pt-10"
            contentContainerStyle={{ paddingBottom: 80 }} // Add extra padding at the bottom
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
          >
            {!isConnected ? (
              <Text className="text-center text-gray-400 py-5">
                Connexion...
              </Text>
            ) : error ? (
              <Text className="text-center text-red-500 py-5">{error}</Text>
            ) : messages.length === 0 ? (
              <Text className="text-center text-gray-400 py-5">
                Aucun message pour l'instant
              </Text>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isCurrentUser={msg.sender_id === currentUserId}
                />
              ))
            )}
          </ScrollView>
          <View className="pb-20 mb-5">
            <MessageInput onSend={handleSendMessage} disabled={!isConnected} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
