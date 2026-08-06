# VocaLoop — Boshlash yo'riqnomasi

## Loyihani ishga tushirish

### 1-qadam: Expo o'rnatish
```bash
npm install -g expo-cli
```

### 2-qadam: Loyihani yaratish
```bash
npx create-expo-app VocaLoop
cd VocaLoop
```

### 3-qadam: Kerakli kutubxonalarni o'rnatish
```bash
npx expo install expo-speech
npx expo install @react-native-async-storage/async-storage
```

### 4-qadam: App.js ni almashtiris
App.js faylini yuklangan fayl bilan almashtiring.

### 5-qadam: Google API kalitini olish
1. https://console.cloud.google.com saytiga kiring
2. Yangi loyiha yarating: "VocaLoop"
3. "Cloud Translation API" ni yoqing
4. "Credentials" bo'limidan API kalit oling
5. App.js dagi `YOUR_GOOGLE_API_KEY` o'rniga o'z kalitingizni kiriting

### 6-qadam: Ilovani ishga tushirish
```bash
npx expo start
```
Telefonda "Expo Go" ilovasini o'rnating va QR kodni skanlang.

---

## Ilova imkoniyatlari (MVP)

- Inglizcha so'z kiriting → O'zbekcha tarjima
- Tarjima qilingan so'z avtomatik bugungi ro'yxatga qo'shiladi
- Har bir so'z yonidagi ▶ tugmasi inglizcha + o'zbekcha o'qib beradi
- "Barchasini o'qi" tugmasi barcha bugungi so'zlarni ketma-ket o'qib beradi
- So'zlar telefon xotirasida saqlanadi (offline ishlaydi)
- Har kun yangi ro'yxat boshlanadi

---

## Keyingi bosqichlar (V2)

- [ ] Firebase bilan foydalanuvchi hisobi
- [ ] Statistika: nechta so'z o'rganildi
- [ ] Spaced repetition: eski so'zlarni qaytarish
- [ ] So'z toifalari (ish, sayohat, texnologiya...)
- [ ] Freemium: kuniga 10 so'z bepul, undan ko'pi premium
