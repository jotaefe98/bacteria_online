# 🤝 Contributing to Bacteria Online

Thank you for your interest in contributing to **Bacteria Online**! This document provides guidelines and instructions for contributing to our strategic multiplayer card game project.

## 🎯 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Security Issues](#security-issues)
- [Community](#community)

## 📋 Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors, regardless of experience level, gender identity, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Expected Behavior

- **Be respectful** and inclusive in all interactions
- **Be constructive** when giving feedback
- **Be patient** with new contributors
- **Be collaborative** and help others learn
- **Focus on the project** and avoid personal attacks

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting, or derogatory remarks
- Personal or political attacks
- Publishing private information without consent
- Any conduct that could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Git** for version control
- **VS Code** (recommended) or your preferred editor
- Basic knowledge of **TypeScript** and **React**

### First-Time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/yourusername/bacteria_online.git
   cd bacteria_online
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/original/bacteria_online.git
   ```

4. **Install dependencies**:

   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

5. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Environment Configuration

1. **Create environment files**:

   ```bash
   # Client environment
   cp client/.env.example client/.env

   # Server environment
   cp server/.env.example server/.env
   ```

2. **Configure environment variables**:

   ```env
   # client/.env
   VITE_SERVER_URL=http://localhost:3000

   # server/.env
   PORT=3000
   NODE_ENV=development
   ```

### Running the Application

1. **Start the server**:

   ```bash
   cd server
   npm run dev
   ```

2. **Start the client** (in a new terminal):

   ```bash
   cd client
   npm run dev
   ```

3. **Access the application**:
   - Client: `http://localhost:5173`
   - Server: `http://localhost:3000`

### Development Tools

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Vite**: Fast development server
- **Socket.IO**: Real-time communication

## 📁 Project Structure

```
bacteria_online/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── interfaces/     # TypeScript interfaces
│   │   ├── context/        # React Context providers
│   │   ├── const/          # Constants and configurations
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── events/         # Socket.IO event handlers
│   │   ├── functions/      # Game logic and utilities
│   │   ├── types/          # TypeScript interfaces
│   │   ├── const/          # Server constants
│   │   └── utils/          # Server utilities
│   └── package.json
├── docs/                   # Documentation
├── API.md                  # API documentation
├── GAME_RULES.md          # Game rules and mechanics
├── ARCHITECTURE.md        # Technical architecture
└── CONTRIBUTING.md        # This file
```

## 🎨 Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

1. **🐛 Bug Fixes**: Fix existing issues or unexpected behavior
2. **✨ New Features**: Add new functionality or game mechanics
3. **📚 Documentation**: Improve docs, comments, or README files
4. **🎨 UI/UX**: Enhance user interface and experience
5. **⚡ Performance**: Optimize code performance
6. **🧪 Testing**: Add or improve test coverage
7. **🔧 Refactoring**: Improve code structure without changing behavior

### Contribution Areas

#### Frontend (Client)

- React components and hooks
- User interface improvements
- Game board visualization
- Responsive design
- Accessibility features

#### Backend (Server)

- Socket.IO event handling
- Game logic implementation
- Room management
- Error handling
- Performance optimization

#### Documentation

- API documentation
- Code comments
- User guides
- Technical documentation

### Getting Work Assigned

1. **Check existing issues** for open tasks
2. **Comment on an issue** to express interest
3. **Wait for assignment** before starting work
4. **Create a new issue** for features not listed

## 📝 Pull Request Process

### Before Creating a PR

1. **Sync with upstream**:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Update your branch**:

   ```bash
   git checkout your-feature-branch
   git rebase main
   ```

3. **Run tests**:

   ```bash
   # Client tests
   cd client && npm test

   # Server tests
   cd server && npm test
   ```

4. **Lint your code**:

   ```bash
   # Client linting
   cd client && npm run lint

   # Server linting
   cd server && npm run lint
   ```

### Creating the PR

1. **Push your changes**:

   ```bash
   git push origin your-feature-branch
   ```

2. **Create PR on GitHub** with:
   - Clear, descriptive title
   - Detailed description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Test instructions

### PR Template

```markdown
## Description

Brief description of the changes made.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Fixes #123

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots

(If applicable)

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Address feedback** if requested
4. **Approval** from at least one maintainer
5. **Merge** when all checks pass

## 💻 Coding Standards

### TypeScript Guidelines

```typescript
// Use explicit types for function parameters and return values
function calculateScore(player: Player, cards: Card[]): number {
  return cards.reduce((score, card) => score + card.value, 0);
}

// Use interfaces for object structures
interface GameState {
  players: Player[];
  currentTurn: string;
  phase: GamePhase;
}

// Use enums for constants
enum GamePhase {
  DRAW = "draw",
  PLAY = "play",
  DISCARD = "discard",
}
```

### React Guidelines

```typescript
// Use functional components with hooks
const GameBoard: React.FC<GameBoardProps> = ({ players, onCardPlay }) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Use useCallback for event handlers
  const handleCardSelect = useCallback((card: Card) => {
    setSelectedCard(card);
  }, []);

  return <div className="game-board">{/* JSX content */}</div>;
};

// Use proper prop types
interface GameBoardProps {
  players: Player[];
  onCardPlay: (card: Card, target: Target) => void;
}
```

### CSS Guidelines

```css
/* Use BEM naming convention */
.game-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.game-board__player {
  background: var(--color-background-secondary);
  border-radius: 8px;
  padding: 1rem;
}

.game-board__player--active {
  border: 2px solid var(--color-primary);
}

/* Use CSS custom properties for theming */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
}
```

### Naming Conventions

- **Variables**: camelCase (`playerName`, `currentTurn`)
- **Functions**: camelCase (`handleCardPlay`, `calculateScore`)
- **Components**: PascalCase (`GameBoard`, `PlayerCard`)
- **Interfaces**: PascalCase (`GameState`, `PlayerData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PLAYERS`, `GAME_PHASES`)
- **Files**: kebab-case (`game-board.tsx`, `player-card.css`)

## 🧪 Testing Requirements

### Unit Testing

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "./Card";

describe("Card Component", () => {
  const mockCard = {
    id: "1",
    type: "organ",
    organType: "heart",
    color: "red",
  };

  test("renders card with correct type", () => {
    render(<Card card={mockCard} />);
    expect(screen.getByTestId("card-type")).toHaveTextContent("organ");
  });

  test("calls onSelect when clicked", () => {
    const onSelect = jest.fn();
    render(<Card card={mockCard} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(mockCard);
  });
});
```

### Integration Testing

```typescript
// Socket.IO integration testing
import { Server } from "socket.io";
import { createServer } from "http";
import { io as Client } from "socket.io-client";

describe("Game Events", () => {
  let server: Server;
  let clientSocket: any;

  beforeEach((done) => {
    const httpServer = createServer();
    server = new Server(httpServer);

    httpServer.listen(() => {
      const port = httpServer.address()?.port;
      clientSocket = Client(`http://localhost:${port}`);

      clientSocket.on("connect", done);
    });
  });

  afterEach(() => {
    server.close();
    clientSocket.close();
  });

  test("should handle room creation", (done) => {
    clientSocket.emit("create-room", { nickname: "Test" });

    clientSocket.on("room-created", (data: any) => {
      expect(data.roomId).toBeDefined();
      expect(data.playerId).toBeDefined();
      done();
    });
  });
});
```

### Test Coverage

- **Minimum 80%** code coverage for new features
- **100%** coverage for critical game logic
- **Unit tests** for all components and functions
- **Integration tests** for Socket.IO events
- **End-to-end tests** for complete game flows

## 📚 Documentation

### Code Documentation

````typescript
/**
 * Calculates the final score for a player based on their organs and status
 * @param player - The player to calculate score for
 * @param gameState - Current game state
 * @returns The calculated score
 */
function calculatePlayerScore(player: Player, gameState: GameState): number {
  // Implementation here
}

/**
 * Game board component displaying all players and their organ status
 *
 * @example
 * ```tsx
 * <GameBoard
 *   players={players}
 *   onCardPlay={handleCardPlay}
 *   currentTurn={currentTurn}
 * />
 * ```
 */
interface GameBoardProps {
  /** Array of all players in the game */
  players: Player[];
  /** Callback when a card is played */
  onCardPlay: (card: Card, target: Target) => void;
  /** ID of the player whose turn it is */
  currentTurn: string;
}
````

### README Updates

When adding new features:

1. **Update feature lists** in README files
2. **Add usage examples** for new APIs
3. **Document configuration** options
4. **Include screenshots** for UI changes

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
## Bug Description

A clear description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Screenshots

If applicable, add screenshots.

## Environment

- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 91, Firefox 89]
- Version: [e.g., 1.0.0]

## Additional Context

Any other context about the problem.
```

### Information to Include

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Screenshots or videos** if applicable
- **Environment details** (OS, browser, version)
- **Console errors** if any

## ✨ Feature Requests

### Feature Request Template

```markdown
## Feature Description

A clear description of the feature you'd like to see.

## Problem it Solves

What problem does this feature solve?

## Proposed Solution

How would you like this feature to work?

## Alternatives Considered

Any alternative solutions you've considered.

## Additional Context

Any other context, screenshots, or examples.
```

### Feature Guidelines

- **Align with game vision** and objectives
- **Consider user experience** impact
- **Evaluate technical feasibility**
- **Include mockups** for UI features
- **Provide use cases** and examples

## 🔒 Security Issues

### Reporting Security Issues

**Do not** report security vulnerabilities through public GitHub issues.

Instead:

1. **Email** security issues to: `security@bacteria-online.com`
2. **Include** detailed description and steps to reproduce
3. **Wait** for acknowledgment before public disclosure
4. **Allow time** for fix development and testing

### Security Best Practices

- **Input validation** on both client and server
- **Authentication** and authorization checks
- **Rate limiting** for API endpoints
- **Secure communication** (HTTPS/WSS)
- **Data sanitization** and XSS prevention

## 🎮 Game-Specific Guidelines

### Game Logic

- **Follow official rules** as defined in `GAME_RULES.md`
- **Maintain game balance** and fairness
- **Test with multiple players** and scenarios
- **Handle edge cases** gracefully
- **Ensure deterministic** behavior

### Card Implementation

```typescript
// Example card implementation
const organCard: Card = {
  id: generateId(),
  type: "organ",
  organType: "heart",
  color: "red",
  value: 1,
  description: "Healthy heart organ",
  canPlayOn: (target: Target) => {
    return target.type === "player" && !target.hasOrgan("heart");
  },
  onPlay: (gameState: GameState, target: Target) => {
    // Card effect implementation
  },
};
```

### UI/UX Guidelines

- **Responsive design** for mobile and desktop
- **Clear visual feedback** for actions
- **Intuitive card interactions**
- **Accessibility** considerations
- **Performance optimization**

## 🌟 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat and collaboration
- **Twitter**: Updates and announcements

### Getting Help

1. **Search existing issues** first
2. **Check documentation** and README files
3. **Ask in discussions** for general questions
4. **Join Discord** for real-time help
5. **Tag maintainers** for urgent issues

### Recognition

Contributors will be recognized:

- **Contributors list** in README
- **Release notes** mentions
- **GitHub contributors** page
- **Discord special role** for active contributors

## 📋 Checklists

### Pre-Contribution Checklist

- [ ] Read and understand the contributing guidelines
- [ ] Set up development environment
- [ ] Fork and clone the repository
- [ ] Create a feature branch
- [ ] Check existing issues and PRs

### Pre-Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions
- [ ] PR template filled out completely

### Maintainer Review Checklist

- [ ] Code quality and style compliance
- [ ] Test coverage and passing tests
- [ ] Documentation completeness
- [ ] Breaking change considerations
- [ ] Performance impact assessment
- [ ] Security implications review

## 📊 Metrics and Goals

### Project Metrics

- **Code coverage**: >80% for new features
- **Response time**: <48 hours for issue acknowledgment
- **Review time**: <7 days for PR review
- **Bug resolution**: <14 days for critical bugs

### Community Goals

- **Inclusive environment** for all contributors
- **Learning opportunity** for new developers
- **High-quality codebase** with good practices
- **Active maintenance** and regular updates

## 🏆 Recognition

### Contributor Levels

1. **First-time Contributor**: First merged PR
2. **Regular Contributor**: 5+ merged PRs
3. **Core Contributor**: 20+ merged PRs + consistent activity
4. **Maintainer**: Trusted with repository access

### Benefits

- **GitHub achievements** and contribution graph
- **Discord roles** and special channels
- **Mentorship opportunities** for new contributors
- **Early access** to new features and releases

## 📞 Contact

### Maintainers

- **Lead Developer**: `@username` (GitHub)
- **Game Designer**: `@username` (GitHub)
- **Community Manager**: `@username` (Discord)

### Support

- **Technical Questions**: GitHub Discussions
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Issues
- **Security Issues**: `security@bacteria-online.com`

---

## 🎯 Final Notes

Thank you for contributing to **Bacteria Online**! Your contributions help make this game better for everyone. Whether you're fixing bugs, adding features, improving documentation, or helping other contributors, every contribution matters.

Remember:

- **Quality over quantity**: Focus on well-tested, documented code
- **Community first**: Be respectful and helpful to others
- **Learn and grow**: Use this as an opportunity to improve your skills
- **Have fun**: Enjoy the process of building something great together!

**Happy coding, and may your contributions help create the best online card game experience! 🎮**

---

_This document is living and will be updated as the project evolves. Please check back regularly for updates and changes._
