import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { useUser } from "@/store/index";

interface ChatListProps {
  onSelectChat: (chatId: string, recipientId: number) => void;
}

interface Chat {
  recipientId: number;
  chatId: string;
  lastMessage: string;
  user_name: string;
  last_message_from_other_user: string;
  recipientName: string;
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const { userId } = useAuth();
  const { id, setUserId } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat IDs from the API
  const fetchChatIds = async () => {
    try {
      const response = await fetch(`/(api)/${userId}`); // Ensure this URL is correct
      const data = await response.json();
      return data.data || []; // Ensure data is an array of chat objects
    } catch (err) {
      setError("Failed to fetch chat IDs");
      setLoading(false);
      return [];
    }
  };

  // Load chats after fetching chat IDs
  const loadChats = async () => {
    setLoading(true);
    setError(null);
    const chatData = await fetchChatIds();

    if (chatData.length > 0) {
      setUserId(chatData[0].user_id);
    } else {
    }
    if (chatData.length > 0) {
      try {
        // Filter out duplicate chats by chatId
        const uniqueChats = Array.from(
          new Map(chatData.filter((chat: any) => chat.recipient_id !== chat.user_id).map((chat: any) => [chat.chat_id, chat])).values()
        );

        const fetchedChats: Chat[] = uniqueChats.map((chat: any) => ({
          recipientId: chat.recipient_id,
          chatId: chat.chat_id,
          lastMessage: chat.last_message_from_other_user,
          recipientName: chat.other_user_name,
          user_name: chat.user_name,
        }));

        setChats(fetchedChats);
      } catch (err) {
        setError("Failed to load chats");
      }
    } else {
      setError("No chats available");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      loadChats();
    }
  }, [userId]);

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-300"
      onPress={() => {
        onSelectChat(item.chatId, item.recipientId);
      }}
    >
      <Text className="font-semibold text-lg">
        {item.recipientName}
      </Text>
      <Text className="text-gray-600 text-sm">{item.lastMessage}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      {loading ? (
        <Text className="text-center text-gray-500 py-5">Loading...</Text>
      ) : error ? (
        <Text className="text-center text-red-500 py-5">{error}</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.chatId}
          renderItem={renderChatItem}
          ListEmptyComponent={() => (
            <Text className="text-center text-gray-500 py-5">
              No chats available
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
};
