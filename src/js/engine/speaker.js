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

export async function supportedVoiceLanguages() {
  if (voiceCache) return voiceCache;

  if (nativeAvailable()) {
    try {
      const { languages } = await TextToSpeech.getSupportedLanguages();
      voiceCache = (languages || []).map(String);
      return voiceCache;
    } catch {
      voiceCache = [];
      return voiceCache;
    }
  }

  const voices = typeof speechSynthesis !== "undefined" ? speechSynthesis.getVoices() : [];
  voiceCache = voices.map((v) => v.lang);
  return voiceCache;
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
  return `This phone has no ${lang.label} voice installed, so it cannot read the translation aloud. On Android: Settings → System → Languages & input → Text-to-speech output → install the ${lang.label} voice data. The written translation still works.`;
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
