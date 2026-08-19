/**
 * The offline language packs.
 *
 * This is the one screen that has to be understood before the app is trusted,
 * so it is worth being blunt about the model here: the app works with no
 * signal *because* the packs were downloaded when there was one. A traveller
 * who lands in Sofia having never opened Settings has an app that cannot
 * translate, and the failure would look like a bug rather than a missing
 * download. So the app checks on first run and asks, rather than waiting to
 * fail at a pharmacy counter.
 *
 * ML Kit pivots every pair through English internally — Bulgarian to
 * Portuguese is really bg→en→pt — so the English pack is required for every
 * combination and is treated as non-removable.
 */
import { Translation } from "@capacitor-mlkit/translation";
import { Network } from "@capacitor/network";
import { isNative, hasPlugin } from "./platform.js";
import { LANGUAGES, PIVOT_LANGUAGE } from "../languages.js";
import { t } from "../i18n.js";

/** Roughly what each pack costs on disk. ML Kit's own documented figure. */
export const APPROX_MODEL_MB = 30;

function available() {
  return isNative() && hasPlugin("Translation");
}

/**
 * Which packs are on this phone right now.
 *
 * In the browser preview every pack reports as present: the preview translator
 * is the phrasebook, which needs no download, and showing four "not
 * downloaded" rows on a laptop would only teach the wrong lesson about what
 * the screen means.
 */
export async function downloadedLanguages() {
  if (!available()) return LANGUAGES.map((l) => l.translate);
  try {
    const { languages } = await Translation.getDownloadedModels();
    return Array.isArray(languages) ? languages : [];
  } catch {
    return [];
  }
}

export async function isDownloaded(code) {
  const list = await downloadedLanguages();
  return list.includes(code);
}

/** Every pack the app needs for full four-language cover, English included. */
export function requiredLanguages() {
  const codes = LANGUAGES.map((l) => l.translate);
  return codes.includes(PIVOT_LANGUAGE) ? codes : [PIVOT_LANGUAGE, ...codes];
}

export async function missingLanguages() {
  const have = new Set(await downloadedLanguages());
  return requiredLanguages().filter((c) => !have.has(c));
}

/** Is there a connection at all, and is it the kind you want a 30MB download on? */
export async function connection() {
  if (!isNative() || !hasPlugin("Network")) {
    const online = typeof navigator === "undefined" ? true : navigator.onLine !== false;
    return { connected: online, type: online ? "unknown" : "none", wifi: false };
  }
  try {
    const status = await Network.getStatus();
    return {
      connected: Boolean(status.connected),
      type: status.connectionType || "unknown",
      wifi: status.connectionType === "wifi",
    };
  } catch {
    return { connected: true, type: "unknown", wifi: false };
  }
}

export class ModelError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ModelError";
    this.code = code;
  }
}

/**
 * Download one pack.
 *
 * The plugin gives no progress events, so the UI shows an indeterminate state
 * rather than a fake percentage. A progress bar that is invented rather than
 * measured is worse than none: it teaches the user to distrust the next one.
 */
export async function downloadModel(code) {
  if (!available()) {
    throw new ModelError("NOT_NATIVE", "Language packs only exist on a phone. The browser preview uses the built-in phrasebook.");
  }
  const net = await connection();
  if (!net.connected) {
    throw new ModelError(
      "OFFLINE",
      t("models.offline")
    );
  }
  try {
    await Translation.downloadModel({ language: code });
    return { ok: true, language: code };
  } catch (err) {
    throw new ModelError("DOWNLOAD_FAILED", `Could not download the ${code} pack: ${err?.message || err}`);
  }
}

export async function deleteModel(code) {
  if (!available()) throw new ModelError("NOT_NATIVE", "Nothing to delete in the browser preview.");
  if (code === PIVOT_LANGUAGE) {
    throw new ModelError(
      "PIVOT_REQUIRED",
      t("models.pivotRequired")
    );
  }
  try {
    await Translation.deleteDownloadedModel({ language: code });
    return { ok: true, language: code };
  } catch (err) {
    throw new ModelError("DELETE_FAILED", `Could not delete the ${code} pack: ${err?.message || err}`);
  }
}

/** Download everything missing, one at a time, reporting as it goes. */
export async function downloadAllMissing(onProgress = () => {}) {
  const missing = await missingLanguages();
  const results = [];
  for (let i = 0; i < missing.length; i += 1) {
    const code = missing[i];
    onProgress({ code, index: i, total: missing.length, state: "downloading" });
    try {
      await downloadModel(code);
      results.push({ code, ok: true });
      onProgress({ code, index: i, total: missing.length, state: "done" });
    } catch (err) {
      results.push({ code, ok: false, error: err.message });
      onProgress({ code, index: i, total: missing.length, state: "failed", error: err.message });
    }
  }
  return results;
}
