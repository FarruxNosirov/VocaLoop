# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Start Expo development server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android simulator/device
npm run web         # Run web version
npm run lint        # Run ESLint
```

There are no automated tests configured in this project.

## Architecture

**VocaLoop** is a React Native vocabulary learning app for English-to-Uzbek translation, built with Expo 54 / React Native 0.81. It uses:

- **Expo Router** (file-based routing) — `app/` directory maps directly to routes; `(tabs)/` is the bottom tab group
- **Google Translate API** — called directly from the client in `app/(tabs)/index.tsx` to translate English → Uzbek
- **expo-speech** — TTS pronunciation for both English (rate 0.8) and Uzbek translations
- **AsyncStorage** — local persistence keyed by ISO date string; each day gets its own word list

### Key files

- `app/(tabs)/index.tsx` — main screen: state management, translate/speak/delete handlers only (no UI primitives)
- `components/translate-input.tsx` — input field + translate button + result card
- `components/word-card.tsx` — single word row with speak/delete buttons
- `components/word-list.tsx` — FlatList wrapper with "Play All / Stop" header
- `services/translate.ts` — Google Translate API call (single export `translateWord`)
- `services/storage.ts` — AsyncStorage helpers: `loadTodayWords`, `saveWords`, `getTodayKey`
- `types/index.ts` — `Word` interface `{ id, original, translated, time }`
- `constants/app-colors.ts` — VocaLoop brand colors (`AppColors`); separate from `constants/theme.ts` which is Expo default theming
- `app/(tabs)/_layout.tsx` — bottom tab navigator (Home + Explore tabs)

### Data model

Words are stored in AsyncStorage under a date key (e.g., `"2026-04-01"`). Each entry is a JSON array of `Word` objects:
```ts
interface Word { id: string; original: string; translated: string; time: string }
```

### Stop/play architecture

`speakAllWords` uses a `useRef<boolean>` (`isPlayingRef`) alongside `isPlaying` state. The ref is checked at every loop iteration and inside `onDone` callbacks so `stopSpeaking()` actually halts mid-loop. Never use only state for this — state updates are async and won't be seen inside the speech callbacks.

### Import paths

TypeScript path alias `@/*` resolves to the project root, so imports use `@/components/...`, `@/constants/...`, etc.

## Planned features (V2 roadmap from README)

Firebase auth, word statistics, spaced repetition algorithm, word categories, freemium model.
