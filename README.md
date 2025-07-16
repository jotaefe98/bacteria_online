# 🦠 Bacteria Online

A real-time multiplayer strategy card game built with modern web technologies. Players compete to build a healthy body while defending against bacterial attacks and using strategic treatment cards.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://bacteriaonline.fun/)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real%20Time-black)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Overview

**Bacteria Online** is a full-stack web application that demonstrates advanced real-time multiplayer game development. The game features sophisticated state management, WebSocket communication, and responsive design principles.

**Victory Condition**: Be the first player to complete a healthy body with 4 organs of different colors.

## ⚡ Key Features

### 🔧 Technical Implementation

- **Full-stack TypeScript** with strict type checking
- **Real-time communication** via Socket.IO
- **React 19** with modern hooks and context
- **Responsive design** for desktop and mobile
- **Automatic reconnection** and session persistence
- **Comprehensive error handling** and recovery

### 🎮 Game Features

- **Turn-based strategy** with immediate feedback
- **5 Special treatment cards** with unique effects
- **Smart notification system** with contextual feedback
- **Room sharing** via code or direct link
- **Multiplayer support** (2-6 players)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite, CSS3
- **Backend**: Node.js, Express, Socket.IO
- **Development**: ESLint, Prettier, Hot Reload
- **Build**: Vite bundler with optimizations

### Project Structure

```
bacteria_online/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main application pages
│   │   ├── hooks/       # Custom React hooks
│   │   ├── interfaces/  # TypeScript interfaces
│   │   ├── context/     # React context providers
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── server/              # Node.js backend with Socket.IO
│   ├── src/
│   │   ├── events/      # Socket.IO event handlers
│   │   ├── functions/   # Game logic functions
│   │   ├── types/       # TypeScript interfaces
│   │   └── utils/       # Server utilities
│   └── package.json
├── API.md               # API documentation
├── GAME_RULES.md        # Complete game rules
└── ARCHITECTURE.md      # Technical architecture
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/jotaefe98/bacteria_online.git
   cd bacteria_online
   ```

2. **Install dependencies**

   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Start development servers**

   ```bash
   # Terminal 1: Start server (from server directory)
   npm run dev

   # Terminal 2: Start client (from client directory)
   npm run dev
   ```

4. **Access the application**
   - **Live Demo**: [https://bacteriaonline.fun/](https://bacteriaonline.fun/)
   - **Local Development**: `http://localhost:5173`

## 🎮 Game Rules

### Card Types

- **🫀 Organs**: Red, Green, Blue, Yellow, and Rainbow (wild)
- **🦠 Bacteria**: Infect organs; 2 bacteria destroy an organ
- **💉 Medicines**: Cure bacteria, vaccinate, or immunize organs
- **🧪 Treatment Cards**: Special effects (Transplant, Contagion, etc.)

### Victory Condition

Complete a healthy body with **4 organs of different colors**. An organ is healthy if it's free of bacteria, vaccinated, or immunized.

_See [GAME_RULES.md](GAME_RULES.md) for complete rules and mechanics._

## 🔧 Development

### Available Scripts

**Client (`/client`)**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Server (`/server`)**

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm start            # Start production server
npm run lint         # Run ESLint
```

### Environment Variables

Create `.env` files in both client and server directories:

**Client (`.env`)**

```env
# Local development
VITE_SERVER_URL=http://localhost:3000

# Production
VITE_SERVER_URL=https://bacteria-online-server.onrender.com
```

**Server (`.env`)**

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Production
NODE_ENV=production
CORS_ORIGIN=https://bacteriaonline.fun
```

## 🧪 Testing

```bash
# Run client tests
cd client && npm test

# Run server tests
cd server && npm test

# Run linting
npm run lint
```

## 🚀 Deployment

### Live Demo
- **Frontend**: [https://bacteriaonline.fun/](https://bacteriaonline.fun/)
- **Backend**: [https://bacteria-online-server.onrender.com/](https://bacteria-online-server.onrender.com/)

### Production Build

```bash
# Build client
cd client && npm run build

# Build server
cd server && npm run build

# Start production server
cd server && npm start
```

### Deployment Platforms

**Render (Current)**
- Server deployed on Render with automatic deployments
- Environment variables configured in Render dashboard
- Supports both staging and production environments

**Docker Support**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 Screenshots

| Game Board                                | Card Selection                  | Mobile View                       |
| ----------------------------------------- | ------------------------------- | --------------------------------- |
| ![Game Board](docs/images/game-board.png) | ![Cards](docs/images/cards.png) | ![Mobile](docs/images/mobile.png) |

## 🎯 Key Components

### Frontend Architecture

- **`useGame`**: Main game state management
- **`useSocketConnection`**: WebSocket connection handling
- **`useGameNotifications`**: Smart notification system
- **`Game`**: Main game interface
- **`Board`**: Player board display
- **`ConnectionIndicator`**: Real-time status

### Backend Architecture

- **`gameLogic.ts`**: Core game rules and validation
- **`registerGameEvents.ts`**: Game event handling
- **`registerRoomEvents.ts`**: Room management

## 🔮 Future Enhancements

- [ ] **AI Players**: Single-player mode with computer opponents
- [ ] **Tournaments**: Competitive gameplay with brackets
- [ ] **Statistics**: Player performance tracking
- [ ] **Sound Effects**: Audio feedback for actions
- [ ] **Animations**: Smooth card transitions
- [ ] **Internationalization**: Multiple language support
- [ ] **Spectator Mode**: Watch games in progress

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the classic "Bacteria!" card game
- Community feedback and contributions

---

**🎮 Ready to play? [Start a game](https://bacteriaonline.fun/) and show your strategic skills!**
