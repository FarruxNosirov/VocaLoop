import { getDb } from "./db";

export interface User {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
}

export function createUser(
  name: string,
  phone: string,
  password: string,
): User {
  const db = getDb();
  const createdAt = new Date().toISOString();

  db.runSync(
    "INSERT INTO users (name, phone, password, createdAt) VALUES (?, ?, ?, ?)",
    [name, phone, password, createdAt],
  );

  const user = db.getFirstSync<User>(
    "SELECT id, name, phone, createdAt FROM users ORDER BY id DESC LIMIT 1",
  );
  return user!;
}

export function findUserByPhone(
  phone: string,
): (User & { password: string }) | null {
  const db = getDb();
  return db.getFirstSync<User & { password: string }>(
    "SELECT id, name, phone, password, createdAt FROM users WHERE phone = ? LIMIT 1",
    [phone],
  );
}

export function getFirstUser(): User | null {
  const db = getDb();
  return db.getFirstSync<User>(
    "SELECT id, name, phone, createdAt FROM users LIMIT 1",
  );
}

export function isPhoneTaken(phone: string): boolean {
  const db = getDb();
  const row = db.getFirstSync<{ id: number }>(
    "SELECT id FROM users WHERE phone = ? LIMIT 1",
    [phone],
  );
  return row !== null;
}
