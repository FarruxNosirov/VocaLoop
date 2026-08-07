export interface Word {
  id: string;
  original: string;
  translated: string;
  time: string;
  fromLangCode?: string; // tarjima qilingan paytdagi manba til kodi
  toLangCode?: string;   // tarjima qilingan paytdagi maqsad til kodi
}
