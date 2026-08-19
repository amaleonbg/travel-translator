/**
 * Small, durable preferences — the language pair, the two modes, whether the
 * first-run model prompt has been shown.
 *
 * Capacitor Preferences on a phone (survives app updates and is backed by the
 * platform's own key-value store), localStorage in the browser preview. Kept
 * separate from the message log deliberately: settings are tiny and read on
 * every screen, the log is large and read on one.
 */
import { Preferences } from "@capacitor/preferences";
import { isNative, hasPlugin } from "../engine/platform.js";

const KEY = "settings.v1";

export const DEFAULTS = {
  sourceLanguage: "en",
  targetLanguage: "bg",
  activeMode: "audio",
  passiveMode: "text",
  autoDetect: false,
  autoSpeak: true,
  bigText: false,
  modelPromptSeen: false,
  showTestTools: true,
  // null means "not chosen yet" — the first run guesses from the phone.
  uiLanguage: null,
  // Overridden per platform below — see internetDefault().
  useInternet: false,
};

/**
 * Whether to allow the online translator by default.
 *
 * The two builds want opposite answers, and defaulting both the same way would
 * be wrong for one of them:
 *
 *   Installed Android app — default OFF. It has a real on-device engine, and
 *   offline-first is the whole point. Sending text to a third party should be
 *   a choice the user makes, not one they discover.
 *
 *   Web app — default ON. No phone browser has an on-device translation engine
 *   (Chrome's built-in Translator API is desktop-only), so with this off the
 *   web version can only offer the built-in phrases. Defaulting it off would
 *   present a translator that cannot translate.
 */
export function internetDefault() {
  return !isNative();
}

function usePreferences() {
  return isNative() && hasPlugin("Preferences");
}

let cache = null;

export async function loadSettings() {
  if (cache) return cache;
  let raw = null;
  try {
    if (usePreferences()) {
      const { value } = await Preferences.get({ key: KEY });
      raw = value;
    } else if (typeof localStorage !== "undefined") {
      raw = localStorage.getItem(KEY);
    }
  } catch {
    raw = null;
  }

  let parsed = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    // A corrupt settings blob must not stop the app opening. Falling back to
    // defaults loses a preference; throwing here would lose the whole app.
    parsed = {};
  }

  // The platform default only applies on first run. Once the user has made a
  // choice it is theirs, and a later app update must not quietly flip it back.
  const platformDefaults = { ...DEFAULTS, useInternet: internetDefault() };
  cache = { ...platformDefaults, ...parsed };
  return cache;
}

export async function saveSettings(patch) {
  const current = await loadSettings();
  cache = { ...current, ...patch };
  const serialised = JSON.stringify(cache);
  try {
    if (usePreferences()) await Preferences.set({ key: KEY, value: serialised });
    else if (typeof localStorage !== "undefined") localStorage.setItem(KEY, serialised);
  } catch {
    /* an unwritable store is a lost preference, not a lost session */
  }
  return cache;
}

export function currentSettings() {
  return cache || { ...DEFAULTS };
}
