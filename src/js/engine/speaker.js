/**
 * Speech out — the phone reads the translation aloud in the other person's
 * language, using the voices already installed on the device.
 *
 * This is the piece that makes the app work for the person who is *not*
 * holding the phone. Handing a stranger your screen and hoping they read
 * Cyrillic is a worse experience than simply letting the phone say it. It is
 * also the piece most likely to be quietly missing: Android ships with a
 * limited set of Google voices and Bulgarian is often not among them until the
 * user installs it. So we check first and say so, rather than pressing play on
 * silence.
 */
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { isNative, hasPlugin } from "./platform.js";
import { resolveLanguage } from "../languages.js";

export class SpeakError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SpeakError";
    this.code = code;
  }
}

function nativeAvailable() {
  return isNative() && hasPlugin("TextToSpeech");
}

let voiceCache = null;

/**
 * Ask the browser for its voices, waiting if it is not ready yet.
 *
 * `speechSynthesis.getVoices()` returns an EMPTY ARRAY on the first call in
 * Chrome — the list is populated asynchronously and announced by a
 * `voiceschanged` event. Reading it once during start-up therefore reports
 * "this phone has no voices at all", which is wrong on every phone.
 *
 * This cost a real false alarm: the app told a user his phone had no Bulgarian
 * voice when the voice list simply had not arrived yet.
 */
let voicesPromise = null;

function loadWebVoices(timeoutMs = 1500) {
  // Share one wait between callers. The Settings screen asks about four
  // languages in a row; without this, a phone with no speech engine would sit
  // there for four separate timeouts before drawing anything.
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    if (typeof speechSynthesis === "undefined") {
      resolve([]);
      return;
    }

    const immediate = speechSynthesis.getVoices();
    if (immediate.length) {
      resolve(immediate);
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      speechSynthesis.removeEventListener("voiceschanged", finish);
      clearTimeout(timer);
      resolve(speechSynthesis.getVoices());
    };

    speechSynthesis.addEventListener("voiceschanged", finish);
    // A phone that genuinely has no engine never fires the event, so do not
    // wait for ever.
    const timer = setTimeout(finish, timeoutMs);
  });

  return voicesPromise;
}

// If the user installs a voice while the app is open, Android announces it.
// Dropping the cache here means the Settings screen tells the truth on the next
// look, without the user having to restart anything.
if (typeof speechSynthesis !== "undefined" && speechSynthesis.addEventListener) {
  speechSynthesis.addEventListener("voiceschanged", () => {
    if (speechSynthesis.getVoices().length) {
      voiceCache = null;
      voicesPromise = null;
    }
  });
}

export async function supportedVoiceLanguages() {
  // Cache only a USEFUL answer. An empty array is truthy in JavaScript, so the
  // obvious `if (voiceCache)` would lock in the "no voices" answer for the rest
  // of the session — which is exactly the bug this guards against.
  if (voiceCache && voiceCache.length) return voiceCache;

  if (nativeAvailable()) {
    try {
      const { languages } = await TextToSpeech.getSupportedLanguages();
      voiceCache = (languages || []).map(String);
      return voiceCache;
    } catch {
      return [];
    }
  }

  const voices = await loadWebVoices();
  voiceCache = voices.map((v) => v.lang);
  return voiceCache;
}

/** Forget the cached list — used when the user may have installed a voice. */
export function forgetVoices() {
  voiceCache = null;
  voicesPromise = null;
}

/** Is there a voice on this device for this language? */
export async function canSpeak(languageCode) {
  const lang = resolveLanguage(languageCode);
  if (!lang) return false;

  if (nativeAvailable()) {
    try {
      const { supported } = await TextToSpeech.isLanguageSupported({ lang: lang.tts });
      if (supported) return true;
    } catch {
      /* fall through to the list check below */
    }
  }

  const list = await supportedVoiceLanguages();
  const prefix = lang.tts.split("-")[0].toLowerCase();
  return list.some((l) => String(l).toLowerCase().startsWith(prefix));
}

export async function voiceNote(languageCode) {
  const lang = resolveLanguage(languageCode);
  if (await canSpeak(languageCode)) return null;
  return (
    `No ${lang.label} voice is installed on this phone, so it cannot read the translation aloud — ` +
    `the written translation is unaffected. To add one: Settings → Additional settings → ` +
    `Languages & input → Text-to-speech output → the gear beside your engine → Install voice data → ` +
    `${lang.label}. If ${lang.label} is not offered there, no engine on this phone provides it; ` +
    `showing them the screen works just as well.`
  );
}

/**
 * Say it.
 *
 * `rate` defaults slightly below normal. Someone being read a message in their
 * own language by a stranger's phone, in a street, once, needs it slower than
 * a podcast — and slowing it down costs nothing.
 */
export async function speak({ text, languageCode, rate = 0.9, pitch = 1.0 }) {
  const lang = resolveLanguage(languageCode);
  if (!lang) throw new SpeakError("UNSUPPORTED_LANGUAGE", `Unsupported language: ${languageCode}`);

  const trimmed = String(text || "").trim();
  if (!trimmed) throw new SpeakError("MISSING_TEXT", "There is nothing to read aloud.");

  if (!(await canSpeak(lang.code))) {
    throw new SpeakError("NO_VOICE", await voiceNote(lang.code));
  }

  const started = Date.now();

  if (nativeAvailable()) {
    await TextToSpeech.speak({
      text: trimmed,
      lang: lang.tts,
      rate,
      pitch,
      volume: 1.0,
      // `playback` keeps it audible with the phone on silent, which is exactly
      // the situation this feature is used in.
      category: "playback",
    });
    return { ok: true, ms: Date.now() - started, characters: trimmed.length, engine: "native" };
  }

  await speakWeb(trimmed, lang, rate, pitch);
  return { ok: true, ms: Date.now() - started, characters: trimmed.length, engine: "web-speech" };
}

function speakWeb(text, lang, rate, pitch) {
  return new Promise((resolve, reject) => {
    if (typeof speechSynthesis === "undefined") {
      reject(new SpeakError("UNAVAILABLE", "This browser cannot speak text."));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang.tts;
    utterance.rate = rate;
    utterance.pitch = pitch;

    const prefix = lang.tts.split("-")[0].toLowerCase();
    const match = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (match) utterance.voice = match;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new SpeakError("WEB_SPEECH_ERROR", `Could not speak: ${event.error}`));
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  });
}

export async function stopSpeaking() {
  if (nativeAvailable()) {
    try {
      await TextToSpeech.stop();
    } catch {
      /* nothing was playing */
    }
    return;
  }
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}
