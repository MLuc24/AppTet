# AppTet - React Native Expo Project

Clean Architecture React Native app built with Expo following production-grade guidelines.

## 🚀 Tech Stack

- **React Native** 0.81.5
- **Expo SDK** ~54
- **TypeScript** (strict mode)
- **expo-router** - File-based routing
- **@tanstack/react-query** - Server state management
- **zustand** - Client state management
- **nativewind** - TailwindCSS for React Native
- **react-hook-form** + **zod** - Forms & validation
- **react-native-reanimated** - Animations
- **jest** + **@testing-library/react-native** - Testing

## 📁 Project Structure

```
src/
├── app/               # expo-router (routing only)
│   ├── (auth)/       # Auth group routes
│   ├── (tabs)/       # Tab group routes
│   └── _layout.tsx   # Root layout
│
├── features/         # Business features
│   ├── auth/
│   ├── cart/
│   ├── order/
│   └── profile/
│
├── shared/           # Shared resources
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── constants/
│
├── store/            # Zustand stores
├── api/              # API clients
├── theme/            # Design system & tokens
├── types/            # Global types
├── config/           # Environment config
└── tests/            # Test files
```

## 🛠️ Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start development server**
   ```bash
   npm start
   ```

## 📱 Run on Device

- **Android**: `npm run android`
- **iOS**: `npm run ios` (macOS only)
- **Web**: `npm run web`

## 🧪 Testing

```bash
npm test
```

## 📏 Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## 📋 Development Guidelines

- File limit: **≤ 500 lines**
- No business logic in `app/` routes
- Feature-based structure
- No cross-feature imports
- TypeScript strict mode
- Test logic, not implementation

See [REACT_NATIVE_EXPO_GUIDELINES.md](REACT_NATIVE_EXPO_GUIDELINES.md) for detailed guidelines.

## 🔐 Environment Variables

- `EXPO_PUBLIC_API_URL` - API base URL
- `EXPO_PUBLIC_ENV` - Environment (development/staging/production)

## 📄 License

Private
