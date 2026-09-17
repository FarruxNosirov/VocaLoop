import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  ApiError,
  apiDeleteAccount,
  apiLogin,
  apiRegister,
  apiUpdateProfile,
  AuthUser,
  getToken,
  isNetworkError,
  ProfileUpdateData,
  removeToken,
  saveToken,
  setUnauthorizedHandler,
} from "@/services/api";
import { claimLocalData, clearLocalUserData } from "@/services/local-data";
import {
  pushLocalResultsToBackend,
  syncResultsFromBackend,
} from "@/services/quiz-storage";
import {
  pushLocalWordsToBackend,
  syncWordsFromBackend,
} from "@/services/storage";
import { enqueue, startAutoSync } from "@/services/sync-queue";

const USER_KEY = "auth_user_v1";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  register: (name: string, phone: string, password: string) => Promise<void>;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * To'liq sinxronlash: lokaldagini backendga yuboradi, backenddagini lokalga tortadi.
 * Offline bo'lsa jim o'tadi — ma'lumot navbatda saqlanadi.
 */
function fullSync(): void {
  (async () => {
    await pushLocalWordsToBackend().catch(() => {});
    await pushLocalResultsToBackend().catch(() => {});
    await syncWordsFromBackend().catch(() => {});
    await syncResultsFromBackend().catch(() => {});
  })();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ilova ochilganda: token tekshirish + avtomatik sinxronlashni yoqish
  useEffect(() => {
    const stopAutoSync = startAutoSync();

    // Token yaroqsiz bo'lsa: login ekraniga qaytaramiz, lekin lokal ma'lumot qoladi —
    // o'sha foydalanuvchi qayta kirsa, navbatdagi o'zgarishlar yuboriladi
    setUnauthorizedHandler(() => {
      (async () => {
        await removeToken();
        await AsyncStorage.removeItem(USER_KEY);
        setUser(null);
      })();
    });

    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const saved = await AsyncStorage.getItem(USER_KEY);
          if (saved) {
            const savedUser: AuthUser = JSON.parse(saved);
            await claimLocalData(savedUser.id);
            setUser(savedUser);
          }
          fullSync();
        }
      } catch (e) {
        console.warn("Auth yuklashda xato:", e);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      stopAutoSync();
      setUnauthorizedHandler(null);
    };
  }, []);

  const register = useCallback(
    async (name: string, phone: string, password: string): Promise<void> => {
      const res = await apiRegister(name, phone, password);
      await claimLocalData(res.user.id);
      await saveToken(res.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setUser(res.user);
      fullSync();
    },
    []
  );

  const login = useCallback(
    async (phone: string, password: string): Promise<boolean> => {
      try {
        const res = await apiLogin(phone, password);
        await claimLocalData(res.user.id);
        await saveToken(res.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
        setUser(res.user);
        fullSync();
        return true;
      } catch (e) {
        // Faqat server "noto'g'ri" desa false; tarmoq, limit va boshqa xatolar xabari bilan chiqadi
        if (e instanceof ApiError && e.status === 400) return false;
        throw e;
      }
    },
    []
  );

  // Chiqish: shu qurilmadagi foydalanuvchi ma'lumotlari ham tozalanadi
  const logout = useCallback(async () => {
    await removeToken();
    await AsyncStorage.removeItem(USER_KEY);
    await clearLocalUserData();
    setUser(null);
  }, []);

  // Hisobni o'chirish: avval serverdan (parol bilan), keyin qurilmadan
  const deleteAccount = useCallback(async (password: string) => {
    await apiDeleteAccount(password);
    await removeToken();
    await AsyncStorage.removeItem(USER_KEY);
    await clearLocalUserData();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdateData) => {
    let updated: AuthUser;
    try {
      const res = await apiUpdateProfile(data);
      updated = res.user;
    } catch (e) {
      if (!isNetworkError(e)) throw e;
      // Offline — lokal o'zgartiramiz, backendga navbatga qo'yamiz
      const saved = await AsyncStorage.getItem(USER_KEY);
      const current: AuthUser = saved ? JSON.parse(saved) : { id: "", email: "", name: null };
      updated = {
        ...current,
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
      };
      await enqueue({ type: "profile.update", payload: data });
    }

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
