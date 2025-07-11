# 🦠 Bacteria Online

A strategic multiplayer card game where players compete to be the first to complete a healthy body with 4 organs of different colors, while sabotaging opponents with bacteria and special treatments.

## 🎯 Game Overview

**Bacteria Online** is a real-time multiplayer implementation of the popular card game "Bacteria!" (also known as "Virus!"). Players must collect and maintain healthy organs while defending against bacterial attacks and using special treatment cards to disrupt opponents' strategies.

### Victory Condition

Be the first player to complete a healthy body with **4 organs of different colors**.

An organ is considered healthy if it's:

- Free of bacteria
- Vaccinated (protected by 1 medicine of the same color)
- Immunized (protected by 2 medicines of the same color)

## 🚀 Features

### Core Gameplay

- **Real-time multiplayer** with WebSocket connections
- **Turn-based strategy** with immediate feedback
- **5 Special treatment cards** with unique effects
- **Automatic reconnection** when players return to the game
- **Responsive design** for desktop and mobile devices

### User Experience

- **Smart notifications** system with contextual feedback
- **Connection status indicator** for network monitoring
- **Room sharing** via code or direct link
- **Nickname validation** and management
- **Session persistence** for seamless reconnection

### Technical Features

- **TypeScript** for type safety
- **React 19** with modern hooks
- **Socket.IO** for real-time communication
- **Vite** for fast development and building
- **ESLint** for code quality

## 🏗️ Architecture

### Monorepo Structure

```
bacteria_online/
├── client/          # React frontend application
├── server/          # Node.js backend with Socket.IO
├── docs/            # Documentation files
└── shared/          # Shared types and constants
```

### Client Architecture

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Board/      # Game board display
│   │   ├── Card/       # Card components
│   │   ├── Game/       # Main game interface
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   │   ├── game/       # Game-specific hooks
│   │   ├── lobby/      # Lobby management
│   │   └── room/       # Room management
│   ├── pages/          # Main application pages
│   │   ├── Lobby/      # Home page and room creation
│   │   └── Room/       # Game room interface
│   ├── interfaces/     # TypeScript interfaces
│   ├── const/          # Game constants
│   ├── utils/          # Utility functions
│   └── context/        # React context providers
└── public/             # Static assets
```

### Server Architecture

```
server/
├── src/
│   ├── events/         # Socket.IO event handlers
│   ├── functions/      # Game logic functions
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Utility functions
│   └── const/          # Server constants
└── package.json
```

## 🎮 Game Rules

### Card Types

#### 🫀 Organs (4 colors + rainbow)

- **Red, Green, Blue, Yellow**: Basic organs
- **Rainbow**: Wild card that counts as any color
- **Rule**: Cannot have two organs of the same color

#### 🦠 Bacteria (4 colors + rainbow)

- Infect organs of the same color
- **2 bacteria** on one organ destroys it
- Can destroy vaccines of the same color
- **Rainbow bacteria** works on any color

#### 💉 Medicines (4 colors + rainbow)

- **Cure**: Remove one bacteria of the same color
- **Vaccinate**: Protect organ (needs 2 bacteria to be destroyed)
- **Immunize**: 2 medicines fully protect the organ
- **Rainbow medicine** works on any organ/bacteria

#### 🧪 Treatment Cards (Special Effects)

- **Transplant**: Exchange organs between two players
- **Organ Thief**: Steal an organ from another player
- **Contagion**: Spread bacteria to other players' organs
- **Latex Glove**: All other players discard their hand
- **Medical Error**: Exchange entire body with another player

### Turn Structure

1. **Phase 1: Play or Discard**

   - Play 1 card from your hand, OR
   - Discard any number of cards

2. **Phase 2: Draw**

   - Draw cards until you have 3 in hand

3. **Phase 3: End Turn**
   - Turn passes to the next player

## 🛠️ Setup & Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/bacteria_online.git
   cd bacteria_online
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Development

1. **Start the server**

   ```bash
   cd server
   npm run dev
   ```

   Server runs on `http://localhost:3000`

2. **Start the client**
   ```bash
   cd client
   npm run dev
   ```
   Client runs on `http://localhost:5173`

### Production Build

1. **Build the client**

   ```bash
   cd client
   npm run build
   ```

2. **Start the server**
   ```bash
   cd server
   npm start
   ```

## 🎯 Key Components

### Game Management

- **`useGame`**: Main game state management hook
- **`useGameNotifications`**: Smart notification system
- **`useSocketConnection`**: Connection state management
- **`usePlayerId`**: Player identification persistence

### UI Components

- **`Game`**: Main game interface with boards and hand
- **`Board`**: Individual player board display
- **`Card`**: Interactive card component
- **`ConnectionIndicator`**: Real-time connection status
- **`ErrorBoundary`**: Error handling and recovery

### Game Logic

- **`gameLogic.ts`**: Core game rules and card effects
- **`registerGameEvents.ts`**: Server-side event handling
- **`registerRoomEvents.ts`**: Room management events

## 📊 Game Constants

### Victory Conditions

- **Organs needed to win**: 4 different colors
- **Max bacteria per organ**: 2 (destroys organ)
- **Max medicines per organ**: 2 (immunizes organ)

### Player Management

- **Min players**: 2
- **Max players**: 6
- **Cards per hand**: 3

### Connection Settings

- **Reconnection attempts**: 5
- **Reconnection delay**: 1000ms
- **Room cleanup delay**: 30 seconds

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Client
VITE_SERVER_URL=http://localhost:3000
```

### Socket.IO Configuration

```javascript
// Server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Client
const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

## 🧪 Testing

### Run Tests

```bash
# Client tests
cd client
npm test

# Server tests
cd server
npm test
```

### Linting

```bash
# Client linting
cd client
npm run lint

# Server linting
cd server
npm run lint
```

## 📝 API Documentation

### Socket Events

#### Client → Server

- **`create-room`**: Create a new game room
- **`join-room`**: Join an existing room
- **`start-game`**: Start the game (host only)
- **`play-card`**: Play a card from hand
- **`draw-card`**: Draw cards to refill hand
- **`end-turn`**: End current turn

#### Server → Client

- **`room-created`**: Room creation confirmation
- **`room-joined`**: Room join confirmation
- **`game-started`**: Game has started
- **`update-game`**: Game state update
- **`player-joined`**: New player joined
- **`player-left`**: Player left the room

## 🚀 Deployment

### Docker Support

```dockerfile
# Dockerfile for server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] CORS settings updated for production
- [ ] SSL certificates installed
- [ ] Database connections tested
- [ ] Performance monitoring enabled

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open pull request**

### Code Style

- Follow TypeScript best practices
- Use meaningful variable names
- Add JSDoc comments for functions
- Maintain consistent formatting

## 📚 Additional Documentation

- **[Game Rules](./GAME_RULES.md)**: Complete game rules and mechanics
- **[API Reference](./API_REFERENCE.md)**: Detailed API documentation
- **[Architecture Guide](./ARCHITECTURE.md)**: Technical architecture details
- **[Deployment Guide](./DEPLOYMENT.md)**: Production deployment instructions

## 🐛 Known Issues

- **Mobile disconnection**: Game may disconnect when phone is locked
- **Performance**: Large games (6 players) may experience lag
- **Browser compatibility**: Limited support for older browsers

## 🔮 Future Enhancements

- **Internationalization**: Multiple language support
- **Tournament mode**: Competitive gameplay
- **Statistics**: Player performance tracking
- **Spectator mode**: Watch games in progress
- **Sound effects**: Audio feedback for actions
- **Animations**: Smooth card movements
- **Offline mode**: Play against AI

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Community feedback and contributions

---

**🎮 Ready to play? Start a game and show your strategic skills in Bacteria Online!**
