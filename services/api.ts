import AsyncStorage from "@react-native-async-storage/async-storage";

// Simulator: localhost, Haqiqiy qurilma: Mac'ning lokal IP'si
const BASE_URL = "https://vocaloop-production.up.railway.app";

const TOKEN_KEY = "auth_token_v1";

// ─── Token boshqaruvi ────────────────────────────────────────────────────────

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── Asosiy so'rov funksiyasi ─────────────────────────────────────────────────

const TIMEOUT_MS = 10_000; // 10 sekund

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message ?? "Server xatosi");
    return data as T;
  } catch (e: any) {
    if (e.name === "AbortError") {
      throw new Error("Server bilan aloqa yo'q (timeout 10s)");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function apiRegister(
  name: string,
  phone: string,
  password: string
): Promise<AuthResponse> {
  // Telefon raqamni email sifatida ishlatamiz
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email: phone, password }),
  });
}

export async function apiLogin(
  phone: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: phone, password }),
  });
}

// ─── User / Profile API ──────────────────────────────────────────────────────

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  password?: string;
}

export async function apiGetProfile(): Promise<AuthUser & { createdAt: string }> {
  return request("/api/user/profile");
}

export async function apiUpdateProfile(
  data: ProfileUpdateData
): Promise<{ message: string; user: AuthUser }> {
  return request("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ─── Words API ───────────────────────────────────────────────────────────────

export async function apiSyncWords(
  words: { original: string; translated: string; time: string }[]
) {
  return request("/api/words/sync", {
    method: "POST",
    body: JSON.stringify({ words }),
  });
}

export async function apiGetWords() {
  return request<{ id: string; original: string; translated: string; time: string }[]>(
    "/api/words"
  );
}
