# Bacteria Online - Cliente

Este proyecto es el cliente web de **Bacteria Online**, un juego multijugador en línea inspirado en el juego de cartas Bacteria. El cliente está desarrollado con **React**, **TypeScript** y utiliza **Vite** para el desarrollo y build rápido.

## 🕹️ ¿De qué va el juego?

Bacteria Online es un juego de cartas estratégico donde los jugadores compiten para ser los primeros en completar cuerpos sanos con 4 órganos de diferentes colores, mientras sabotean a sus oponentes con virus y tratamientos especiales.

### Flujo del juego:

1. **Crear/Unirse a sala**: Un usuario crea una sala (código único de 6 caracteres) o se une con un código existente.
2. **Configuración**: Los jugadores eligen sus nicknames y esperan a que el host inicie la partida.
3. **Gameplay**: Por turnos, los jugadores:
   - Juegan cartas (órganos, virus, medicinas, tratamientos)
   - Roban nuevas cartas
   - Usan tratamientos especiales para cambiar el curso del juego
4. **Victoria**: El primer jugador en completar 4 órganos saludables de diferentes colores gana.

## ✨ Características principales

- 🎮 **Multijugador en tiempo real** con WebSockets
- 🔄 **Reconexión automática** al entrar por enlace de partida
- 📋 **Compartir fácilmente** código de sala y enlace directo
- 🧪 **Tratamientos especiales**: Transplante, Ladrón de órganos, Contagio, Guante de látex, Error médico
- 🔔 **Sistema de notificaciones** inteligente con react-hot-toast
- 📱 **Diseño responsivo** para móviles y escritorio
- 🎯 **Indicador de conexión** en tiempo real
- ✅ **Validación robusta** de entrada (nicknames, códigos de sala)
- 🎨 **Interfaz moderna** con gradientes y animaciones
- 💾 **Persistencia de sesión** para reconexión

## 📦 Estructura del proyecto

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
