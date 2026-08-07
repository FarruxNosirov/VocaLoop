import * as Crypto from "expo-crypto";

// Parolni hash qilishda qo'llaniladigan statik prefix (brute-force'ni qiyinlashtiradi)
const SALT_PREFIX = "vocaloop_auth_v1_";

/**
 * Parolni SHA-256 orqali hash qiladi.
 * Har doim bir xil parol → bir xil hash (deterministik).
 */
export async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    SALT_PREFIX + password,
  );
}

/**
 * Kiritilgan parol saqlangan hash bilan mos kelishini tekshiradi.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === storedHash;
}
