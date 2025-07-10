import { useAppContext } from "../../context/AppContext";
import { useSocketConnection } from "../../hooks/useSocketConnection";
import type { ConnectionStatus } from "../../hooks/useSocketConnection";
import "./ConnectionIndicator.css";

interface ConnectionIndicatorProps {
  className?: string;
}

export default function ConnectionIndicator({
  className = "",
}: ConnectionIndicatorProps) {
  const { socket } = useAppContext();
  const { connectionStatus } = useSocketConnection({ socket });

  const getStatusInfo = (status: ConnectionStatus) => {
    switch (status) {
      case "connected":
        return { icon: "🟢", text: "Connected", class: "connected" };
      case "connecting":
        return { icon: "🟡", text: "Connecting...", class: "connecting" };
      case "reconnecting":
        return { icon: "🟡", text: "Reconnecting...", class: "reconnecting" };
      case "disconnected":
        return { icon: "🔴", text: "Disconnected", class: "disconnected" };
      default:
        return { icon: "⚫", text: "Unknown", class: "unknown" };
    }
  };

  const statusInfo = getStatusInfo(connectionStatus);

  return (
    <div className={`connection-indicator ${statusInfo.class} ${className}`}>
      <span className="connection-icon">{statusInfo.icon}</span>
      <span className="connection-text">{statusInfo.text}</span>
    </div>
  );
}
