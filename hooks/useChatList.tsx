import { useState, useEffect } from "react";
import { useWebSocket } from "./useWebsockets";

interface Chat {
  recipientId: number;
  lastMessage: string;
}

export const useChatList = (userId: string) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected, error } = useWebSocket(userId);

  useEffect(() => {
    if (socket && isConnected) {
      console.log("ChatList: WebSocket connected for user:", userId);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("ChatList received message:", data);

        switch (data.type) {
          case "chat_history":
            if (data.messages) {
              const uniqueChats = new Map();
              data.messages.forEach((msg: any) => {
                const otherUserId =
                  msg.sender_id === parseInt(userId)
                    ? msg.recipient_id
                    : msg.sender_id;
                uniqueChats.set(otherUserId, {
                  recipientId: otherUserId,
                  lastMessage: msg.message,
                });
              });
              setChats(Array.from(uniqueChats.values()));
            }
            setLoading(false);
            break;

          case "new_message":
            if (data.message) {
              const otherUserId =
                data.message.sender_id === parseInt(userId)
                  ? data.message.recipient_id
                  : data.message.sender_id;
              setChats((prev) => {
                const chatExists = prev.some(
                  (chat) => chat.recipientId === otherUserId
                );
                if (!chatExists) {
                  return [
                    ...prev,
                    {
                      recipientId: otherUserId,
                      lastMessage: data.message.message,
                    },
                  ];
                }
                return prev.map((chat) =>
                  chat.recipientId === otherUserId
                    ? { ...chat, lastMessage: data.message.message }
                    : chat
                );
              });
            }
            break;
        }
      };

      const fetchChatsMessage = { type: "fetch_chat_list", userId };
      console.log("Requesting chat list:", fetchChatsMessage);
      socket.send(JSON.stringify(fetchChatsMessage));
    }
  }, [socket, isConnected, userId]);

  return { chats, loading, error };
};
