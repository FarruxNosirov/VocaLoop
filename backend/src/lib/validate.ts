// Kiruvchi ma'lumotlarni tekshirish. Xato bo'lsa matn, to'g'ri bo'lsa null qaytaradi.

export function validatePhone(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\+?\d{9,15}$/.test(value.trim())) {
    return "Telefon raqam noto'g'ri";
  }
  return null;
}

export function validatePassword(value: unknown): string | null {
  if (typeof value !== 'string' || value.length < 6) {
    return "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
  }
  if (value.length > 128) {
    return 'Parol juda uzun';
  }
  return null;
}

export function validateName(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return "Ism bo'sh bo'lishi mumkin emas";
  }
  if (value.trim().length > 60) {
    return 'Ism juda uzun';
  }
  return null;
}

/** Matnli maydon: majburiy, maksimal uzunlik bilan */
export function isShortText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}
