# 🦠 Bacteria Online - Backend Server

The Node.js backend server for **Bacteria Online**, handling real-time multiplayer game logic, room management, and player communication through WebSockets.

## 🎯 Overview

This is the server application for Bacteria Online, built with Node.js, Express, and Socket.IO. It manages game rooms, handles player connections, processes game logic, and maintains game state synchronization across all connected clients.

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
```

The server will be available at `http://localhost:3000`

## 🛠️ Technology Stack

- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **Socket.IO**: Real-time bidirectional communication
- **TypeScript**: Static typing for enhanced developer experience
- **CORS**: Cross-origin resource sharing support
- **ts-node-dev**: Development server with hot reload

## 📁 Project Structure

```
server/
├── src/
│   ├── events/             # Socket.IO event handlers
│   │   ├── registerGameEvents.ts    # Game logic events
│   │   └── registerRoomEvents.ts    # Room management events
│   ├── functions/          # Business logic
│   │   ├── gameLogic.ts    # Core game rules and mechanics
│   │   └── shuffle.ts      # Card shuffling utilities
│   ├── types/              # TypeScript interfaces
│   │   └── interfaces.ts   # Shared type definitions
│   ├── utils/              # Server utilities
│   │   └── logger.ts       # Logging functionality
│   ├── const/              # Server constants
│   │   └── const.ts        # Game constants and configuration
│   └── server.ts           # Main server application
├── package.json
└── tsconfig.json
```

## 🎮 Core Features

### Room Management

- **Room creation** with unique 6-character codes
- **Player joining** with nickname validation
- **Host privileges** for game control
- **Automatic room cleanup** when empty
- **Connection state tracking**

### Game Logic

- **Turn-based gameplay** with phase management
- **Card effect processing** with validation
- **Game state synchronization** across all clients
- **Victory condition detection**
- **Automatic deck reshuffling** when needed

### Real-time Communication

- **WebSocket connections** with Socket.IO
- **Event-driven architecture** for game actions
- **Broadcast updates** to all room participants
- **Targeted notifications** for specific players

## 🎯 Game Architecture

### Room System

```typescript
interface Room {
  id: string; // 6-character room code
  players: Player[]; // Connected players
  max_players: number; // Room capacity (6)
  has_started: boolean; // Game status
  host: string; // Host player ID
  created_at: Date; // Creation timestamp
}

interface GameRoom extends Room {
  deck: Card[]; // Draw pile
  discardPile: Card[]; // Discard pile
  hands: { [playerId: string]: Card[] }; // Player hands
  boards: { [playerId: string]: PlayerBoard }; // Player boards
  currentTurn: string; // Current player ID
  currentPhase: GamePhase; // Current game phase
  playerNames: { [playerId: string]: string }; // Player nicknames
}
```

### Game State Management

```typescript
type GamePhase = "play_or_discard" | "draw" | "end_turn";

interface PlayerBoard {
  organs: { [color: string]: OrganState };
}

interface OrganState {
  organ: Card; // The organ card
  bacteria: Card[]; // Bacteria on organ
  medicines: Card[]; // Medicines on organ
  status: OrganStatus; // Calculated status
}
```

## 🔌 Socket.IO Events

### Client → Server Events

#### Room Management

```typescript
socket.on("create-room", (data: { nickname: string }) => {
  // Create new room with unique code
  // Set creator as host
  // Return room ID and player ID
});

socket.on("join-room", (data: { roomId: string; nickname: string }) => {
  // Validate room exists and has space
  // Add player to room
  // Notify all players of new join
});

socket.on("start-game", (roomId: string) => {
  // Validate host privileges
  // Initialize game state
  // Shuffle and deal cards
  // Start first turn
});
```

#### Game Actions

```typescript
socket.on(
  "play-card",
  (roomId: string, playerId: string, action: PlayCardAction) => {
    // Validate player turn and game phase
    // Process card effect
    // Update game state
    // Notify all players
    // Check victory conditions
  }
);

socket.on("draw-card", (roomId: string, playerId: string) => {
  // Validate draw phase
  // Draw cards to reach hand limit
  // Reshuffle deck if needed
  // Update game state
});

socket.on("end-turn", (roomId: string, playerId: string) => {
  // Validate turn ownership
  // Pass turn to next player
  // Update game phase
  // Notify all players
});
```

### Server → Client Events

#### Room Updates

```typescript
socket.emit('room-created', {
  roomId: string,
  playerId: string,
  playerNickname: string
});

socket.emit('room-joined', {
  roomId: string,
  playerId: string,
  players: Player[]
});

socket.emit('player-joined', player: Player);
socket.emit('player-left', playerId: string);
```

#### Game Updates

```typescript
socket.emit('game-started', gameState: GameState);
socket.emit('update-game', gameState: GameState);
socket.emit('game-ended', { winner: string, finalState: GameState });
```

#### Notifications

```typescript
socket.emit("organ-infected", {
  organColor: string,
  byPlayer: string,
  cardType: string,
});

socket.emit("organ-destroyed", {
  organColor: string,
  byPlayer: string,
  cardType: string,
});

socket.emit("treatment-used", {
  treatmentType: string,
  byPlayer: string,
  details: any,
});
```

## 🎲 Game Logic Implementation

### Card Effect System

```typescript
// Main card effect processor
function applyCardEffect(
  card: Card,
  playerBoard: PlayerBoard,
  targetBoard: PlayerBoard,
  targetOrganColor: string,
  allBoards: { [playerId: string]: PlayerBoard },
  action: PlayCardAction
): EffectResult {
  switch (card.type) {
    case "organ":
      return applyOrganEffect(card, playerBoard);
    case "bacteria":
      return applyBacteriaEffect(card, targetBoard, targetOrganColor);
    case "medicine":
      return applyMedicineEffect(card, targetBoard, targetOrganColor);
    case "treatment":
      return applyTreatmentEffect(card, allBoards, action);
  }
}
```

### Treatment Cards

```typescript
// Special treatment effects
function applyTreatmentEffect(
  card: Card,
  allBoards: PlayerBoardMap,
  currentPlayerId: string,
  action: PlayCardAction
): TreatmentResult {
  switch (card.color) {
    case "red": // Transplant
      return applyTransplant(allBoards, currentPlayerId, action);
    case "green": // Organ Thief
      return applyOrganThief(allBoards, currentPlayerId, action);
    case "blue": // Contagion
      return applyContagion(allBoards, currentPlayerId);
    case "yellow": // Latex Glove
      return applyLatexGlove(allBoards, currentPlayerId);
    case "rainbow": // Medical Error
      return applyMedicalError(allBoards, currentPlayerId, action);
  }
}
```

### Victory Detection

```typescript
function checkWinCondition(playerBoard: PlayerBoard): boolean {
  // Get all healthy organs (healthy, vaccinated, immunized)
  const healthyOrgans = Object.values(playerBoard.organs).filter((organ) => {
    return (
      organ.status === "healthy" ||
      organ.status === "vaccinated" ||
      organ.status === "immunized"
    );
  });

  if (healthyOrgans.length < 4) return false;

  // Count regular colors and rainbow organs separately
  const colors = new Set<string>();
  let rainbowCount = 0;

  for (const organ of healthyOrgans) {
    if (organ.organ.color === "rainbow") {
      rainbowCount++;
    } else {
      colors.add(organ.organ.color);
    }
  }

  // Use rainbow organs to fill missing colors
  const allPossibleColors = ["red", "green", "blue", "yellow"];
  const missingColors = allPossibleColors.filter((color) => !colors.has(color));
  const colorsToFill = Math.min(rainbowCount, missingColors.length);
  const totalUniqueColors = colors.size + colorsToFill;

  return totalUniqueColors >= 4;
}
```

**Victory Timing**: Victory is checked immediately after each card effect is applied, ensuring instant win detection for actions like organ theft or transplant.

## 🎨 Deck Management

### Base Deck Composition

```typescript
const BASE_DECK: Card[] = [
  // Organs (5 cards each color + 1 rainbow)
  ...createCards("organ", "red", 5),
  ...createCards("organ", "green", 5),
  ...createCards("organ", "blue", 5),
  ...createCards("organ", "yellow", 5),
  ...createCards("organ", "rainbow", 1),

  // Bacteria (4 cards each color + 1 rainbow)
  ...createCards("bacteria", "red", 4),
  ...createCards("bacteria", "green", 4),
  ...createCards("bacteria", "blue", 4),
  ...createCards("bacteria", "yellow", 4),
  ...createCards("bacteria", "rainbow", 1),

  // Medicines (4 cards each color + 1 rainbow)
  ...createCards("medicine", "red", 4),
  ...createCards("medicine", "green", 4),
  ...createCards("medicine", "blue", 4),
  ...createCards("medicine", "yellow", 4),
  ...createCards("medicine", "rainbow", 1),

  // Treatments (1 card each type)
  ...createCards("treatment", "red", 1), // Transplant
  ...createCards("treatment", "green", 1), // Organ Thief
  ...createCards("treatment", "blue", 1), // Contagion
  ...createCards("treatment", "yellow", 1), // Latex Glove
  ...createCards("treatment", "rainbow", 1), // Medical Error
];
```

### Deck Rebuilding

```typescript
function rebuildDeck(
  baseDeck: Card[],
  hands: { [playerId: string]: Card[] },
  boards: { [playerId: string]: PlayerBoard },
  discardPile: Card[]
): Card[] {
  const cardsInUse = new Set<string>();

  // Collect cards in hands
  Object.values(hands).forEach((hand) => {
    hand.forEach((card) => cardsInUse.add(card.id));
  });

  // Collect cards on boards
  Object.values(boards).forEach((board) => {
    Object.values(board.organs).forEach((organState) => {
      cardsInUse.add(organState.organ.id);
      organState.bacteria.forEach((card) => cardsInUse.add(card.id));
      organState.medicines.forEach((card) => cardsInUse.add(card.id));
    });
  });

  // Return available cards from base deck
  return baseDeck.filter((card) => !cardsInUse.has(card.id));
}
```

## 🔒 Security and Validation

### Input Validation

```typescript
function validatePlayAction(
  roomId: string,
  playerId: string,
  action: PlayCardAction
): ValidationResult {
  const room = rooms[roomId] as GameRoom;

  // Validate room exists
  if (!room) {
    return { valid: false, reason: "Room not found" };
  }

  // Validate player in room
  if (!room.players.some((p) => p.playerId === playerId)) {
    return { valid: false, reason: "Player not in room" };
  }

  // Validate turn ownership
  if (room.currentTurn !== playerId) {
    return { valid: false, reason: "Not your turn" };
  }

  // Validate game phase
  if (room.currentPhase !== "play_or_discard") {
    return { valid: false, reason: "Wrong game phase" };
  }

  return { valid: true };
}
```

### Room Code Generation

```typescript
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code: string;

  do {
    code = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  } while (rooms[code]); // Ensure uniqueness

  return code;
}
```

## 📊 Performance Optimization

### Memory Management

```typescript
// Automatic room cleanup
setInterval(() => {
  Object.entries(rooms).forEach(([roomId, room]) => {
    const timeSinceCreation = Date.now() - room.created_at.getTime();
    const isEmpty = room.players.length === 0;
    const tooOld = timeSinceCreation > 24 * 60 * 60 * 1000; // 24 hours

    if (isEmpty || tooOld) {
      delete rooms[roomId];
      console.log(`Room ${roomId} cleaned up`);
    }
  });
}, 30000); // Every 30 seconds
```

### Connection Optimization

```typescript
// Socket.IO configuration
const io = new Server(server, {
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  maxHttpBufferSize: 1e6, // 1MB
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Integration Tests

```typescript
describe("Game Logic", () => {
  test("should handle card play correctly", () => {
    const mockRoom = createMockRoom();
    const result = handlePlayCard(mockRoom, "player1", mockAction);
    expect(result.success).toBe(true);
  });
});
```

## 🚀 Deployment

### Development

```bash
npm run dev        # Start development server with hot reload
```

### Production

```bash
npm run build      # Compile TypeScript
npm start          # Start production server
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

```env
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-client-domain.com
```

## 🚀 Deployment en Render

### Configuración para Render.com:

1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm run start`
3. **Root Directory**: `server`
4. **Environment Variables** (configurar en Render dashboard):
   ```
   MONGODB_URI=tu_mongodb_atlas_url_aqui
   NODE_ENV=production
   ```

### Endpoints de health check:

- `GET /` - Health check principal con información del servidor
- `GET /health` - Health check detallado con uptime

### Características en producción:

- ✅ Analíticas persistentes con MongoDB Atlas
- ✅ Manejo automático de reconexiones
- ✅ Reportes de estadísticas automáticos
- ✅ Configurado para entorno de producción
- ✅ Health checks para monitoreo

## 📈 Monitoring and Logging

### Server Monitoring

```typescript
// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});
```

### Game Analytics

```typescript
// Track game events
function trackGameEvent(eventType: string, data: any) {
  console.log(`Game Event: ${eventType}`, {
    timestamp: new Date().toISOString(),
    ...data,
  });
}
```

## 🔮 Future Enhancements

### Planned Features

- **Database integration** for persistent game history
- **Player statistics** and ranking system
- **Tournament mode** with brackets
- **AI opponents** for single-player mode
- **Game replay** system

### Technical Improvements

- **Horizontal scaling** with Redis adapter
- **Rate limiting** for API endpoints
- **Comprehensive logging** with structured format
- **Health check endpoints** for monitoring
- **Graceful shutdown** handling

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

### Code Style

- Follow TypeScript best practices
- Use meaningful variable names
- Add JSDoc comments for functions
- Maintain consistent formatting
- Write comprehensive tests

### Pull Request Process

1. Create feature branch
2. Make changes with tests
3. Update documentation
4. Submit pull request
5. Wait for review and approval

## 📚 API Reference

### Socket Events

See the complete list of Socket.IO events in the [API Documentation](../API.md).

### Game Constants

All game constants are defined in `src/const/const.ts`:

- Player limits (2-6 players)
- Hand size (3 cards)
- Victory conditions (4 different colored organs)
- Card deck composition

### Core Game Logic Functions

#### Card Validation

```typescript
// Basic card validation for organs, bacteria, and medicines
canPlayCard(
  card: Card,
  playerBoard: PlayerBoard,
  targetBoard?: PlayerBoard,
  targetOrganColor?: string
): { canPlay: boolean; reason?: string }

// Comprehensive treatment card validation
canPlayTreatment(
  card: Card,
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string,
  action?: PlayCardAction
): { canPlay: boolean; reason?: string }

// Specific contagion validation
canPlayContagion(
  currentBoard: PlayerBoard,
  allBoards: { [playerId: string]: PlayerBoard },
  currentPlayerId: string
): { canPlay: boolean; reason?: string }
```

#### Game State Management

```typescript
// Calculate organ status based on bacteria and medicines
calculateOrganStatus(organState: OrganState): OrganStatus

// Check if a player has won (4 different colored healthy organs)
checkWinCondition(playerBoard: PlayerBoard): boolean

// Apply card effects to game state
applyCardEffect(card: Card, ...params): { success: boolean; changes?: any; reason?: string }

// Apply treatment effects with full context
applyTreatmentEffect(card: Card, allBoards: {...}, currentPlayerId: string, action: PlayCardAction)
```

#### Utility Functions

```typescript
// Check color compatibility (including rainbow logic)
isColorCompatible(cardColor: string, targetColor: string): boolean

// Shuffle cards using Fisher-Yates algorithm
shuffle<T>(array: T[]): T[]
```

### Game Rules Implementation

The server implements all official game rules:

- **Organ Placement**: Maximum 4 organs per player, no duplicates (except rainbow)
- **Bacteria Transmission**: Only to compatible colors, cannot infect immunized organs
- **Medicine Application**: Can cure bacteria or vaccinate healthy organs
- **Victory Conditions**: 4 different colored healthy organs (healthy, vaccinated, or immunized)
- **Treatment Cards**: Each has specific validation and effect logic
- **Contagion**: Can only be played if valid targets exist for transmission

---

**🎮 The server is ready to handle your strategic battles in Bacteria Online!**
