import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  apiLogin,
  apiRegister,
  apiUpdateProfile,
  AuthUser,
  getToken,
  ProfileUpdateData,
  removeToken,
  saveToken,
} from "@/services/api";

const USER_KEY = "auth_user_v1";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  register: (name: string, phone: string, password: string) => Promise<void>;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ilova ochilganda tokenni tekshirish
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const saved = await AsyncStorage.getItem(USER_KEY);
          if (saved) setUser(JSON.parse(saved));
        }
      } catch (e) {
        console.warn("Auth yuklashda xato:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const register = useCallback(
    async (name: string, phone: string, password: string): Promise<void> => {
      const res = await apiRegister(name, phone, password);
      await saveToken(res.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setUser(res.user);
    },
    []
  );

  const login = useCallback(
    async (phone: string, password: string): Promise<boolean> => {
      try {
        const res = await apiLogin(phone, password);
        await saveToken(res.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
        setUser(res.user);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await removeToken();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdateData) => {
    const res = await apiUpdateProfile(data);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
