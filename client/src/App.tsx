import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lobby from "./pages/Lobby/Lobby";
import Room from "./pages/Room/Room";
import { useEffect, useState } from "react";
import { SOCKET_SERVER_URL } from "./const/const";
import { io, Socket } from "socket.io-client";
import { AppContext } from "./context/AppContext";
import { Toaster } from "react-hot-toast";

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketRef = io(SOCKET_SERVER_URL);
    setSocket(socketRef);
    return () => {
      socketRef.disconnect();
      setSocket(null);
    };
  }, []);
  return (
    <AppContext.Provider value={{ socket, setSocket }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "350px",
            wordWrap: "break-word",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
            duration: 4500,
          },
          loading: {
            iconTheme: {
              primary: "#3B82F6",
              secondary: "#fff",
            },
          },
        }}
        containerStyle={{
          top: 20,
          left: 20,
          bottom: 20,
          right: 20,
        }}
      />
    </AppContext.Provider>
  );
}

export default App;
