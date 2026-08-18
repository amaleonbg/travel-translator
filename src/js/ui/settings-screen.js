/**
 * The Settings screen: language packs, behaviour toggles, an honest capability
 * table, and the delete-everything button.
 *
 * The capability table is the part worth defending. Every offline translator
 * on the stores implies it does everything offline; this one states, per
 * language, what actually works on the phone in the user's hand — checked at
 * runtime, not claimed. Someone about to fly to Sofia deserves to find out
 * that Bulgarian speech will not work here while they still have Wi-Fi and
 * options, not at a pharmacy counter.
 */
import { $, escapeHtml, toast } from "../util.js";
import { LANGUAGES, PIVOT_LANGUAGE, languageLabel } from "../languages.js";
import {
  APPROX_MODEL_MB,
  downloadedLanguages,
  downloadModel,
  deleteModel,
  downloadAllMissing,
  missingLanguages,
  connection,
} from "../engine/models.js";
import { speechSupport } from "../engine/recogniser.js";
import { canSpeak } from "../engine/speaker.js";
import { isNative } from "../engine/platform.js";
import { clearMessages } from "../store/log.js";

let busy = false;

export async function renderModels() {
  const list = $("modelList");
  if (!list) return;

  const have = new Set(await downloadedLanguages());

  list.innerHTML = LANGUAGES.map((lang) => {
    const present = have.has(lang.translate);
    const pivot = lang.translate === PIVOT_LANGUAGE;
    const state = present
      ? `<span class="model-state is-ready">On this phone</span>`
      : `<span class="model-state is-missing">Not downloaded</span>`;
    const action = present
      ? pivot
        ? `<span class="hint">Required</span>`
        : `<button class="btn-secondary btn-danger" type="button" data-delete="${lang.translate}">Remove</button>`
      : `<button class="btn-secondary" type="button" data-download="${lang.translate}">Download</button>`;

    return `
      <div class="model-row">
        <span class="model-name">
          ${lang.flag} ${escapeHtml(lang.label)}
          <span class="model-sub">${escapeHtml(lang.native)} · about ${APPROX_MODEL_MB}&nbsp;MB${
            pivot ? " · used by every other language" : ""
          }</span>
        </span>
        ${state}
        ${action}
      </div>`;
  }).join("");

  const missing = await missingLanguages();
  const btn = $("downloadAllBtn");
  if (btn) {
    btn.disabled = busy || missing.length === 0;
    btn.textContent = missing.length === 0 ? "All packs are on this phone" : `Download ${missing.length} missing pack${missing.length === 1 ? "" : "s"}`;
  }

  if (!isNative()) {
    const status = $("modelStatus");
    if (status) {
      status.textContent =
        "Browser preview — packs only exist on a phone. Here the built-in phrasebook stands in for the engine.";
    }
  }
}

export async function renderCapabilities() {
  const list = $("capabilityList");
  if (!list) return;

  const rows = [];
  for (const lang of LANGUAGES) {
    const [speechState, voice] = await Promise.all([speechSupport(lang.code), canSpeak(lang.code)]);

    const speechText =
      speechState === "yes"
        ? "Speaking works offline"
        : speechState === "pack"
        ? "Speaking needs the offline pack installed"
        : speechState === "no"
        ? "Speaking not available offline on this phone — type instead"
        : "Speaking: not reported by this device, try it";

    rows.push(`
      <div class="capability-row">
        <span class="capability-name">
          ${lang.flag} ${escapeHtml(lang.label)}
          <span class="capability-sub">
            Typing and translation: always offline ·
            ${escapeHtml(speechText)} ·
            ${voice ? "Reading aloud works" : "No voice installed for reading aloud"}
          </span>
        </span>
      </div>`);
  }

  list.innerHTML = rows.join("");
}

export function wireSettings({ onSettingChange, settings }) {
  const autoSpeak = $("autoSpeakToggle");
  const bigText = $("bigTextToggle");
  const testTools = $("testToolsToggle");
  const useInternet = $("useInternetToggle");

  if (autoSpeak) autoSpeak.checked = Boolean(settings.autoSpeak);
  if (bigText) bigText.checked = Boolean(settings.bigText);
  if (testTools) testTools.checked = Boolean(settings.showTestTools);
  if (useInternet) useInternet.checked = Boolean(settings.useInternet);

  useInternet?.addEventListener("change", (e) => onSettingChange({ useInternet: e.target.checked }));
  autoSpeak?.addEventListener("change", (e) => onSettingChange({ autoSpeak: e.target.checked }));
  bigText?.addEventListener("change", (e) => onSettingChange({ bigText: e.target.checked }));
  testTools?.addEventListener("change", (e) => onSettingChange({ showTestTools: e.target.checked }));

  $("modelList")?.addEventListener("click", async (event) => {
    const dl = event.target.closest("[data-download]");
    const rm = event.target.closest("[data-delete]");
    if (!dl && !rm) return;
    if (busy) return;

    busy = true;
    const status = $("modelStatus");
    try {
      if (dl) {
        const code = dl.dataset.download;
        dl.disabled = true;
        if (status) status.textContent = `Downloading ${languageLabel(code)}… this can take a minute.`;
        await downloadModel(code);
        toast(`${languageLabel(code)} is now available offline.`);
      } else {
        const code = rm.dataset.delete;
        const ok = window.confirm(
          `Remove the ${languageLabel(code)} pack? Translation into ${languageLabel(
            code
          )} will stop working until you download it again.`
        );
        if (!ok) return;
        await deleteModel(code);
        toast(`${languageLabel(code)} pack removed.`);
      }
      if (status) status.textContent = "";
    } catch (err) {
      if (status) status.textContent = err.message;
      toast(err.message, 5200);
    } finally {
      busy = false;
      await renderModels();
      await renderCapabilities();
    }
  });

  $("downloadAllBtn")?.addEventListener("click", async () => {
    if (busy) return;
    const status = $("modelStatus");
    const net = await connection();
    if (net.connected && !net.wifi && net.type !== "unknown") {
      const ok = window.confirm(
        "You are not on Wi-Fi. Each pack is around 30 MB. Download over mobile data anyway?"
      );
      if (!ok) return;
    }

    busy = true;
    try {
      const results = await downloadAllMissing(({ code, index, total, state }) => {
        if (!status) return;
        if (state === "downloading") {
          status.textContent = `Downloading ${languageLabel(code)} (${index + 1} of ${total})…`;
        }
      });
      const failed = results.filter((r) => !r.ok);
      if (status) {
        status.textContent = failed.length
          ? `${failed.length} pack${failed.length === 1 ? "" : "s"} failed. ${failed[0].error}`
          : "";
      }
      toast(failed.length ? "Some packs did not download." : "All language packs are ready.");
    } finally {
      busy = false;
      await renderModels();
      await renderCapabilities();
    }
  });

  $("clearLogBtn")?.addEventListener("click", async () => {
    const ok = window.confirm(
      "Delete every message stored on this phone? This cannot be undone."
    );
    if (!ok) return;
    await clearMessages();
    const status = $("clearLogStatus");
    if (status) status.textContent = "All messages deleted.";
    toast("Message log cleared.");
    document.dispatchEvent(new CustomEvent("log:changed"));
  });
}
