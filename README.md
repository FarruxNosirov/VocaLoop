# VocaLoop

Inglizcha so'zlarni o'zbek tiliga tarjima qilib, talaffuzi bilan birga yodlaydigan React Native ilova.

---

## Ishga tushirish

```bash
# 1. Repozitoriyani yuklab oling
git clone https://github.com/<sizning-repo>.git
cd VocaLoop

# 2. Kutubxonalarni o'rnating
npm install

# 3. Ilovani ishga tushiring
npx expo start
```

Telefonda **Expo Go** ilovasini o'rnating va QR kodni skanlang.

---

## Google API kalitlari

`services/translate.ts` faylida tarjima uchun Google Translate API kaliti kerak:
```ts
const API_KEY = "YOUR_GOOGLE_TRANSLATE_API_KEY";
```

`services/tts.ts` faylida TTS uchun Google Cloud TTS API kaliti kerak:
```ts
const GOOGLE_API_KEY = "YOUR_GOOGLE_TTS_API_KEY";
```

> **Diqqat:** API kalitlarini hech qachon git'ga push qilmang. `.env` fayl yoki Expo secrets ishlatish tavsiya etiladi.

---

## Buyruqlar

```bash
npm start          # Expo development serverni ishga tushirish
npm run ios        # iOS simulatorda ishga tushirish
npm run android    # Android emulatorda ishga tushirish
npm run lint       # ESLint tekshiruvi
```

---

## Ilova imkoniyatlari

- Ko'p tilli tarjima (40+ til) — Google Translate API orqali
- TTS talaffuz — inglizcha va o'zbekcha
- 10 ta kitob: 4000 Essential English Words (1-6), Oxford Word Skills, Irregular Verbs
- So'z quizi — vaqtli test, coinlar tizimi
- Irregular verbs quizi — V2/V3 shakllarini yodlash
- Kunlik so'z tarixi — AsyncStorage'da saqlanadi
- Yorug'/qorong'/sistema mavzulari
- SQLite orqali mahalliy foydalanuvchi hisobi

---

## Keyingi bosqichlar (V2)

- [ ] Firebase bulut sinxronizatsiyasi
- [ ] Spaced repetition algoritmi
- [ ] So'z statistikasi va grafik
- [ ] So'z toifalari
- [ ] Freemium model
