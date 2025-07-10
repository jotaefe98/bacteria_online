import { useState, useEffect } from "react";
import type { Socket } from "socket.io-client";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

interface UseSocketConnectionOptions {
  socket: Socket | null;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

/**
 * Hook to monitor socket connection status and provide connection management
 */
export function useSocketConnection({
  socket,
  onConnectionChange,
}: UseSocketConnectionOptions) {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!socket) {
      setConnectionStatus("disconnected");
      return;
    }

    const updateStatus = (status: ConnectionStatus) => {
      setConnectionStatus(status);
      onConnectionChange?.(status);

      if (status === "connected") {
        setLastConnectedAt(new Date());
      }
    };

    // Initial status
    if (socket.connected) {
      updateStatus("connected");
    } else {
      updateStatus("disconnected");
    }

    // Connection event listeners
    const handleConnect = () => updateStatus("connected");
    const handleDisconnect = () => updateStatus("disconnected");
    const handleConnecting = () => updateStatus("connecting");
    const handleReconnect = () => updateStatus("connected");
    const handleReconnecting = () => updateStatus("reconnecting");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connecting", handleConnecting);
    socket.on("reconnect", handleReconnect);
    socket.on("reconnecting", handleReconnecting);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connecting", handleConnecting);
      socket.off("reconnect", handleReconnect);
      socket.off("reconnecting", handleReconnecting);
    };
  }, [socket, onConnectionChange]);

  const reconnect = () => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  };

  const disconnect = () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  };

  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    isReconnecting: connectionStatus === "reconnecting",
    lastConnectedAt,
    reconnect,
    disconnect,
  };
}
