/**
 * Serverga ulanish yoqilganmi.
 *
 * false — ilova butunlay telefon xotirasida ishlaydi:
 *   login talab qilinmaydi, hech narsa serverga yuborilmaydi, navbat to'planmaydi.
 *
 * Server paydo bo'lganda:
 *   1) bu qiymatni true qiling
 *   2) .env ga EXPO_PUBLIC_API_URL yozing (yoki services/api.ts dagi manzilni yangilang)
 * Backend kodi va sinxronlash dvigateli joyida turibdi, qayta yozish shart emas.
 */
export const SERVER_ENABLED = false;
