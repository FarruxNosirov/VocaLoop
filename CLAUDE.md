# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Start Expo development server
npm run ios         # Native iOS build + simulator (needed after adding native packages)
npm run android     # Native Android build
npm run lint        # Run ESLint

cd backend
npm run dev         # Backend locally (tsx + nodemon), needs backend/.env
npx prisma db push  # Apply schema.prisma to the database
npx prisma generate # Regenerate Prisma client after schema changes
```

There are no automated tests configured in this project.

## Architecture

**VocaLoop** is an English↔Uzbek vocabulary app: Expo 54 / React Native 0.81 client plus an Express + Prisma backend.

- **Client** (`app/`, Expo Router): tabs are Tarjimon (`index.tsx`), Kitoblar, O'yinlar, Profil; `kitob/` shows book units, `quiz/` runs tests
- **Backend** (`backend/`): Express 5, Prisma 7 with `@prisma/adapter-pg`, PostgreSQL on Supabase, deployed to Railway (root directory `backend`, auto-deploy on push to `main`)
- **Translation**: `services/translate.ts` uses the keyless `translate.googleapis.com/translate_a/single` endpoint
- **TTS**: `services/tts.ts` — Google Cloud TTS (needs `EXPO_PUBLIC_GOOGLE_API_KEY`), falls back to `expo-speech`
- **Books**: static data in `constants/books/*.ts`, aggregated by `constants/books-data.ts`

### Offline-first data flow

Every user mutation is written to AsyncStorage first, then queued for the backend:

```
screen → services/storage.ts | quiz-storage.ts | auth-context.updateProfile
       → AsyncStorage (source of truth for the UI)
       → services/sync-queue.ts enqueue() → flush() → services/api.ts → backend
```

- The queue persists under `sync_queue_v1`; ops for the same object replace each other (last wins)
- `flush()` runs on enqueue, on app start and whenever NetInfo reports connectivity (`startAutoSync` in `auth-context`)
- Retryable errors (network, 401, 404, 408, 429, 5xx) keep the op queued; other 4xx drop it
- On login/app start `fullSync()` pushes local data and merges server data back
- `services/local-data.ts` tracks which user owns local data: logout and account deletion clear it; logging in as a different user clears it before syncing, so one account's data never uploads into another

### Auth

- The phone number is sent in the backend's `email` field (no UI change needed)
- JWT (30 days) stored in AsyncStorage; a 401 from the API ends the session via `setUnauthorizedHandler` but keeps local data
- Auth endpoints are rate limited (10 attempts / 15 min per IP; `trust proxy` is set for Railway)
- Account deletion: `DELETE /api/user/profile` with the password; Word and QuizResult rows cascade
- Privacy policy is served by the backend at `/privacy` (contact from `CONTACT_EMAIL`)

### Stop/play architecture

`speakAllWords` uses a `useRef<boolean>` (`isPlayingRef`) alongside `isPlaying` state. The ref is checked at every loop iteration and inside `onDone` callbacks so `stopSpeaking()` actually halts mid-loop. Never use only state for this — state updates are async and won't be seen inside the speech callbacks.

### Import paths

TypeScript path alias `@/*` resolves to the project root, so imports use `@/components/...`, `@/constants/...`, etc.

### Release

- `eas.json` profiles: `development`, `preview` (internal APK), `production` (build numbers managed remotely by EAS)
- iOS bundle id `com.abjalilov.VocaLoop`, Android package `com.abjalilov.vocaloop` — these cannot change after the first store upload
