// src/lib/learning/translateLinks.ts (frontend) — pure functions, whitelist the language.
export const GOOGLE_LANGS = ['hi', 'gu', 'mr', 'kn', 'ta', 'te', 'fr', 'es', 'de'] as const;

// Documents: Google's site-translation host pattern. Works in a new tab.
export function googleTranslatedPageUrl(url: string, lang: string): string {
  if (!(GOOGLE_LANGS as readonly string[]).includes(lang)) return url; // en or unknown -> original
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/-/g, '--').replace(/\./g, '-') + '.translate.goog';
    const p = new URLSearchParams(u.search);
    p.set('_x_tr_sl', 'auto');
    p.set('_x_tr_tl', lang);
    p.set('_x_tr_hl', lang);
    p.set('_x_tr_pto', 'wapp');
    return `https://${host}${u.pathname}?${p.toString()}${u.hash}`;
  } catch {
    return url;
  }
}

// Alternate form, offered as "Try another translator view" if the first fails.
export function googleTranslateAltUrl(url: string, lang: string): string {
  return `https://translate.google.com/translate?sl=auto&tl=${lang}&hl=${lang}&u=${encodeURIComponent(url)}`;
}

// Videos: ask YouTube for captions in that language (best effort).
export function ytEmbedSrc(id: string, lang = 'en'): string {
  const base = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  return (GOOGLE_LANGS as readonly string[]).includes(lang)
    ? `${base}&hl=${lang}&cc_load_policy=1&cc_lang_pref=${lang}`
    : base;
}
