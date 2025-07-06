# Bacteria Online - Cliente

Este proyecto es el cliente web de **Bacteria Online**, un juego multijugador en línea inspirado en juegos de cartas como Virus. El cliente está desarrollado con **React**, **TypeScript** y utiliza **Vite** para el desarrollo y build rápido.

## 🕹️ ¿De qué va el juego?

El objetivo es crear salas donde los jugadores pueden unirse mediante un código o enlace, elegir su nickname y esperar a que el host inicie la partida. El flujo principal es:

1. Un usuario crea una sala (se genera un código único).
2. Otros jugadores pueden unirse introduciendo el código de la sala.
3. Cada jugador debe elegir un nickname.
4. El host puede iniciar la partida cuando haya suficientes jugadores.

> **Nota:** La lógica del juego como tal aún no está implementada, solo la gestión de salas y jugadores.

## 📦 Estructura actual

- **src/pages/Lobby/**: Pantalla principal para crear o unirse a una sala.
- **src/pages/Room/**: Pantalla de la sala, muestra jugadores, permite cambiar nickname y empezar la partida.
- **src/components/**: Componentes reutilizables como listas de jugadores, cartas, tablero, etc.
- **src/hooks/**: Hooks personalizados para la gestión de sockets y lógica de sala.
- **src/interfaces/**: Tipos TypeScript para la comunicación con el servidor.
- **src/const/**: Constantes globales como la URL del servidor de sockets.

## 🚀 Funcionalidades implementadas

- Crear y unirse a salas mediante código.
- Persistencia de playerId y nickname en localStorage.
- Gestión de nicknames y host.
- Control de inicio de partida solo por el host.
- Actualización en tiempo real de la lista de jugadores.
- Manejo de errores comunes (sala llena, inexistente, partida ya iniciada).

## 🛠️ Tecnologías

- React 19 + TypeScript
- Vite
- socket.io-client
- ESLint configurado para React y TypeScript

## 📝 Pendiente

- Implementar la lógica del juego.
- Mejorar la UI/UX.
- Añadir tests.
- Ver [TODO.md](../TODO.md) para más detalles.

---

Este README resume el estado actual del cliente. Para el backend, revisa la carpeta [server](../server).