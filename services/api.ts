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
    if (!res.ok) {
      const err = new ApiError(data?.message ?? "Server xatosi", res.status);
      throw err;
    }
    return data as T;
  } catch (e: any) {
    if (e.name === "AbortError") {
      throw new ApiError("Server bilan aloqa yo'q (timeout 10s)", 0);
    }
    // Tarmoq xatosi (fetch failed) — status 0
    if (!(e instanceof ApiError)) {
      throw new ApiError(e?.message ?? "Tarmoq xatosi", 0);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** status 0 = tarmoq muammosi (qayta urinish mumkin), 4xx/5xx = server javobi */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Xato tarmoq sababli bo'lganmi? (offline → navbatda qoldiramiz) */
export function isNetworkError(e: unknown): boolean {
  return e instanceof ApiError && e.status === 0;
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

export interface ApiWord {
  clientId: string;
  original: string;
  translated: string;
  time: string;
  date: string;
  fromLangCode?: string;
  toLangCode?: string;
}

export async function apiSyncWords(words: ApiWord[]) {
  return request<{ synced: number }>("/api/words/sync", {
    method: "POST",
    body: JSON.stringify({ words }),
  });
}

export async function apiGetWords(): Promise<ApiWord[]> {
  return request<ApiWord[]>("/api/words");
}

export async function apiDeleteWord(clientId: string) {
  return request<{ message: string }>(`/api/words/${clientId}`, {
    method: "DELETE",
  });
}

// ─── Quiz API ────────────────────────────────────────────────────────────────

export interface ApiQuizResult {
  bookId: string;
  unitNum: number;
  correct: number;
  total: number;
  coins: number;
  completedAt: string;
}

export async function apiSyncQuizResults(results: ApiQuizResult[]) {
  return request<{ synced: number }>("/api/quiz/sync", {
    method: "POST",
    body: JSON.stringify({ results }),
  });
}

export async function apiGetQuizResults(): Promise<ApiQuizResult[]> {
  return request<ApiQuizResult[]>("/api/quiz/results");
}
