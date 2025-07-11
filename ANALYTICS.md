# Sistema de Analíticas - Bacteria Online

## Descripción

Este sistema de analíticas captura datos detallados del juego sin requerir que los jugadores se registren o inicien sesión. Utiliza los identificadores de sesión temporales para rastrear el comportamiento y rendimiento de los jugadores.

## Datos Capturados

### Información General del Juego

- **ID del juego** y **ID de la sala**
- **Duración total** del juego
- **Número de jugadores** participantes
- **Ganador** del juego
- **Número total de turnos**
- **Cantidad de reconstrucciones del mazo**

### Estadísticas por Jugador

- **Nombre del jugador** (nickname temporal)
- **Tiempo de participación** en el juego
- **Número de turnos jugados**
- **Cartas jugadas** vs **cartas descartadas**
- **Tratamientos especiales** utilizados
- **Timeouts** (veces que se agotó el tiempo)
- **Tiempo promedio por turno**
- **Reconexiones** al juego
- **Movimientos inválidos** intentados

### Estadísticas de Órganos

- **Órganos destruidos** por el jugador
- **Órganos curados** por el jugador
- **Órganos infectados** por el jugador
- **Órganos robados** por el jugador

### Eventos del Juego

- **Historial completo** de acciones con timestamp
- **Detalles de cada jugada** (tipo de carta, objetivo, éxito)
- **Eventos especiales** (tratamientos, timeouts, reconexiones)

## Uso del Sistema

### Inicialización

El sistema se inicializa automáticamente cuando se inicia un juego:

```typescript
// Se llama automáticamente en el evento 'shuffle-deck'
analyticsManager.initializeGame(roomId, playerIds, playerNames);
```

### Logging de Eventos

Los eventos se registran automáticamente durante el juego:

```typescript
// Ejemplos de eventos que se registran automáticamente
analyticsManager.logTurnStart(roomId, playerId, playerName);
analyticsManager.logCardPlayed(roomId, playerId, playerName, cardData);
analyticsManager.logTimeout(roomId, playerId, playerName);
```

### Finalización del Juego

Al terminar el juego, se genera un resumen completo:

```typescript
// Se llama automáticamente cuando hay un ganador
const gameAnalytics = analyticsManager.endGame(roomId, winnerId, winnerName);
```

## Visualización de Datos

### Consola de Desarrollo

Durante el desarrollo, puedes ver un resumen en la consola:

```typescript
import { logAnalyticsSummary } from "./utils/analyticsViewer";

// Ver resumen de analíticas de una sala específica
logAnalyticsSummary("room123");
```

### Obtener Datos Programáticamente

```typescript
import { getGameStats } from "./utils/analyticsViewer";

const stats = getGameStats("room123");
if (stats) {
  console.log("Duración del juego:", stats.duration);
  console.log("Ganador:", stats.winnerName);
  // ... más datos
}
```

## Estructura de Datos

### GameAnalytics

```typescript
interface GameAnalytics {
  gameId: string; // ID único del juego
  roomId: string; // ID de la sala
  startTime: number; // Timestamp de inicio
  endTime?: number; // Timestamp de finalización
  duration?: number; // Duración en milisegundos
  playerCount: number; // Número de jugadores
  players: PlayerAnalytics[]; // Datos de cada jugador
  winner?: string; // ID del ganador
  winnerName?: string; // Nombre del ganador
  totalTurns: number; // Turnos totales
  deckRebuilds: number; // Reconstrucciones del mazo
  gameEvents: GameEvent[]; // Historial de eventos
}
```

### PlayerAnalytics

```typescript
interface PlayerAnalytics {
  playerId: string; // ID temporal del jugador
  playerName: string; // Nickname del jugador
  turnsPlayed: number; // Turnos jugados
  cardsPlayed: number; // Cartas jugadas
  cardsDiscarded: number; // Cartas descartadas
  treatmentsUsed: number; // Tratamientos utilizados
  timeouts: number; // Timeouts
  totalTurnTime: number; // Tiempo total de turnos
  averageTurnTime: number; // Tiempo promedio por turno
  reconnections: number; // Reconexiones
  invalidMoves: number; // Movimientos inválidos
  organStats: {
    // Estadísticas de órganos
    organsDestroyed: number;
    organsHealed: number;
    organsInfected: number;
    organsStolen: number;
  };
}
```

## Privacidad y Almacenamiento

### Datos Temporales

- Los datos se almacenan **solo en memoria** durante el juego
- No se requiere **registro** ni **login**
- Los **IDs de jugador** son temporales y no persistentes
- Los datos se **eliminan** automáticamente al finalizar el juego

### Expandir a Base de Datos (Futuro)

Para implementar un sistema de analíticas permanente:

1. **Agregar base de datos** (MongoDB, PostgreSQL, etc.)
2. **Persistir datos** al finalizar cada juego
3. **Crear dashboard** web para visualizar estadísticas
4. **Implementar agregaciones** para estadísticas globales

## Métricas Útiles que se Pueden Calcular

### Métricas de Juego

- **Duración promedio** de partidas
- **Cartas más/menos utilizadas**
- **Tratamientos más populares**
- **Patrones de victoria** (estrategias ganadoras)

### Métricas de Jugadores

- **Tiempo de respuesta** promedio
- **Eficiencia de jugadas** (válidas vs inválidas)
- **Estilos de juego** (agresivo vs defensivo)
- **Tendencias de reconnexión**

### Métricas de Engagement

- **Horarios de mayor actividad**
- **Duración de sesiones**
- **Tasa de finalización** de partidas
- **Frecuencia de timeouts**

## Ejemplo de Salida

```
=== GAME ANALYTICS SUMMARY ===
Game ID: room123_1641234567890
Room ID: room123
Duration: 1247 seconds
Players: 3
Total Turns: 45
Deck Rebuilds: 2
Winner: Alice

=== PLAYER STATS ===

Alice:
  - Turns played: 15
  - Cards played: 12
  - Cards discarded: 8
  - Treatments used: 3
  - Timeouts: 1
  - Avg turn time: 28s
  - Reconnections: 0
  - Invalid moves: 2
  - Organs destroyed: 4
  - Organs healed: 2
  - Organs infected: 6
  - Organs stolen: 1

Bob:
  - Turns played: 15
  - Cards played: 10
  - Cards discarded: 12
  - Treatments used: 2
  - Timeouts: 3
  - Avg turn time: 45s
  - Reconnections: 1
  - Invalid moves: 5
  - Organs destroyed: 2
  - Organs healed: 3
  - Organs infected: 3
  - Organs stolen: 0

Charlie:
  - Turns played: 15
  - Cards played: 14
  - Cards discarded: 6
  - Treatments used: 4
  - Timeouts: 0
  - Avg turn time: 22s
  - Reconnections: 0
  - Invalid moves: 1
  - Organs destroyed: 3
  - Organs healed: 5
  - Organs infected: 4
  - Organs stolen: 2
```

Esta información te permitirá analizar patrones de juego, identificar mejoras necesarias y entender mejor cómo los jugadores interactúan con tu juego.
