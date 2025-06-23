import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { io } from "socket.io-client";
import config from "../config";

const socketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const socketUrl = config.getSocketUrl();
    console.log('🔌 Connecting to Socket Service:', socketUrl);
    
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      timeout: 20000,
      forceNew: true,
    });

    s.on("connect", () => {
      console.log("✅ Socket connected!", s.id);
      setConnectionStatus('connected');
    });
    
    s.on("connect_error", (err) => {
      console.error("❌ Socket connect_error", err);
      setConnectionStatus('error');
    });
    
    s.on("connect_failed", (err) => {
      console.error("❌ Socket connect_failed", err);
      setConnectionStatus('failed');
    });
    
    s.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setConnectionStatus('disconnected');
    });
    
    s.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setConnectionStatus('connected');
    });
    
    s.on("reconnect_error", (err) => {
      console.error("❌ Socket reconnect_error", err);
      setConnectionStatus('error');
    });

    setSocket(s);

    return () => {
      console.log('🔌 Disconnecting socket...');
      s.disconnect();
    };
  }, []);

  return (
    <socketContext.Provider value={{ socket, connectionStatus }}>
      {children}
    </socketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(socketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};