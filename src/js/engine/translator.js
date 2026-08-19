/**
 * Offline translation.
 *
 * On a phone this is Google's ML Kit, running entirely on the device against
 * models downloaded once over Wi-Fi. Nothing is sent anywhere — there is no
 * server in this app, no API key, and no per-message cost. That is the whole
 * point of the design.
 *
 * On a laptop there is no ML Kit, so the browser preview answers from the
 * built-in phrasebook and marks every result `preview: true`. Displaying an
 * unmarked preview translation as though the real engine produced it would
 * make the browser build actively misleading, so the flag is threaded all the
 * way through to the UI rather than being swallowed here.
 */
import { Translation, Language } from "@capacitor-mlkit/translation";
import { LanguageIdentification } from "@capacitor-mlkit/language-identification";
import { isNative, hasPlugin } from "./platform.js";
import { translateOnline, looksOnline, OnlineTranslationError } from "./online-translator.js";
import { lookup } from "../data/phrasebook.js";
import { resolveLanguage } from "../languages.js";
import { t } from "../i18n.js";

/**
 * Whether the user has allowed the internet tier.
 *
 * Injected rather than imported from the settings store, so this module stays
 * free of any dependency on how settings happen to be persisted, and so the
 * tests can drive it directly.
 */
let allowInternet = false;

export function setAllowInternet(value) {
  allowInternet = Boolean(value);
}

export function internetAllowed() {
  return allowInternet;
}

/**
 * The order the engines are tried in, and why.
 *
 * On a phone with the app installed natively, on-device comes first: it is
 * instant, free, private, and works with no signal. The internet tier is a
 * deliberate opt-in that trades those four properties for better output —
 * mostly on Bulgarian, where the on-device model is weakest.
 *
 * In a web app there is no on-device engine at all. Google's built-in browser
 * Translator API exists only on desktop Chrome, not on any phone, so a phone
 * browser has nothing to fall back to except the built-in phrasebook. That is
 * the whole reason the internet tier exists.
 */
function engineOrder() {
  const onDevice = isNative() && hasPlugin("Translation");
  const online = allowInternet && looksOnline();

  if (onDevice && online) return ["online", "mlkit", "phrasebook"];
  if (onDevice) return ["mlkit", "phrasebook"];
  if (online) return ["online", "phrasebook"];
  return ["phrasebook"];
}

export class TranslationError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = "TranslationError";
    this.code = code;
    this.details = details;
  }
}

/** Is the on-device engine present? Used by the UI to explain what is possible. */
export function onDeviceAvailable() {
  return isNative() && hasPlugin("Translation");
}

/**
 * Translate one string.
 *
 * Returns `{ text, ms, preview, engine }`. `ms` is measured here rather than
 * reported by the plugin, because how long the phone actually took is the
 * number worth showing a user waiting for it.
 */
export async function translate({ text, sourceLanguage, targetLanguage }) {
  const source = resolveLanguage(sourceLanguage);
  const target = resolveLanguage(targetLanguage);

  if (!source) throw new TranslationError("UNSUPPORTED_SOURCE_LANGUAGE", `Unsupported source language: ${sourceLanguage}`);
  if (!target) throw new TranslationError("UNSUPPORTED_TARGET_LANGUAGE", `Unsupported target language: ${targetLanguage}`);

  const trimmed = String(text || "").trim();
  if (!trimmed) throw new TranslationError("MISSING_TEXT", "There is nothing to translate.");

  // Same language in and out: skip the engine entirely. Not an optimisation so
  // much as correctness — ML Kit rejects a same-language pair.
  if (source.code === target.code) {
    return { text: trimmed, ms: 0, preview: false, offline: true, engine: "passthrough", skipped: true };
  }

  const started = Date.now();
  const attempts = [];

  // Try each tier in turn. A tier that fails is recorded and the next is tried,
  // because a translation from a second-choice engine is enormously better than
  // an error message to someone standing in a pharmacy.
  for (const tier of engineOrder()) {
    try {
      if (tier === "online") {
        const result = await translateOnline({
          text: trimmed,
          sourceLanguage: source.translate,
          targetLanguage: target.translate,
        });
        return {
          text: result.text,
          ms: Date.now() - started,
          preview: false,
          offline: false,
          engine: "online",
          skipped: false,
          attempts,
        };
      }

      if (tier === "mlkit") {
        const result = await Translation.translate({
          text: trimmed,
          sourceLanguage: source.translate,
          targetLanguage: target.translate,
        });
        const out = String(result?.text || "").trim();
        if (!out) throw new Error("The on-device translator returned nothing.");
        return {
          text: out,
          ms: Date.now() - started,
          preview: false,
          offline: true,
          engine: "mlkit",
          skipped: false,
          attempts,
        };
      }

      // phrasebook
      const hit = lookup(trimmed, source.code);
      if (hit) {
        return {
          text: hit[target.code],
          ms: Date.now() - started,
          preview: !isNative(),
          offline: true,
          engine: "phrasebook",
          skipped: false,
          attempts,
        };
      }
      throw new Error("Not one of the built-in phrases.");
    } catch (err) {
      attempts.push({ tier, error: err?.message || String(err) });
    }
  }

  // Everything failed. The message has to tell the user which lever to pull,
  // because "translation failed" on its own is useless to someone who cannot
  // see which engines were even tried.
  throw new TranslationError(
    classifyFailure(attempts),
    failureMessage(attempts, target),
    attempts.map((a) => `${a.tier}: ${a.error}`).join(" | ")
  );
}

function classifyFailure(attempts) {
  const online = attempts.find((a) => a.tier === "online");
  const mlkit = attempts.find((a) => a.tier === "mlkit");
  if (mlkit && /model|download|not\s*downloaded/i.test(mlkit.error)) return "MODEL_NOT_DOWNLOADED";
  if (online && /quota|allowance/i.test(online.error)) return "QUOTA_EXCEEDED";
  if (attempts.every((a) => a.tier === "phrasebook")) return "NO_ENGINE_AVAILABLE";
  return "TRANSLATE_FAILED";
}

function failureMessage(attempts, target) {
  const code = classifyFailure(attempts);

  if (code === "MODEL_NOT_DOWNLOADED") {
    return `The offline language pack for ${target.label} is not on this phone yet. Open Settings and download it — you need Wi-Fi once, then it works anywhere.`;
  }
  if (code === "QUOTA_EXCEEDED") {
    return attempts.find((a) => a.tier === "online").error;
  }
  if (code === "NO_ENGINE_AVAILABLE") {
    return isNative()
      ? "No translation engine is available. Download the language packs in Settings."
      : t("err.noEngineWeb");
  }
  return `Translation failed. ${attempts.map((a) => a.error).join(" ")}`;
}

/**
 * Forward translation plus a translation of the result back into the sender's
 * own language.
 *
 * The back-translation is the single most useful thing this app does. A
 * traveller cannot judge whether the Bulgarian they are about to show a
 * pharmacist says what they meant — but they can absolutely judge whether the
 * English it turns back into still says it. Two cheap calls buy a check that
 * would otherwise need a second human.
 */
export async function translateAndVerify({ text, sourceLanguage, targetLanguage }) {
  const forward = await translate({ text, sourceLanguage, targetLanguage });
  let back = null;
  try {
    back = await translate({
      text: forward.text,
      sourceLanguage: targetLanguage,
      targetLanguage: sourceLanguage,
    });
  } catch (err) {
    // A failed back-translation must not cost the user their translation. Show
    // the forward result and say the check could not be run.
    back = { text: null, ms: null, preview: forward.preview, engine: "failed", error: err.message };
  }

  return {
    ok: true,
    translated: forward.text,
    backTranslation: back?.text ?? null,
    translateMs: forward.ms,
    backTranslateMs: back?.ms ?? null,
    totalMs: (forward.ms || 0) + (back?.ms || 0),
    preview: forward.preview,
    offline: forward.offline,
    engine: forward.engine,
    skipped: forward.skipped,
    backError: back?.error || null,
  };
}

/**
 * A short, honest label for where a translation came from.
 *
 * This is shown on every result, and it is not decoration. "Translated on this
 * phone" and "Translated over the internet" have different privacy meanings,
 * and the user is entitled to know which one just happened to a sentence about
 * their medical history.
 */
export function engineLabel(engine) {
  switch (engine) {
    case "mlkit":
      return t("engine.onDevice");
    case "online":
      return t("engine.online");
    case "phrasebook":
      return t("engine.phrasebook");
    case "passthrough":
      return t("engine.passthrough");
    default:
      return "";
  }
}

/**
 * Which of our four languages does this text look like?
 *
 * Offline, via ML Kit's language identification model — a separate, much
 * smaller model than the translation ones. Returns `null` rather than
 * guessing when it is not confident or the answer is outside our four, because
 * a confidently wrong source language produces confidently wrong output.
 */
export async function identifyLanguage(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;

  if (isNative() && hasPlugin("LanguageIdentification")) {
    try {
      const { language } = await LanguageIdentification.identifyLanguage({
        text: trimmed,
        confidenceThreshold: 0.5,
      });
      if (!language || language === "und") return null;
      return resolveLanguage(language)?.code ?? null;
    } catch {
      return null;
    }
  }

  // Browser preview: Cyrillic is unambiguous among our four, which covers the
  // case that actually matters (is this Bulgarian or is it not?).
  if (/[\u0400-\u04FF]/.test(trimmed)) return "bg";
  const hit = lookup(trimmed, "en") ? "en" : lookup(trimmed, "pt") ? "pt" : lookup(trimmed, "es") ? "es" : null;
  return hit;
}

export { Language as MLKitLanguage };
