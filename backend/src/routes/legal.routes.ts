import { Router, Request, Response } from 'express';

const router = Router();

// Aloqa manzili Railway Variables orqali beriladi: CONTACT_EMAIL
function contactHtml(): string {
  const email = process.env.CONTACT_EMAIL;
  return email ? `<a href="mailto:${email}">${email}</a>` : '—';
}
const UPDATED = '2026-09-17';

function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  :root { --bg:#ffffff; --fg:#1a1a2e; --muted:#5c5c70; --accent:#6c5ce7; --line:#e4e4ee; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#12121c; --fg:#ececf4; --muted:#a0a0b4; --accent:#a29bfe; --line:#2a2a3a; }
  }
  body { margin:0; background:var(--bg); color:var(--fg);
         font:16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  main { max-width:720px; margin:0 auto; padding:32px 16px 64px; }
  h1 { color:var(--accent); margin-bottom:4px; }
  h2 { margin-top:32px; border-top:1px solid var(--line); padding-top:24px; }
  h3 { margin-bottom:4px; }
  .muted { color:var(--muted); font-size:14px; }
  a { color:var(--accent); }
  nav a { margin-right:16px; }
</style>
</head>
<body><main>${body}</main></body>
</html>`;
}

router.get('/privacy', (req: Request, res: Response) => {
  res.type('html').send(page('VocaLoop — Maxfiylik siyosati / Privacy Policy', `
<h1>VocaLoop</h1>
<p class="muted">Oxirgi yangilanish / Last updated: ${UPDATED}</p>
<nav><a href="#uz">O'zbekcha</a><a href="#en">English</a></nav>

<h2 id="uz">Maxfiylik siyosati</h2>

<h3>Qanday ma'lumot yig'iladi</h3>
<ul>
  <li><b>Hisob:</b> ismingiz, telefon raqamingiz va parolingiz. Parol shifrlangan (bcrypt) holda saqlanadi, uni hech kim, jumladan biz ham ko'ra olmaymiz.</li>
  <li><b>O'qish ma'lumotlari:</b> tarjima qilgan so'zlaringiz va test natijalaringiz — boshqa qurilmada ham ko'rinishi uchun.</li>
</ul>
<p>Joylashuv, kontaktlar, rasmlar va reklama identifikatorlari yig'ilmaydi. Ilovada reklama va kuzatuv (tracking) yo'q.</p>

<h3>Ma'lumot nima uchun ishlatiladi</h3>
<p>Faqat ilova ishlashi uchun: hisobingizga kirish va o'qish tarixini qurilmalar o'rtasida sinxronlash. Ma'lumotlar sotilmaydi va reklama uchun ishlatilmaydi.</p>

<h3>Uchinchi tomon xizmatlari</h3>
<ul>
  <li><b>Railway</b> — server (hosting).</li>
  <li><b>Supabase</b> — ma'lumotlar bazasi.</li>
  <li><b>Google Translate</b> — tarjima qilish uchun kiritgan matningiz Google'ga yuboriladi.</li>
  <li><b>Google Text-to-Speech</b> — so'z talaffuzi uchun matn Google'ga yuboriladi.</li>
</ul>

<h3>Hisobni o'chirish</h3>
<p>Ilovada: <b>Profil → Hisobni o'chirish</b>. Hisobingiz, so'zlaringiz va test natijalaringiz serverdan darhol va butunlay o'chiriladi.</p>

<h3>Bolalar</h3>
<p>Ilova 13 yoshdan kichik bolalardan ataylab shaxsiy ma'lumot yig'maydi.</p>

<h3>Aloqa</h3>
<p>${contactHtml()}</p>

<h2 id="en">Privacy Policy</h2>

<h3>Information we collect</h3>
<ul>
  <li><b>Account:</b> your name, phone number and password. Passwords are stored hashed (bcrypt) and cannot be read by anyone, including us.</li>
  <li><b>Learning data:</b> words you translate and your quiz results, so they are available on your other devices.</li>
</ul>
<p>We do not collect location, contacts, photos or advertising identifiers. The app contains no ads and no tracking.</p>

<h3>How we use it</h3>
<p>Only to operate the app: signing you in and syncing your learning history between devices. We do not sell your data or use it for advertising.</p>

<h3>Third-party services</h3>
<ul>
  <li><b>Railway</b> — server hosting.</li>
  <li><b>Supabase</b> — database.</li>
  <li><b>Google Translate</b> — text you enter for translation is sent to Google.</li>
  <li><b>Google Text-to-Speech</b> — text is sent to Google to generate pronunciation.</li>
</ul>

<h3>Deleting your account</h3>
<p>In the app: <b>Profile → Delete account</b>. Your account, words and quiz results are permanently deleted from our servers immediately.</p>

<h3>Children</h3>
<p>The app does not knowingly collect personal information from children under 13.</p>

<h3>Contact</h3>
<p>${contactHtml()}</p>
`));
});

export default router;
