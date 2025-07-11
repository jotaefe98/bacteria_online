# 🦠 Bacteria Online - Frontend Client

The React-based frontend client for **Bacteria Online**, a strategic multiplayer card game. Built with modern web technologies for optimal performance and user experience.

## 🎯 Overview

This is the client application for Bacteria Online, a real-time multiplayer implementation of the popular card game "Bacteria!". The frontend provides an intuitive interface for players to create rooms, join games, and play against opponents in real-time.

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bacteria_online.git
cd bacteria_online/client

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Technology Stack

- **React 19**: Modern UI library with hooks and concurrent features
- **TypeScript**: Static typing for enhanced developer experience
- **Vite**: Fast development server and build tool
- **React Router**: Client-side routing and navigation
- **Socket.IO Client**: Real-time bidirectional communication
- **React Hot Toast**: Elegant notification system
- **ESLint**: Code linting and style enforcement

## 📁 Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Board/          # Game board display
│   │   ├── Card/           # Card components
│   │   ├── Game/           # Main game interface
│   │   ├── ConnectionIndicator/  # Network status
│   │   ├── ErrorBoundary/  # Error handling
│   │   └── PlayerList/     # Player management
│   ├── pages/              # Application pages
│   │   ├── Lobby/          # Home page and room creation
│   │   └── Room/           # Pre-game room interface
│   ├── hooks/              # Custom React hooks
│   │   ├── game/           # Game state management
│   │   ├── lobby/          # Lobby functionality
│   │   └── room/           # Room management
│   ├── interfaces/         # TypeScript interfaces
│   │   ├── game/           # Game-related types
│   │   └── server/         # Server communication types
│   ├── context/            # React Context providers
│   ├── const/              # Application constants
│   ├── utils/              # Utility functions
│   └── assets/             # Static assets
├── public/                 # Public assets
├── package.json
└── vite.config.ts
```

## 🎮 Key Features

### Core Gameplay

- **Real-time multiplayer** with WebSocket connections
- **Turn-based strategy** with visual feedback
- **Card selection** and target highlighting
- **Automatic game state synchronization**
- **Victory condition detection**

### User Experience

- **Responsive design** for desktop and mobile
- **Smart notifications** with contextual messages
- **Connection status monitoring**
- **Room sharing** via code or direct link
- **Nickname management** with validation
- **Session persistence** for reconnection

### Interface Components

- **Interactive game board** with organ status visualization
- **Hand management** with card selection
- **Player list** with connection status
- **Real-time updates** for all game actions
- **Error boundaries** for graceful error handling

## 🎯 Core Components

### Pages

#### Lobby (`pages/Lobby/`)

- **Room creation** with nickname validation
- **Room joining** with code validation
- **Error handling** for invalid rooms
- **Navigation** to game rooms

#### Room (`pages/Room/`)

- **Player list** with host indication
- **Nickname management** for all players
- **Game controls** (start/leave)
- **Connection status** monitoring

### Components

#### Game (`components/Game/`)

- **Main game interface** with all gameplay elements
- **Board container** showing all player boards
- **Hand management** with card selection
- **Action buttons** for play/discard/draw
- **Game rules modal** for reference

#### Board (`components/Board/`)

- **Individual player board** visualization
- **Organ status display** with color coding
- **Click handling** for card targeting
- **Real-time updates** for board changes

#### Card (`components/Card/`)

- **Interactive card display** with hover effects
- **Selection state** visualization
- **Card type identification** with icons
- **Disabled state** handling

## 🎣 Custom Hooks

### Game Hooks

#### `useGame`

```typescript
const {
  hand, // Player's current hand
  boards, // All player boards
  currentTurn, // Current player ID
  currentPhase, // Current game phase
  winner, // Winner player ID
  canDraw, // Can draw cards
  canPlay, // Can play cards
  playerId, // Current player ID
  playerNames, // Player nicknames
  handleDraw, // Draw cards function
  handleDiscard, // Discard cards function
  handlePlayCard, // Play card function
} = useGame({ roomId, isGameStarted, isHost });
```

#### `useGameNotifications`

```typescript
const {
  gameNotifications, // Notification functions
  showNotification, // Generic notification
} = useGameNotifications();
```

### Connection Hooks

#### `useSocketConnection`

```typescript
const {
  socket, // Socket.IO instance
  isConnected, // Connection status
  reconnecting, // Reconnection state
} = useSocketConnection();
```

#### `usePlayerId`

```typescript
const playerId = usePlayerId(); // Persistent player ID
```

## 🎨 Styling and Theming

### CSS Architecture

- **Component-scoped styles** with CSS modules
- **Responsive design** with mobile-first approach
- **CSS custom properties** for theming
- **Gradient backgrounds** for visual appeal
- **Smooth animations** for state transitions

### Design System

- **Color palette** with game-themed colors
- **Typography** with clear hierarchy
- **Spacing system** for consistent layouts
- **Interactive states** with hover/focus effects
- **Loading states** for better UX

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile (default) */
@media (max-width: 767px) {
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
}

/* Desktop */
@media (min-width: 1024px) {
}
```

### Mobile Optimizations

- **Touch-friendly** button sizes
- **Optimized layouts** for small screens
- **Swipe gestures** for card interaction
- **Reduced animations** for performance

## 🔧 Configuration

### Environment Variables

```env
# Development
VITE_SERVER_URL=http://localhost:3000

# Production
VITE_SERVER_URL=https://your-server.com
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Component Testing

```typescript
// Example test
describe("Card Component", () => {
  test("renders card with correct type", () => {
    render(<Card card={mockCard} />);
    expect(screen.getByTestId("card-type")).toHaveTextContent("organ");
  });
});
```

## 📦 Build and Deployment

### Development Build

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Production Deployment

```bash
# Build optimized bundle
npm run build

# Deploy to static hosting
npm run deploy
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🎯 Performance Optimizations

### Code Splitting

- **Route-based splitting** for pages
- **Component lazy loading** for large components
- **Dynamic imports** for conditional features

### Bundle Optimization

- **Tree shaking** for unused code elimination
- **Asset optimization** for smaller bundle sizes
- **Gzip compression** for faster loading

### Runtime Performance

- **React.memo** for component memoization
- **useMemo** for expensive calculations
- **useCallback** for function memoization
- **Virtual scrolling** for large lists

## � Security

### Input Validation

- **Client-side validation** for immediate feedback
- **Server-side validation** for security
- **XSS prevention** with proper escaping
- **CSRF protection** with token validation

### Data Protection

- **No sensitive data** in localStorage
- **Secure communication** with HTTPS
- **Input sanitization** for user data
- **Error boundary** for graceful failures

## 📊 Analytics and Monitoring

### Performance Monitoring

```typescript
// Performance tracking
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});
```

### Error Tracking

```typescript
// Error boundary
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error("React Error:", error, errorInfo);
  }
}
```

## 🚀 Future Enhancements

### Planned Features

- **Offline mode** with service worker
- **Push notifications** for turn alerts
- **Game replay** system
- **Advanced statistics** dashboard
- **Custom themes** and personalization

### Technical Improvements

- **GraphQL integration** for better data fetching
- **State management** with Redux Toolkit
- **Micro-frontend** architecture
- **Progressive Web App** capabilities

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow commit message conventions

## 📚 Resources

- **[Game Rules](../GAME_RULES.md)**: Complete game mechanics
- **[Architecture Guide](../ARCHITECTURE.md)**: Technical overview
- **[API Documentation](../API.md)**: Server communication
- **[Contributing Guide](../CONTRIBUTING.md)**: Development workflow

---

**🎮 Ready to start playing? The game awaits your strategic moves!**
