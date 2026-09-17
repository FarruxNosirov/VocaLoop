import AsyncStorage from "@react-native-async-storage/async-storage";

// Qurilmadagi so'zlar, natijalar va navbat qaysi foydalanuvchiniki ekanini belgilaydi
const OWNER_KEY = "local_data_owner_v1";

const USER_DATA_KEYS = ["quiz_results_v1", "sync_queue_v1"];
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** Qurilmadagi foydalanuvchiga tegishli barcha ma'lumotni o'chiradi (tema kabi sozlamalar qoladi) */
export async function clearLocalUserData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const toRemove = keys.filter((k) => DATE_KEY.test(k) || USER_DATA_KEYS.includes(k));
  await AsyncStorage.multiRemove([...toRemove, OWNER_KEY]);
}

/**
 * Login/ro'yxatdan o'tishda chaqiriladi.
 * Qurilmada boshqa foydalanuvchining ma'lumoti bo'lsa — uni yangi hisobga yuklab yubormaslik uchun o'chiradi.
 */
export async function claimLocalData(userId: string): Promise<void> {
  const owner = await AsyncStorage.getItem(OWNER_KEY);
  if (owner && owner !== userId) {
    await clearLocalUserData();
  }
  await AsyncStorage.setItem(OWNER_KEY, userId);
}
