import { useEffect } from "react";
import type { Socket } from "socket.io-client";

interface UseBeforeUnloadOptions {
  socket: Socket | null;
  roomId?: string;
  playerId?: string;
}

/**
 * Hook para detectar cuando el usuario cierra el navegador o pestaña
 * y notificar al servidor para sacarlo de la sala
 */
export function useBeforeUnload({
  socket,
  roomId,
  playerId,
}: UseBeforeUnloadOptions) {
  useEffect(() => {
    if (!socket || !roomId || !playerId) return;

    const handleBeforeUnload = () => {
      // Enviar señal al servidor de forma síncrona
      socket.emit("player-disconnect", {
        roomId,
        playerId,
        reason: "browser-close",
      });
    };

    const handleUnload = () => {
      // Fallback para el evento unload
      if (socket.connected) {
        socket.emit("player-disconnect", {
          roomId,
          playerId,
          reason: "page-unload",
        });
      }
    };

    const handleVisibilityChange = () => {
      // Detectar cuando la pestaña se oculta (opcional)
      if (document.hidden) {
        // La pestaña se ocultó - podrías implementar lógica adicional aquí
        console.log("Tab hidden");
      } else {
        // La pestaña volvió a estar visible
        console.log("Tab visible");
      }
    };

    // Agregar event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, roomId, playerId]);
}
