import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "@/types/type";

const WS_URL = process.env.WS_SERVER;
console.log('WS_URL',WS_URL);
export const useWebSocket = (chatId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!WS_URL) {
      throw new Error("WebSocket URL is not defined");
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "fetch_chat", chatId }));
    };

    ws.onclose = () => {
      setIsConnected(false);
      setError("WebSocket disconnected");
    };

    ws.onerror = () => {
      setError("WebSocket error occurred");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [WS_URL]);

  const sendMessage = useCallback(
    (message: any) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify(message));
      }
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    error,
    sendMessage,
  };
};
