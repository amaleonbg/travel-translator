/**
 * Online translation — the optional tier.
 *
 * Deliberately chosen to need **no server of your own and no API key**. The
 * moment this app has a key to protect, it needs a backend to hide the key
 * behind, and the whole no-running-costs design collapses. MyMemory allows
 * cross-origin calls straight from the page, so the phone talks to it directly
 * and there is nothing in the middle to deploy, pay for, or keep patched.
 *
 * What that buys, and what it costs:
 *
 *   + No key, no server, no bill, no spend cap to police.
 *   + Works in a web app, where no on-device engine exists on phones at all.
 *   + Usually better on Bulgarian than the on-device model.
 *   − A daily character allowance, not unlimited.
 *   − The text does leave the device. That is a real privacy change from the
 *     offline path, so the app never does this silently — see `main.js`, which
 *     labels every result with the engine that produced it.
 *
 * If the allowance ever becomes the limiting factor, the upgrade path is one
 * environment variable (`CONTACT_EMAIL` below), not an architecture change.
 */

/**
 * MyMemory raises the daily allowance roughly tenfold if you identify yourself.
 * Left empty by default because an email address baked into a shared app is a
 * spam magnet — set it only for a build you control.
 */
const CONTACT_EMAIL = "";

const ENDPOINT = "https://api.mymemory.translated.net/get";

/** The service rejects anything longer, so we split rather than lose the tail. */
const MAX_CHUNK_BYTES = 480;

export class OnlineTranslationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "OnlineTranslationError";
    this.code = code;
  }
}

/** True when the browser believes there is a connection. Cheap pre-check. */
export function looksOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine !== false;
}

/**
 * Split on sentence boundaries so each request is a complete thought.
 *
 * Cutting mid-sentence would hand the translator half a clause and get back
 * something confidently wrong — worse than a slightly slower answer.
 */
function chunk(text) {
  const encoder = new TextEncoder();
  if (encoder.encode(text).length <= MAX_CHUNK_BYTES) return [text];

  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) || [text];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current + sentence;
    if (encoder.encode(candidate).length > MAX_CHUNK_BYTES && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // A single sentence longer than the limit still has to go somewhere, so fall
  // back to a hard character split for that one case.
  return chunks.flatMap((c) =>
    encoder.encode(c).length <= MAX_CHUNK_BYTES ? [c] : c.match(/.{1,400}/g) || [c]
  );
}

async function translateChunk(text, pair, signal) {
  const params = new URLSearchParams({ q: text, langpair: pair });
  if (CONTACT_EMAIL) params.set("de", CONTACT_EMAIL);

  let response;
  try {
    response = await fetch(`${ENDPOINT}?${params}`, { signal });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new OnlineTranslationError("TIMEOUT", "The online translator did not answer in time.");
    }
    throw new OnlineTranslationError(
      "NETWORK",
      "Could not reach the online translator. Check your connection, or turn the internet option off in Settings to use this phone's own engine."
    );
  }

  if (!response.ok) {
    throw new OnlineTranslationError("HTTP_ERROR", `The online translator returned ${response.status}.`);
  }

  const data = await response.json().catch(() => null);
  if (!data) throw new OnlineTranslationError("BAD_RESPONSE", "The online translator sent something unreadable.");

  // The service answers 200 at the HTTP level and reports real failures in the
  // body, so the status inside the payload is the one that matters.
  if (Number(data.responseStatus) !== 200) {
    const detail = String(data.responseDetails || "");
    if (/quota|limit|exceed/i.test(detail)) {
      throw new OnlineTranslationError(
        "QUOTA_EXCEEDED",
        "The free daily online allowance is used up. It resets tomorrow — until then, turn the internet option off in Settings to use this phone's own engine."
      );
    }
    throw new OnlineTranslationError("SERVICE_ERROR", detail || "The online translator refused the request.");
  }

  const out = String(data?.responseData?.translatedText || "").trim();
  if (!out) throw new OnlineTranslationError("EMPTY", "The online translator returned nothing.");

  // The service sometimes returns its own error text in the translation field.
  if (/^(MYMEMORY WARNING|INVALID|QUERY LENGTH LIMIT)/i.test(out)) {
    throw new OnlineTranslationError("SERVICE_ERROR", out);
  }

  return out;
}

/**
 * Translate via the online service.
 *
 * `timeoutMs` matters more than it looks: someone standing in front of a
 * pharmacist will not wait fifteen seconds, and a request that is going to fail
 * on bad hotel Wi-Fi should fail fast enough to fall back to the on-device
 * engine while they are still holding the phone up.
 */
export async function translateOnline({ text, sourceLanguage, targetLanguage, timeoutMs = 8000 }) {
  const trimmed = String(text || "").trim();
  if (!trimmed) throw new OnlineTranslationError("MISSING_TEXT", "There is nothing to translate.");
  if (!looksOnline()) {
    throw new OnlineTranslationError("OFFLINE", "There is no connection, so the online translator cannot be used.");
  }

  const pair = `${sourceLanguage}|${targetLanguage}`;
  const started = Date.now();

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const pieces = chunk(trimmed);
    const results = [];
    for (const piece of pieces) {
      results.push(await translateChunk(piece, pair, controller?.signal));
    }
    return { text: results.join(" ").trim(), ms: Date.now() - started, engine: "online" };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
