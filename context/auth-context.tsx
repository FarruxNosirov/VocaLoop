import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  createUser,
  findUserByPhone,
  getFirstUser,
  isPhoneTaken,
  User,
} from "@/database/userService";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  register: (name: string, phone: string, password: string) => void;
  login: (phone: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ilova ochilganda SQLite da foydalanuvchi bormi tekshirish
  useEffect(() => {
    try {
      const existingUser = getFirstUser();
      if (existingUser) setUser(existingUser);
    } catch (e) {
      console.warn("Auth tekshirishda xato:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    (name: string, phone: string, password: string) => {
      if (isPhoneTaken(phone)) {
        throw new Error("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
      }
      const newUser = createUser(name, phone, password);
      setUser(newUser);
    },
    [],
  );

  const login = useCallback((phone: string, password: string): boolean => {
    const found = findUserByPhone(phone);
    if (!found || found.password !== password) return false;
    const { password: _pwd, ...safeUser } = found;
    setUser(safeUser);
    return true;
  }, []);

  // Faqat memory tozalanadi — SQLite dagi ma'lumotlar saqlanadi
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
