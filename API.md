# 🔌 Bacteria Online - API Documentation

Complete API documentation for **Bacteria Online**, covering all Socket.IO events and HTTP endpoints for real-time multiplayer gameplay.

## 🌐 Overview

Bacteria Online uses **Socket.IO** for real-time bidirectional communication between clients and server. The API handles room management, game state synchronization, and player interactions.

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-server.com`

### Transport Protocol

- **Primary**: WebSocket
- **Fallback**: HTTP long-polling

## 🚀 Connection Management

### Initial Connection

```typescript
import { io } from "socket.io-client";

const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
  timeout: 5000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

### Connection Events

#### `connect`

Emitted when client successfully connects to server.

```typescript
socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});
```

#### `disconnect`

Emitted when client disconnects from server.

```typescript
socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});
```

#### `connect_error`

Emitted when connection fails.

```typescript
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});
```

## 🏠 Room Management

### Create Room

#### Client → Server: `create-room`

```typescript
interface CreateRoomPayload {
  nickname: string;
}

socket.emit("create-room", { nickname: "PlayerName" });
```

#### Server → Client: `room-created`

```typescript
interface RoomCreatedResponse {
  roomId: string;
  playerId: string;
  players: Player[];
}

socket.on("room-created", (data: RoomCreatedResponse) => {
  console.log("Room created:", data.roomId);
});
```

### Join Room

#### Client → Server: `join-room`

```typescript
interface JoinRoomPayload {
  roomId: string;
  nickname: string;
}

socket.emit("join-room", {
  roomId: "ABCD1234",
  nickname: "PlayerName",
});
```

#### Server → Client: `room-joined`

```typescript
interface RoomJoinedResponse {
  roomId: string;
  playerId: string;
  players: Player[];
  isHost: boolean;
}

socket.on("room-joined", (data: RoomJoinedResponse) => {
  console.log("Joined room:", data.roomId);
});
```

#### Server → Client: `join-room-error`

```typescript
interface JoinRoomError {
  message: string;
  code: "ROOM_NOT_FOUND" | "ROOM_FULL" | "INVALID_NICKNAME";
}

socket.on("join-room-error", (error: JoinRoomError) => {
  console.error("Failed to join room:", error.message);
});
```

### Leave Room

#### Client → Server: `leave-room`

```typescript
socket.emit("leave-room");
```

#### Server → Client: `player-left`

```typescript
interface PlayerLeftResponse {
  playerId: string;
  players: Player[];
  newHost?: string;
}

socket.on("player-left", (data: PlayerLeftResponse) => {
  console.log("Player left:", data.playerId);
});
```

### Update Nickname

#### Client → Server: `update-nickname`

```typescript
interface UpdateNicknamePayload {
  nickname: string;
}

socket.emit("update-nickname", { nickname: "NewName" });
```

#### Server → Client: `nickname-updated`

```typescript
interface NicknameUpdatedResponse {
  playerId: string;
  nickname: string;
  players: Player[];
}

socket.on("nickname-updated", (data: NicknameUpdatedResponse) => {
  console.log("Nickname updated:", data.nickname);
});
```

#### Server → Client: `nickname-error`

```typescript
interface NicknameError {
  message: string;
  code: "INVALID_NICKNAME" | "NICKNAME_TAKEN";
}

socket.on("nickname-error", (error: NicknameError) => {
  console.error("Nickname error:", error.message);
});
```

## 🎮 Game Management

### Start Game

#### Client → Server: `start-game`

```typescript
socket.emit("start-game");
```

#### Server → Client: `game-started`

```typescript
interface GameStartedResponse {
  gameState: GameState;
  playerId: string;
  hand: Card[];
  currentTurn: string;
  currentPhase: GamePhase;
}

socket.on("game-started", (data: GameStartedResponse) => {
  console.log("Game started!", data);
});
```

#### Server → Client: `start-game-error`

```typescript
interface StartGameError {
  message: string;
  code: "NOT_HOST" | "INSUFFICIENT_PLAYERS" | "GAME_ALREADY_STARTED";
}

socket.on("start-game-error", (error: StartGameError) => {
  console.error("Cannot start game:", error.message);
});
```

### Game State Updates

#### Server → Client: `game-state-update`

```typescript
interface GameStateUpdate {
  boards: PlayerBoard[];
  currentTurn: string;
  currentPhase: GamePhase;
  winner?: string;
}

socket.on("game-state-update", (data: GameStateUpdate) => {
  console.log("Game state updated:", data);
});
```

#### Server → Client: `hand-update`

```typescript
interface HandUpdate {
  hand: Card[];
  canDraw: boolean;
  canPlay: boolean;
}

socket.on("hand-update", (data: HandUpdate) => {
  console.log("Hand updated:", data.hand.length);
});
```

## 🃏 Card Actions

### Draw Cards

#### Client → Server: `draw-cards`

```typescript
interface DrawCardsPayload {
  count: number;
}

socket.emit("draw-cards", { count: 2 });
```

#### Server → Client: `cards-drawn`

```typescript
interface CardsDrawnResponse {
  cards: Card[];
  newHand: Card[];
}

socket.on("cards-drawn", (data: CardsDrawnResponse) => {
  console.log("Drew cards:", data.cards);
});
```

#### Server → Client: `draw-cards-error`

```typescript
interface DrawCardsError {
  message: string;
  code: "NOT_YOUR_TURN" | "INVALID_PHASE" | "DECK_EMPTY";
}

socket.on("draw-cards-error", (error: DrawCardsError) => {
  console.error("Cannot draw cards:", error.message);
});
```

### Play Card

#### Client → Server: `play-card`

```typescript
interface PlayCardPayload {
  cardId: string;
  targetPlayerId?: string;
  targetOrgan?: OrganType;
}

socket.emit("play-card", {
  cardId: "card-123",
  targetPlayerId: "player-456",
  targetOrgan: "heart",
});
```

#### Server → Client: `card-played`

```typescript
interface CardPlayedResponse {
  playerId: string;
  card: Card;
  targetPlayerId?: string;
  targetOrgan?: OrganType;
  gameState: GameState;
}

socket.on("card-played", (data: CardPlayedResponse) => {
  console.log("Card played:", data.card.type);
});
```

#### Server → Client: `play-card-error`

```typescript
interface PlayCardError {
  message: string;
  code: "NOT_YOUR_TURN" | "INVALID_CARD" | "INVALID_TARGET" | "INVALID_PHASE";
}

socket.on("play-card-error", (error: PlayCardError) => {
  console.error("Cannot play card:", error.message);
});
```

### Discard Cards

#### Client → Server: `discard-cards`

```typescript
interface DiscardCardsPayload {
  cardIds: string[];
}

socket.emit("discard-cards", { cardIds: ["card-1", "card-2"] });
```

#### Server → Client: `cards-discarded`

```typescript
interface CardsDiscardedResponse {
  discardedCards: Card[];
  newHand: Card[];
}

socket.on("cards-discarded", (data: CardsDiscardedResponse) => {
  console.log("Discarded cards:", data.discardedCards.length);
});
```

## 🎯 Game Phase Management

### Phase Transitions

#### Server → Client: `phase-changed`

```typescript
interface PhaseChangedResponse {
  currentPhase: GamePhase;
  currentTurn: string;
  canDraw: boolean;
  canPlay: boolean;
}

socket.on("phase-changed", (data: PhaseChangedResponse) => {
  console.log("Phase changed to:", data.currentPhase);
});
```

#### Client → Server: `end-turn`

```typescript
socket.emit("end-turn");
```

#### Server → Client: `turn-ended`

```typescript
interface TurnEndedResponse {
  currentTurn: string;
  currentPhase: GamePhase;
}

socket.on("turn-ended", (data: TurnEndedResponse) => {
  console.log("Turn ended, now:", data.currentTurn);
});
```

## 🏆 Game Completion

### Game End

#### Server → Client: `game-ended`

```typescript
interface GameEndedResponse {
  winner: string;
  winnerNickname: string;
  finalState: GameState;
  gameStats: GameStats;
}

socket.on("game-ended", (data: GameEndedResponse) => {
  console.log("Game ended! Winner:", data.winnerNickname);
});
```

### Return to Room

#### Client → Server: `return-to-room`

```typescript
socket.emit("return-to-room");
```

#### Server → Client: `returned-to-room`

```typescript
interface ReturnedToRoomResponse {
  players: Player[];
  isHost: boolean;
}

socket.on("returned-to-room", (data: ReturnedToRoomResponse) => {
  console.log("Returned to room");
});
```

## 📊 Data Models

### Player

```typescript
interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  isConnected: boolean;
  isReady: boolean;
}
```

### Card

```typescript
interface Card {
  id: string;
  type: CardType;
  organType?: OrganType;
  color?: OrganColor;
  value?: number;
  description: string;
}

type CardType = "organ" | "disease" | "medicine" | "treatment" | "virus";
type OrganType = "heart" | "brain" | "stomach" | "bone" | "eye";
type OrganColor = "red" | "yellow" | "green" | "blue" | "purple";
```

### Game State

```typescript
interface GameState {
  id: string;
  players: Player[];
  currentTurn: string;
  currentPhase: GamePhase;
  winner?: string;
  isStarted: boolean;
  isEnded: boolean;
  createdAt: Date;
}

type GamePhase = "draw" | "play" | "discard" | "waiting";
```

### Player Board

```typescript
interface PlayerBoard {
  playerId: string;
  organs: OrganSlot[];
  isProtected: boolean;
  points: number;
}

interface OrganSlot {
  organType: OrganType;
  organCard?: Card;
  diseaseCards: Card[];
  medicineCards: Card[];
  isHealthy: boolean;
  isImmune: boolean;
}
```

### Game Stats

```typescript
interface GameStats {
  duration: number;
  totalTurns: number;
  cardsPlayed: number;
  winCondition: "organs" | "immunity" | "elimination";
  playerStats: PlayerStats[];
}

interface PlayerStats {
  playerId: string;
  nickname: string;
  cardsPlayed: number;
  organsHealed: number;
  diseasesPlayed: number;
  medicinesUsed: number;
  finalScore: number;
}
```

## 🚨 Error Handling

### Error Response Format

```typescript
interface APIError {
  message: string;
  code: string;
  details?: any;
  timestamp: Date;
}
```

### Common Error Codes

#### Room Errors

- `ROOM_NOT_FOUND`: Room doesn't exist
- `ROOM_FULL`: Room has reached maximum capacity
- `INVALID_NICKNAME`: Nickname is invalid or taken
- `NOT_HOST`: Action requires host privileges

#### Game Errors

- `GAME_NOT_STARTED`: Game hasn't started yet
- `GAME_ALREADY_STARTED`: Game is already in progress
- `GAME_ENDED`: Game has already ended
- `INSUFFICIENT_PLAYERS`: Not enough players to start

#### Turn Errors

- `NOT_YOUR_TURN`: It's not the player's turn
- `INVALID_PHASE`: Action not allowed in current phase
- `INVALID_CARD`: Card is not valid for this action
- `INVALID_TARGET`: Target is not valid for this card

#### Card Errors

- `DECK_EMPTY`: No more cards to draw
- `HAND_FULL`: Player's hand is at maximum capacity
- `CARD_NOT_FOUND`: Specified card not found in hand
- `INVALID_PLAY`: Card cannot be played in current situation

## 🔧 Configuration

### Socket.IO Options

```typescript
const socketConfig = {
  // Connection
  timeout: 5000,
  forceNew: false,

  // Reconnection
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,

  // Transport
  transports: ["websocket", "polling"],
  upgrade: true,

  // Polling
  pollingTimeout: 3000,

  // WebSocket
  closeOnBeforeunload: false,
};
```

### Rate Limiting

```typescript
// Rate limits per endpoint
const rateLimits = {
  "create-room": { maxRequests: 5, windowMs: 60000 },
  "join-room": { maxRequests: 10, windowMs: 60000 },
  "play-card": { maxRequests: 30, windowMs: 60000 },
  "draw-cards": { maxRequests: 20, windowMs: 60000 },
  "update-nickname": { maxRequests: 3, windowMs: 60000 },
};
```

## 📝 Usage Examples

### Complete Game Flow

```typescript
// 1. Connect to server
const socket = io("http://localhost:3000");

// 2. Create room
socket.emit("create-room", { nickname: "Host" });

socket.on("room-created", ({ roomId, playerId }) => {
  console.log(`Room created: ${roomId}`);

  // 3. Wait for players to join
  socket.on("room-joined", ({ players }) => {
    console.log(`Players in room: ${players.length}`);

    // 4. Start game when ready
    if (players.length >= 2) {
      socket.emit("start-game");
    }
  });
});

// 5. Handle game events
socket.on("game-started", ({ hand, currentTurn }) => {
  console.log("Game started!");

  // 6. Draw cards on your turn
  socket.on("phase-changed", ({ currentPhase, canDraw }) => {
    if (currentPhase === "draw" && canDraw) {
      socket.emit("draw-cards", { count: 2 });
    }
  });

  // 7. Play cards
  socket.on("cards-drawn", ({ newHand }) => {
    if (newHand.length > 0) {
      socket.emit("play-card", {
        cardId: newHand[0].id,
        targetPlayerId: "opponent-id",
        targetOrgan: "heart",
      });
    }
  });
});

// 8. Handle game end
socket.on("game-ended", ({ winner, winnerNickname }) => {
  console.log(`Game ended! Winner: ${winnerNickname}`);

  // Return to room for another game
  socket.emit("return-to-room");
});
```

### Error Handling Pattern

```typescript
// Generic error handler
const handleError = (eventName: string, error: APIError) => {
  console.error(`${eventName} error:`, error);

  switch (error.code) {
    case "ROOM_NOT_FOUND":
      // Redirect to lobby
      break;
    case "NOT_YOUR_TURN":
      // Disable game controls
      break;
    case "INVALID_CARD":
      // Show card validation error
      break;
    default:
      // Show generic error message
      break;
  }
};

// Apply to all error events
socket.on("join-room-error", (error) => handleError("join-room", error));
socket.on("play-card-error", (error) => handleError("play-card", error));
socket.on("draw-cards-error", (error) => handleError("draw-cards", error));
```

## 🧪 Testing

### Mock Socket for Testing

```typescript
// Mock socket for unit tests
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
  id: "mock-socket-id",
};

// Test event emission
describe("Game Events", () => {
  test("should emit draw-cards event", () => {
    const gameHook = useGame({ socket: mockSocket });
    gameHook.handleDraw();

    expect(mockSocket.emit).toHaveBeenCalledWith("draw-cards", { count: 2 });
  });
});
```

### Integration Testing

```typescript
// Integration test with real socket
describe("Socket Integration", () => {
  let socket: Socket;

  beforeEach(() => {
    socket = io("http://localhost:3000");
  });

  afterEach(() => {
    socket.disconnect();
  });

  test("should create and join room", (done) => {
    socket.emit("create-room", { nickname: "Test" });

    socket.on("room-created", ({ roomId }) => {
      expect(roomId).toBeTruthy();
      done();
    });
  });
});
```

## 📚 Additional Resources

- **[Socket.IO Documentation](https://socket.io/docs/)**: Official Socket.IO guide
- **[Game Rules](./GAME_RULES.md)**: Complete game mechanics
- **[Client README](./client/README.md)**: Frontend documentation
- **[Server README](./server/README.md)**: Backend documentation
- **[Architecture Guide](./ARCHITECTURE.md)**: Technical overview

## 🔄 Changelog

### Version 1.0.0

- Initial API implementation
- Basic room and game management
- Card action system
- Error handling framework

### Version 1.1.0

- Added game statistics
- Improved error responses
- Rate limiting implementation
- Enhanced reconnection handling

### Version 1.2.0

- Game replay functionality
- Advanced player statistics
- Performance optimizations
- Bug fixes and improvements

---

**🎮 Ready to integrate? The API is designed for seamless real-time gameplay!**
