/**
 * The four supported languages — one source of truth for the whole app.
 *
 * Four separate code fields, because the three engines genuinely disagree and
 * a single shared field would hide that:
 *
 *   `code`      what this app uses internally and stores in the log.
 *   `translate` what ML Kit's offline translator expects (2-letter, no region).
 *   `stt`       what the speech recogniser expects (BCP-47, with region).
 *   `tts`       what the speech synthesiser expects. Same shape as `stt`, but
 *               kept separate: a phone can have a voice for a locale it cannot
 *               transcribe, and vice versa. Bulgarian is exactly that case.
 *
 * `offlineSpeech` is the honest answer to "can this phone transcribe this
 * language with no signal?" — see engine/recogniser.js, which verifies it at
 * runtime rather than trusting this table. The table is the fallback for when
 * the platform will not tell us (Android 13+ removed getSupportedLanguages).
 */
export const LANGUAGES = [
  {
    code: "en",
    translate: "en",
    stt: "en-GB",
    tts: "en-GB",
    label: "English",
    native: "English",
    flag: "🇬🇧",
    offlineSpeech: { android: true, ios: true },
  },
  {
    code: "bg",
    translate: "bg",
    stt: "bg-BG",
    tts: "bg-BG",
    label: "Bulgarian",
    native: "Български",
    flag: "🇧🇬",
    // Apple's on-device recogniser covers roughly 22 locales and Bulgarian is
    // not among them. Android's offline pack exists but is not installed by
    // default. Neither is a bug in this app, and neither can be worked around
    // from JavaScript — so the UI says so plainly instead of failing silently.
    offlineSpeech: { android: "pack", ios: false },
  },
  {
    code: "pt",
    translate: "pt",
    stt: "pt-PT",
    tts: "pt-PT",
    label: "Portuguese",
    native: "Português",
    flag: "🇵🇹",
    offlineSpeech: { android: true, ios: true },
  },
  {
    code: "es",
    translate: "es",
    stt: "es-ES",
    tts: "es-ES",
    label: "Spanish",
    native: "Español",
    flag: "🇪🇸",
    offlineSpeech: { android: true, ios: true },
  },
];

/**
 * ML Kit always pivots through English internally: translating Bulgarian to
 * Portuguese is really bg->en->pt. The English model is therefore required for
 * every pair, not just the pairs that mention English, and the model manager
 * treats it as non-deletable for that reason.
 */
export const PIVOT_LANGUAGE = "en";

const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

/** Accepts "bg", "bg-BG", "BG", "pt-BR" — returns the record or null. */
export function resolveLanguage(input) {
  if (!input || typeof input !== "string") return null;
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  const direct = BY_CODE.get(raw);
  if (direct) return direct;
  const base = raw.split("-")[0];
  return BY_CODE.get(base) || null;
}

export function languageLabel(code) {
  return BY_CODE.get(code)?.label || code || "—";
}

export function languageNative(code) {
  return BY_CODE.get(code)?.native || languageLabel(code);
}

export function languageFlag(code) {
  return BY_CODE.get(code)?.flag || "";
}

export function supportedCodes() {
  return LANGUAGES.map((l) => l.code);
}
