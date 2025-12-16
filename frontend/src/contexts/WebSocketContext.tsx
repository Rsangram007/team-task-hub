import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      // Get the WebSocket URL from environment variables or use default
      const wsUrl =
        import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:3000";

      // Initialize Socket.IO client
      socketRef.current = io(wsUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to WebSocket server");
        setIsConnected(true);

        // Join user room
        socketRef.current?.emit("join_room", `user_${user.id}`);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
        setIsConnected(false);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
      });
    }

    // Cleanup on unmount or when user changes
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user]);

  return (
    <WebSocketContext.Provider
      value={{ socket: socketRef.current, isConnected }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
