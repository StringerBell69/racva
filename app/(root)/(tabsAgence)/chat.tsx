import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useUser } from "@/store/index";
import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router"; // Import the useLocalSearchParams hook

import Chat from "@/components/Chat";
import { ChatList } from "@/components/ChatList";

const ChatScreen: React.FC = () => {
  const { userId } = useAuth();
  const { setUserId } = useUser();
  const [selectedChat, setSelectedChat] = useState<{
    chatId: string;
    recipientId: number;
  } | null>(null);

  // Utiliser useLocalSearchParams pour obtenir les paramètres de requête de l'URL
  const { chatId, clientId } = useLocalSearchParams(); // chatId et clientId seront directement disponibles

  useEffect(() => {
    if (chatId && clientId) {
      setSelectedChat({
        chatId: chatId as string,
        recipientId: parseInt(clientId as string, 10),
      });
    }
  }, [chatId, clientId]); // Réexécution lorsque chatId ou clientId change

  if (!userId) {
    return <Text>Chargement...</Text>; // Afficher le chargement si userId n'est pas disponible (c'est-à-dire, l'utilisateur n'est pas connecté)
  }

  // Si selectedChat est défini (soit à partir des paramètres de requête ou de la sélection dans ChatList), afficher le chat
  return selectedChat === null ? (
    <ChatList
      onSelectChat={(chatId, recipientId) =>
        setSelectedChat({ chatId, recipientId })
      }
    />
  ) : (
    <Chat
      userId={userId}
      chat_id={selectedChat.chatId}
      recipientId={selectedChat.recipientId}
      setSelectedChat={setSelectedChat}
    />
  );
};

export default ChatScreen;
