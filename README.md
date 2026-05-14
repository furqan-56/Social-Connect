# SocialConnect

A full-featured social media mobile application built with React Native. SocialConnect supports real-time feeds, user profiles, comments, notifications, and rich media posts — all backed by Firebase and delivered through a polished, dark-mode-ready design system.

---

## Features

### Authentication
- Email/password login and sign-up via Firebase Auth
- Two-step sign-up with progress indicator and password strength meter
- Forgot password flow with animated success confirmation
- Auth guard: app routes automatically based on Firebase `onAuthStateChanged`
- Animated splash screen shown during cold-start auth resolution

### Home Feed
- Live post feed powered by Firestore
- Story row with unseen/seen gradient ring animations
- Animated like button with 8-particle burst effect and haptic feedback
- Pull-to-retry on failed fetch
- Floating action button (FAB) to create a new post

### Posts & Comments
- Create posts with image picker and audience selector (full-screen composer)
- Character counter and action bar in post composer
- Comment screen with chat-bubble layout and inline send bar
- Comments loaded from Firestore subcollection `/posts/{postId}/comments/{commentId}`
- Real-time like and comment updates via socket.io

### Profiles
- Own profile with Posts / Liked / Saved tabs and stats row
- Other user profiles with animated Follow/Following toggle and Message button
- Edit profile with photo picker, Formik validation, and unsaved-changes dialog

### Discover
- Search bar with animated heading hide on focus
- Trending tags, suggested users, and masonry post grid

### Notifications
- Segmented control: All / Mentions / Likes / Follows
- Grouped by time with unread highlight bar
- Firebase Cloud Messaging (FCM) push notifications; token saved to Firestore

### Settings
- Grouped sections with Switch toggles
- Danger zone with logout
- Version footer

---

## Tech Stack

| Layer | Library / Version |
|---|---|
| Framework | React Native 0.85.3 |
| Language | TypeScript 5.8 |
| State | Redux Toolkit 2.x + React-Redux 9.x |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| Backend | Firebase (Auth, Firestore, Cloud Messaging) v24 |
| Real-time | socket.io-client 4.x |
| Forms | Formik 2.x + Yup 1.x |
| Icons | react-native-vector-icons 10.x (Feather + MaterialCommunityIcons) |
| Animations | React Native Animated API |
| Haptics | react-native-haptic-feedback 2.x |
| Gradients | react-native-linear-gradient 2.x |
| Image picker | react-native-image-picker 8.x |
| Testing | Jest 29 + React Native Jest preset |

---

## Project Structure

```
src/
├── components/
│   ├── AppHeader.tsx         # Safe-area-aware header
│   ├── AppIcon.tsx           # Unified icon component (Feather / MCI)
│   ├── AnimatedLikeButton.tsx
│   ├── Avatar.tsx            # Circular avatar with initials + story ring
│   ├── CustomTabBar.tsx      # Floating pill tab bar with FAB
│   ├── EmptyState.tsx
│   ├── LoadingShimmer.tsx
│   ├── PostCard.tsx
│   ├── PostFeed.tsx
│   ├── StoryRow.tsx
│   └── Toast.tsx             # Slide-in toast (success / error / info)
├── screens/
│   ├── SplashScreen.tsx
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── HomeScreen.tsx
│   ├── DiscoverScreen.tsx
│   ├── CreatePostScreen.tsx
│   ├── NotificationsScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── UserProfileScreen.tsx
│   ├── EditProfileScreen.tsx
│   ├── CommentScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/
│   └── AppNavigator.tsx      # Auth stack + main stack + 5-tab bar
├── store/
│   ├── store.ts
│   ├── hooks.ts
│   └── slices/               # authSlice, postsSlice, likesSlice
├── services/
│   ├── auth.ts               # Firebase Auth service
│   ├── posts.ts              # Firestore posts service
│   ├── profile.ts            # Firestore profile service
│   └── notifications.ts      # FCM service
├── theme/
│   ├── index.ts              # Design tokens (palette, spacing, radius, typography)
│   ├── ThemeContext.tsx       # ThemeProvider + useTheme() hook
│   ├── colors.ts
│   ├── spacing.ts
│   ├── radius.ts
│   └── typography.ts
├── hooks/
│   ├── useRealtimeSync.ts    # socket.io event listeners
│   └── useNotifications.ts   # FCM registration + foreground listener
├── config/
│   ├── firebase.ts
│   └── socialRealtime.ts     # connectSocket / disconnectSocket
├── utils/
│   ├── responsive.ts         # wp(), hp(), isSmallDevice()
│   ├── haptics.ts            # hapticLight/Medium/Heavy/Success/Error
│   └── date.ts
└── types/
    ├── navigation.ts
    └── social.ts
```

---

## Design System

All UI is built on a centralized theme layer. Use `useTheme()` from `src/theme/ThemeContext.tsx` in every component — never hardcode hex colors.

### Color Tokens

| Token | Value |
|---|---|
| Primary | `#6C63FF` |
| Accent | `#FF6584` |
| Success | `#22C55E` |
| Error | `#EF4444` |
| Dark background | `#0F0F13` |
| Dark surface | `#1A1A22` |

### Spacing (8pt grid)
`xs=4` · `sm=8` · `md=16` · `lg=24` · `xl=32` · `2xl=48`

### Border Radius
`button=14` · `card=20` · `avatar=9999` · `input=14` · `sheet=28`

### Tab Bar
- Floating pill, 16px above home indicator, 20px side margins, 28px border radius
- Glass background with automatic dark mode variant
- FAB rises 18px above the pill; tap navigates to CreatePost modal
- Active tab shows label (height + opacity animated); inactive tabs show icon only
- Spring-scale bounce animation on tab switch

---

## Firestore Data Model

```
/users/{uid}
  displayName, photoURL, bio, fcmToken

/posts/{postId}
  authorId, content, imageUrl, likedBy: string[], createdAt

/posts/{postId}/comments/{commentId}
  authorId, text, createdAt
```

---

## Real-time Events (socket.io)

| Event | Payload |
|---|---|
| `like` | `{ postId, likeCount, likedByMe? }` |
| `comment` | `{ postId, comment: Comment }` |

Socket URL is configured in `src/config/socialRealtime.ts`. Default is `http://10.0.2.2:4000` (Android emulator loopback to host machine).

---

## Getting Started

### Prerequisites

- Node >= 22.11.0
- React Native CLI environment configured ([Android Studio](https://developer.android.com/studio) / Xcode)
- Firebase project with **Authentication**, **Firestore**, and **Cloud Messaging** enabled
- `google-services.json` at `android/app/google-services.json`
- `GoogleService-Info.plist` at `ios/SocialConnect/GoogleService-Info.plist`

### Install dependencies

```sh
npm install
```

### Android

```sh
npm run android
```

### iOS

```sh
cd ios && pod install && cd ..
npm run ios
```

### Web (dev preview)

```sh
npm run web
```

---

## Testing

```sh
npm test
```

Firebase module mocks are in `__mocks__/@react-native-firebase/` and wired up via `moduleNameMapper` in `jest.config.js`.

---

## Demo Credentials

```
Email:    demo@socialconnect.dev
Password: Password123
```

---

## License

Private — all rights reserved.
