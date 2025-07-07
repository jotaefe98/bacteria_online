import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lobby from "./pages/Lobby/Lobby";
import Room from "./pages/Room/Room";
import { useEffect, useState } from "react";
import { SOCKET_SERVER_URL } from "./const/const";
import { io, Socket } from "socket.io-client";
import { AppContext } from "./context/AppContext";

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
    </AppContext.Provider>
  );
}

export default App;
