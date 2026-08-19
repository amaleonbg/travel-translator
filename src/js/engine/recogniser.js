/**
 * Speech in — the phone's own recogniser, not a cloud service.
 *
 * This is the half of the app that cannot be fully offline in all four
 * languages, and the honest handling of that is most of the code here.
 *
 *   English, Spanish, Portuguese  work offline on both platforms.
 *   Bulgarian                     has no on-device recogniser on iPhone at
 *                                 all, and on Android needs the user to have
 *                                 installed the offline pack from the Google
 *                                 app's settings.
 *
 * There is no way around this from JavaScript, and no plugin that changes it —
 * the only alternative is bundling a ~500MB Whisper model. So the app tells
 * the user plainly and steers them to typing, which is always available, always
 * offline and always perfectly accurate. Silently failing to hear Bulgarian
 * would be far worse than saying so up front.
 */
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { isNative, hasPlugin, platform } from "./platform.js";
import { resolveLanguage } from "../languages.js";
import { t } from "../i18n.js";

export class SpeechError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SpeechError";
    this.code = code;
  }
}

function nativeAvailable() {
  return isNative() && hasPlugin("SpeechRecognition");
}

/** Cached so the UI can ask on every language change without a native call. */
let supportedCache = null;

/**
 * The list the platform admits to supporting.
 *
 * Android 13 and newer removed `getSupportedLanguages`, so an empty answer is
 * "would not say", not "supports nothing" — the caller must not treat the two
 * the same.
 */
export async function supportedLanguages() {
  if (supportedCache) return supportedCache;
  if (!nativeAvailable()) {
    supportedCache = { known: false, languages: [] };
    return supportedCache;
  }
  try {
    const { languages } = await SpeechRecognition.getSupportedLanguages();
    const list = (languages || []).map((l) => String(l));
    supportedCache = { known: list.length > 0, languages: list };
  } catch {
    supportedCache = { known: false, languages: [] };
  }
  return supportedCache;
}

/**
 * Can this phone take spoken input in this language, and will it work with no
 * signal? Returns one of:
 *
 *   "yes"      offline speech input should work
 *   "pack"     works only if the user has installed the offline language pack
 *   "no"       this platform has no on-device recogniser for this language
 *   "unknown"  the platform would not say; let the user try
 */
export async function speechSupport(languageCode) {
  const lang = resolveLanguage(languageCode);
  if (!lang) return "no";
  if (!nativeAvailable()) return "unknown";

  const os = platform();
  const declared = lang.offlineSpeech?.[os];

  const { known, languages } = await supportedLanguages();
  if (known) {
    const prefix = lang.stt.split("-")[0].toLowerCase();
    const listed = languages.some((l) => String(l).toLowerCase().startsWith(prefix));
    if (!listed) return declared === false ? "no" : "no";
    return declared === "pack" ? "pack" : "yes";
  }

  if (declared === false) return "no";
  if (declared === "pack") return "pack";
  if (declared === true) return "yes";
  return "unknown";
}

/** A sentence the UI can show verbatim next to the record button. */
export async function speechSupportNote(languageCode) {
  const lang = resolveLanguage(languageCode);
  const support = await speechSupport(languageCode);
  switch (support) {
    case "yes":
      return { support, note: t("speech.offlineOk", { lang: lang.label }) };
    case "pack":
      // The important half of this sentence is the first half. Android falls
      // back to Google's online recogniser automatically, so speaking Bulgarian
      // works right now, with a connection — the earlier wording implied it did
      // not, which sent people to typing unnecessarily.
      return {
        support,
        note: t("speech.needsPack", { lang: lang.label }),
      };
    case "no":
      return {
        support,
        note: t("speech.needsInternet", { lang: lang.label }),
      };
    default:
      return { support, note: "" };
  }
}

export async function checkPermission() {
  if (!nativeAvailable()) return "granted";
  try {
    const status = await SpeechRecognition.checkPermissions();
    return status?.speechRecognition || "prompt";
  } catch {
    return "prompt";
  }
}

export async function requestPermission() {
  if (!nativeAvailable()) return "granted";
  try {
    const status = await SpeechRecognition.requestPermissions();
    return status?.speechRecognition || "denied";
  } catch {
    return "denied";
  }
}

/**
 * Listen, and resolve with what was heard.
 *
 * `onPartial` fires as the recogniser refines its guess. Showing that live is
 * not decoration: it is the only feedback that the microphone is working at
 * all, and without it a user in a noisy street cannot tell a quiet phone from
 * a broken one.
 */
export async function listen({ languageCode, onPartial = () => {}, maxResults = 3 } = {}) {
  const lang = resolveLanguage(languageCode);
  if (!lang) throw new SpeechError("UNSUPPORTED_LANGUAGE", `Unsupported language: ${languageCode}`);

  if (nativeAvailable()) return listenNative(lang, onPartial, maxResults);
  return listenWeb(lang, onPartial);
}

async function listenNative(lang, onPartial, maxResults) {
  const permission = await checkPermission();
  if (permission !== "granted") {
    const asked = await requestPermission();
    if (asked !== "granted") {
      throw new SpeechError(
        "PERMISSION_DENIED",
        t("err.micDenied")
      );
    }
  }

  const available = await SpeechRecognition.available().catch(() => ({ available: false }));
  if (!available?.available) {
    throw new SpeechError("UNAVAILABLE", t("err.noRecogniser"));
  }

  let partialHandle = null;
  try {
    partialHandle = await SpeechRecognition.addListener("partialResults", (data) => {
      const first = data?.matches?.[0];
      if (first) onPartial(first);
    });

    const result = await SpeechRecognition.start({
      language: lang.stt,
      maxResults,
      partialResults: true,
      // Android's popup dialog blocks partial results and takes over the
      // screen. Doing it in-app keeps the live transcript, which is the whole
      // point of the feedback above.
      popup: false,
    });

    const matches = result?.matches || [];
    const transcript = String(matches[0] || "").trim();
    if (!transcript) {
      throw new SpeechError("NO_SPEECH_DETECTED", t("err.noSpeech"));
    }
    return { transcript, alternatives: matches.slice(1), engine: "native" };
  } finally {
    try {
      await partialHandle?.remove();
    } catch {
      /* a listener that will not detach must not mask the real result */
    }
  }
}

/** Browser preview, via the Web Speech API where the browser has one. */
function listenWeb(lang, onPartial) {
  const Ctor =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!Ctor) {
    return Promise.reject(
      new SpeechError(
        "UNAVAILABLE",
        "This browser has no speech recognition. Use the Text option, or run the app on a phone."
      )
    );
  }

  return new Promise((resolve, reject) => {
    const recogniser = new Ctor();
    recogniser.lang = lang.stt;
    recogniser.interimResults = true;
    recogniser.maxAlternatives = 3;
    let finalText = "";

    recogniser.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      onPartial((finalText + interim).trim());
    };
    recogniser.onerror = (event) => {
      reject(new SpeechError("WEB_SPEECH_ERROR", `Speech recognition failed: ${event.error}`));
    };
    recogniser.onend = () => {
      const transcript = finalText.trim();
      if (!transcript) {
        reject(new SpeechError("NO_SPEECH_DETECTED", t("err.noSpeech")));
        return;
      }
      resolve({ transcript, alternatives: [], engine: "web-speech" });
    };

    activeWebRecogniser = recogniser;
    recogniser.start();
  });
}

let activeWebRecogniser = null;

export async function stopListening() {
  if (nativeAvailable()) {
    try {
      await SpeechRecognition.stop();
    } catch {
      /* stopping something already stopped is not an error worth surfacing */
    }
    return;
  }
  try {
    activeWebRecogniser?.stop();
  } catch {
    /* same */
  }
}

export async function isListening() {
  if (!nativeAvailable()) return Boolean(activeWebRecogniser);
  try {
    const { listening } = await SpeechRecognition.isListening();
    return Boolean(listening);
  } catch {
    return false;
  }
}
