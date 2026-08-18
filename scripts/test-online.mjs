/**
 * Tests for the online translation tier, against a stubbed network.
 *
 * This code talks to a third-party service, which means the failure modes that
 * matter are not "does the happy path work" but "what happens when the service
 * answers with something unexpected". That is exactly what cannot be tested by
 * pointing it at the real API and hoping.
 *
 * Every case here is a real behaviour of the MyMemory service: it answers HTTP
 * 200 and reports failures inside the body, it puts warning text in the
 * translation field when it is unhappy, and it caps request length. Each one
 * would otherwise be discovered by a user, mid-sentence, in a pharmacy.
 *
 * Run with the rest: `npm run verify`.
 */
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { translateOnline, OnlineTranslationError } = await import(
  pathToFileURL(join(root, "src/js/engine/online-translator.js")).href
);

const results = { passed: 0, failures: [] };

function check(name, condition, detail = "") {
  if (condition) results.passed += 1;
  else results.failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
}

/** Replace fetch for one call, and record what the module asked for. */
function stubFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push(String(url));
    return handler(String(url), options, calls.length);
  };
  return calls;
}

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

const okBody = (text) => ({ responseData: { translatedText: text, match: 1 }, responseStatus: 200 });

// ---------------------------------------------------------------------------

async function expectError(name, code, fn) {
  try {
    await fn();
    check(name, false, "no error was thrown");
  } catch (err) {
    check(name, err instanceof OnlineTranslationError && err.code === code, `${err.code}: ${err.message}`);
  }
}

// --- the happy path --------------------------------------------------------

{
  const calls = stubFetch(() => jsonResponse(okBody("Къде е най-близката аптека?")));
  const result = await translateOnline({
    text: "Where is the nearest pharmacy?",
    sourceLanguage: "en",
    targetLanguage: "bg",
  });
  check("returns the translated text", result.text === "Къде е най-близката аптека?", result.text);
  check("reports which engine answered", result.engine === "online", result.engine);
  check("measures how long it took", typeof result.ms === "number");
  check("sends the language pair in the documented format", calls[0].includes("langpair=en%7Cbg"), calls[0]);
  check("sends the text", calls[0].includes("q="), calls[0]);
  check("makes exactly one request for a short string", calls.length === 1, `${calls.length}`);
}

// --- the service reporting failure inside a 200 response -------------------

await expectError("a non-200 responseStatus is an error", "SERVICE_ERROR", () => {
  stubFetch(() => jsonResponse({ responseStatus: 403, responseDetails: "INVALID LANGUAGE PAIR" }));
  return translateOnline({ text: "Hello", sourceLanguage: "en", targetLanguage: "bg" });
});

await expectError("a used-up daily allowance is named, not generic", "QUOTA_EXCEEDED", () => {
  stubFetch(() =>
    jsonResponse({ responseStatus: 429, responseDetails: "YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY. QUOTA LIMIT" })
  );
  return translateOnline({ text: "Hello", sourceLanguage: "en", targetLanguage: "bg" });
});

await expectError("warning text in the translation field is not passed off as a translation", "SERVICE_ERROR", () => {
  stubFetch(() => jsonResponse(okBody("MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS")));
  return translateOnline({ text: "Hello", sourceLanguage: "en", targetLanguage: "bg" });
});

await expectError("an empty translation is an error, not an empty message", "EMPTY", () => {
  stubFetch(() => jsonResponse(okBody("   ")));
  return translateOnline({ text: "Hello", sourceLanguage: "en", targetLanguage: "bg" });
});

// --- transport failures ----------------------------------------------------

await expectError("an HTTP error is reported", "HTTP_ERROR", () => {
  stubFetch(() => jsonResponse({}, false, 503));
  return translateOnline({ text: "Hello", sourceLanguage: "en", targetLanguage: "bg" });
});

await expectError("unreadable JSON does not crash the app", "BAD_RESPONSE", () => {
  stubFetch(() => ({ ok: true, status: 200, json: async () => { throw new Error("not json"); } }));
  return translateOnline({ text: "Hello", sourceLanguage: "en", targetLanguage: "bg" });
});

await expectError("a dropped connection gives actionable advice", "NETWORK", () => {
  stubFetch(() => { throw new Error("Failed to fetch"); });
  return translateOnline({ text: "Hello", sourceLanguage: "en", targetLanguage: "bg" });
});

await expectError("a hung request times out rather than hanging forever", "TIMEOUT", () => {
  stubFetch(() => {
    const err = new Error("aborted");
    err.name = "AbortError";
    throw err;
  });
  return translateOnline({ text: "Hello", sourceLanguage: "en", targetLanguage: "bg", timeoutMs: 10 });
});

await expectError("empty input is refused before any request is made", "MISSING_TEXT", () => {
  stubFetch(() => jsonResponse(okBody("x")));
  return translateOnline({ text: "   ", sourceLanguage: "en", targetLanguage: "bg" });
});

// --- long text -------------------------------------------------------------
//
// The service caps a request at 500 bytes. Text longer than that must be split
// on sentence boundaries and rejoined, not truncated — losing the second half
// of someone's message silently is the worst possible failure here.

{
  const sentences = Array.from({ length: 12 }, (_, i) => `This is sentence number ${i} and it is deliberately quite long.`);
  const long = sentences.join(" ");
  const calls = stubFetch((url, _o, n) => jsonResponse(okBody(`part${n}`)));
  const result = await translateOnline({ text: long, sourceLanguage: "en", targetLanguage: "bg" });

  check("long text is split into several requests", calls.length > 1, `${calls.length} requests`);
  check("every part comes back joined", result.text === calls.map((_, i) => `part${i + 1}`).join(" "), result.text);
  check("nothing is silently dropped", result.text.split(" ").length === calls.length, result.text);

  const tooLong = calls.filter((c) => {
    const q = decodeURIComponent(new URL(c).searchParams.get("q") || "");
    return new TextEncoder().encode(q).length > 500;
  });
  check("no single request exceeds the service limit", tooLong.length === 0, `${tooLong.length} oversized`);
}

// A single sentence longer than the cap still has to be sent somehow.
{
  const calls = stubFetch((url, _o, n) => jsonResponse(okBody(`p${n}`)));
  await translateOnline({ text: "x".repeat(1200), sourceLanguage: "en", targetLanguage: "bg" });
  const oversized = calls.filter((c) => {
    const q = decodeURIComponent(new URL(c).searchParams.get("q") || "");
    return new TextEncoder().encode(q).length > 500;
  });
  check("an unbroken run of text is still split safely", oversized.length === 0, `${oversized.length} oversized`);
}

// --- Cyrillic round trip ---------------------------------------------------
//
// Bulgarian is the whole reason this tier exists, and multi-byte characters are
// where naive length maths goes wrong.

{
  const calls = stubFetch(() => jsonResponse(okBody("I need a doctor")));
  const result = await translateOnline({
    text: "Имам нужда от лекар",
    sourceLanguage: "bg",
    targetLanguage: "en",
  });
  check("Bulgarian input survives encoding", result.text === "I need a doctor", result.text);
  check("Cyrillic is URL-encoded correctly", decodeURIComponent(new URL(calls[0]).searchParams.get("q")) === "Имам нужда от лекар");
}

export default results;
