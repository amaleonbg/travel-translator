/**
 * Travel Translator — main controller.
 *
 * The flow is deliberately three steps rather than one:
 *
 *   compose   speak or type, in your own language
 *   check     read the translation AND the translation of the translation,
 *             then fix the wording if the meaning drifted
 *   show      hand the phone over, or let it speak
 *
 * A one-tap "translate and show" would be faster and worse. The person you are
 * showing it to cannot tell you the translation was wrong — they can only act
 * on it. The check step is the only thing standing between a bad translation
 * and a stranger acting on it, and it costs one tap.
 */
import { LANGUAGES, languageLabel, languageNative, resolveLanguage } from "./languages.js";
import { UI_LANGUAGES, t, setUiLanguage, applyTranslations, deviceLanguage, uiLanguage } from "./i18n.js";
import { ACTIVE_MODES, PASSIVE_MODES, describeExchange } from "./modes.js";
import { environmentLabel, isNative, platform } from "./engine/platform.js";
import {
  translateAndVerify,
  identifyLanguage,
  setAllowInternet,
  onDeviceAvailable,
  engineLabel,
  TranslationError,
} from "./engine/translator.js";
import { looksOnline } from "./engine/online-translator.js";
import { listen, stopListening, speechSupportNote, SpeechError } from "./engine/recogniser.js";
import { speak, stopSpeaking, canSpeak } from "./engine/speaker.js";
import { missingLanguages } from "./engine/models.js";
import { loadSettings, saveSettings } from "./store/settings.js";
import { addMessage, rateMessage } from "./store/log.js";
import { refreshLog, wireLogTable } from "./ui/logtable.js";
import { initPhrasebook, renderPhrases } from "./ui/phrasebook.js";
import { renderModels, renderCapabilities, wireSettings } from "./ui/settings-screen.js";
import {
  $,
  show,
  toast,
  formatMs,
  formatClock,
  meaningOverlap,
  copyText,
} from "./util.js";

const els = {};
const IDS = [
  "envChip", "offlineChip", "installBtn", "iosInstallTip", "dismissTipBtn",
  "modelBanner", "modelBannerText", "modelBannerBtn", "modelBannerDismiss",
  "activeMode", "passiveMode", "sourceLang", "targetLang", "swapBtn", "autoDetect",
  "speechNote", "audioInput", "recordBtn", "recordLabel", "timer", "partialText",
  "textInput", "typedMessage", "typedCount", "composeBtn", "labelRow", "clientLabel",
  "statusMsg",
  "reviewCard", "reviewConfidence", "reviewUncertain", "reviewUncertainText",
  "editableText", "editableHint", "verifyBtn", "cancelReviewBtn", "verifyStatus",
  "verifyPanes", "verifyTargetHead", "verifyTargetTag", "verifyTranslated",
  "verifyBackTag", "verifyBack", "sendRow", "sendBtn", "sendHint",
  "resultCard", "bigTextBtn", "deliveryBanner", "deliveryText", "audioOut", "replayBtn",
  "ttsMeta", "uncertainBanner", "uncertainText", "originalLangTag", "originalText",
  "translatedLangTag", "translatedText", "engineNote",
  "useInternetToggle", "useInternetHint", "internetNote", "uiLang",
  "meaningValue", "meaningBar", "confidenceValue", "confidenceBar",
  "sttMs", "translateMs", "totalMs", "audioSeconds", "detectedLang",
  "ratingButtons", "ratingSaved", "newMessageBtn",
  "bigTextOverlay", "bigTextClose", "bigTextLang", "bigTextBody", "bigSpeakBtn",
];

const state = {
  settings: null,
  recording: false,
  timerHandle: null,
  recordStartedAt: 0,
  /** What was composed and is awaiting the check step. */
  pending: null,
  /** The result of the check step. */
  verified: null,
  lastMessageId: null,
  deferredInstallPrompt: null,
};

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

async function boot() {
  for (const id of IDS) els[id] = $(id);

  state.settings = await loadSettings();
  setAllowInternet(state.settings.useInternet);

  // Interface language first: everything drawn below depends on it.
  setUiLanguage(state.settings.uiLanguage || deviceLanguage());
  buildUiLanguagePicker();
  applyTranslations();

  buildPickers();
  applySettingsToUi();
  wireEverything();

  els.envChip.textContent = isNative() ? environmentLabel() : t("chip.browserPreview");
  els.envChip.classList.toggle("chip-warn", !isNative());
  refreshModeChip();
  window.addEventListener("online", refreshModeChip);
  window.addEventListener("offline", refreshModeChip);

  await Promise.all([refreshLog(), renderModels(), renderCapabilities()]);
  renderPhrases("");
  await refreshSpeechNote();
  await checkLanguagePacks();
  registerServiceWorker();
}

function buildPickers() {
  rebuildModePickers();
  rebuildLanguagePickers();
}

/**
 * The two language dropdowns.
 *
 * Each option leads with the language's own name — a Bulgarian speaker scans
 * for "Български", not for a translated word — and follows it with the name in
 * whatever interface language is active, so the list is still readable to
 * someone who does not know the script.
 */
function rebuildLanguagePickers() {
  const source = els.sourceLang.value || state.settings.sourceLanguage;
  const target = els.targetLang.value || state.settings.targetLanguage;
  els.sourceLang.innerHTML = "";
  els.targetLang.innerHTML = "";
  for (const lang of LANGUAGES) {
    const inUiLanguage = languageLabel(lang.code);
    const label = `${lang.flag} ${lang.native}${
      inUiLanguage !== lang.native ? ` — ${inUiLanguage}` : ""
    }`;
    els.sourceLang.append(new Option(label, lang.code));
    els.targetLang.append(new Option(label, lang.code));
  }
  if (source) els.sourceLang.value = source;
  if (target) els.targetLang.value = target;
}

function applySettingsToUi() {
  const s = state.settings;
  els.activeMode.value = s.activeMode;
  els.passiveMode.value = s.passiveMode;
  els.sourceLang.value = s.sourceLanguage;
  els.targetLang.value = s.targetLanguage;
  els.autoDetect.checked = Boolean(s.autoDetect);
  syncInputMode();
  syncTestTools();
}

function syncInputMode() {
  const audio = els.activeMode.value === "audio";
  show(els.audioInput, audio);
  show(els.textInput, !audio);
}

function syncTestTools() {
  const on = Boolean(state.settings.showTestTools);
  show(els.labelRow, on);
  show(els.ratingButtons?.closest(".rating-row"), on);
  show($("exportBtn"), on);
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

function wireEverything() {
  // Tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchScreen(tab.dataset.screen));
  });

  // Pickers
  els.activeMode.addEventListener("change", async () => {
    await persist({ activeMode: els.activeMode.value });
    syncInputMode();
    await refreshSpeechNote();
  });
  els.passiveMode.addEventListener("change", () => persist({ passiveMode: els.passiveMode.value }));

  els.sourceLang.addEventListener("change", async () => {
    guardSameLanguage("source");
    await persist({ sourceLanguage: els.sourceLang.value, targetLanguage: els.targetLang.value });
    await refreshSpeechNote();
    renderPhrases($("phraseSearch")?.value || "");
  });

  els.targetLang.addEventListener("change", async () => {
    guardSameLanguage("target");
    await persist({ sourceLanguage: els.sourceLang.value, targetLanguage: els.targetLang.value });
    renderPhrases($("phraseSearch")?.value || "");
  });

  els.swapBtn.addEventListener("click", async () => {
    [els.sourceLang.value, els.targetLang.value] = [els.targetLang.value, els.sourceLang.value];
    // Swapping direction without swapping how each person is using the app
    // would leave the person who was listening now expected to speak.
    const active = els.activeMode.value;
    els.activeMode.value = els.passiveMode.value === "audio" ? "audio" : "text";
    els.passiveMode.value = active === "audio" ? "audio" : "text";
    await persist({
      sourceLanguage: els.sourceLang.value,
      targetLanguage: els.targetLang.value,
      activeMode: els.activeMode.value,
      passiveMode: els.passiveMode.value,
    });
    syncInputMode();
    await refreshSpeechNote();
    renderPhrases($("phraseSearch")?.value || "");
    toast(t("compose.nowDirection", { from: languageLabel(els.sourceLang.value), to: languageLabel(els.targetLang.value) }));
  });

  els.autoDetect.addEventListener("change", () => persist({ autoDetect: els.autoDetect.checked }));

  els.uiLang.addEventListener("change", async () => {
    setUiLanguage(els.uiLang.value);
    await persist({ uiLanguage: els.uiLang.value });
    await retranslate();
  });

  // Compose
  els.recordBtn.addEventListener("click", toggleRecording);
  els.composeBtn.addEventListener("click", composeFromText);
  els.typedMessage.addEventListener("input", () => {
    const count = els.typedMessage.value.length;
    els.typedCount.textContent = t("compose.characters", { n: count });
  });

  // Review
  els.verifyBtn.addEventListener("click", runCheck);
  els.cancelReviewBtn.addEventListener("click", resetComposer);
  els.sendBtn.addEventListener("click", deliver);
  els.editableText.addEventListener("input", () => {
    // The moment the text changes, the translation on screen is stale. Hiding
    // it is safer than leaving a translation of something the user no longer
    // intends to say sitting under a Send button.
    show(els.verifyPanes, false);
    show(els.sendRow, false);
    state.verified = null;
  });

  // Result
  els.newMessageBtn.addEventListener("click", resetComposer);
  els.replayBtn.addEventListener("click", speakResult);
  els.bigTextBtn.addEventListener("click", () => openBigText());
  els.bigTextClose.addEventListener("click", () => show(els.bigTextOverlay, false));
  els.bigSpeakBtn.addEventListener("click", speakResult);
  els.ratingButtons.addEventListener("click", onRate);

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const source = $(btn.dataset.copy);
      const ok = await copyText(source?.textContent || "");
      toast(t(ok ? "result.copied" : "result.copyFailed"));
    });
  });

  // Log + settings + phrasebook
  wireLogTable();
  wireSettings({
    settings: state.settings,
    onSettingChange: async (patch) => {
      await persist(patch);
      if ("useInternet" in patch) {
        setAllowInternet(patch.useInternet);
        refreshInternetHint();
        refreshModeChip();
        await refreshSpeechNote();
      }
      syncTestTools();
    },
  });
  initPhrasebook({
    pair: () => ({ source: els.sourceLang.value, target: els.targetLang.value }),
    onUse: (text) => {
      els.activeMode.value = "text";
      syncInputMode();
      els.typedMessage.value = text;
      els.typedMessage.dispatchEvent(new Event("input"));
      switchScreen("translate");
      composeFromText();
    },
  });
  document.addEventListener("log:changed", () => refreshLog());

  // Install prompt (PWA path; harmless in the native shell)
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    els.installBtn.classList.remove("chip-hidden");
  });
  els.installBtn.addEventListener("click", async () => {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    state.deferredInstallPrompt = null;
    els.installBtn.classList.add("chip-hidden");
  });
  els.dismissTipBtn.addEventListener("click", () => show(els.iosInstallTip, false));

  if (!isNative() && platform() === "web" && isIosSafari() && !isStandalone()) {
    show(els.iosInstallTip, true);
  }

  els.modelBannerDismiss.addEventListener("click", async () => {
    show(els.modelBanner, false);
    await persist({ modelPromptSeen: true });
  });
  els.modelBannerBtn.addEventListener("click", () => {
    show(els.modelBanner, false);
    switchScreen("settings");
    $("downloadAllBtn")?.click();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") show(els.bigTextOverlay, false);
  });
}


/**
 * The header chip tells the truth about what is about to happen.
 *
 * "Works offline" is a promise, and a promise the web build cannot keep on a
 * phone. Showing it there anyway would be the single most misleading thing in
 * the app, so the chip is computed from what is actually available rather than
 * hard-coded.
 */
function refreshModeChip() {
  const onDevice = onDeviceAvailable();
  const usingInternet = Boolean(state.settings?.useInternet) && looksOnline();

  els.offlineChip.classList.remove("chip-ok", "chip-warn");

  if (onDevice && !usingInternet) {
    els.offlineChip.textContent = t("chip.offline");
    els.offlineChip.classList.add("chip-ok");
    els.offlineChip.title = "Translation happens on this phone. Nothing is sent anywhere.";
  } else if (onDevice && usingInternet) {
    els.offlineChip.textContent = t("chip.onlineWithBackup");
    els.offlineChip.classList.add("chip-ok");
    els.offlineChip.title =
      "Using the internet for better translation, falling back to this phone if the signal drops.";
  } else if (usingInternet) {
    els.offlineChip.textContent = t("chip.needsInternet");
    els.offlineChip.classList.add("chip-warn");
    els.offlineChip.title =
      "This is the web version. No phone browser can translate on-device, so free text needs a connection. The built-in phrases still work offline.";
  } else {
    els.offlineChip.textContent = t("chip.phrasesOnly");
    els.offlineChip.classList.add("chip-warn");
    els.offlineChip.title =
      "No translation engine is available: the web version with the internet option off can only use the built-in phrases.";
  }
}

/** Explains, on the Settings screen, what the toggle actually changes here. */
function refreshInternetHint() {
  const onDevice = onDeviceAvailable();
  els.useInternetHint.textContent = t(
    onDevice ? "settings.internetHintNative" : "settings.internetHintWeb"
  );

  const stranded = !onDevice && !state.settings.useInternet;
  show(els.internetNote, stranded);
  if (stranded) {
    els.internetNote.textContent = t("settings.internetOffWarning");
  }
}


/**
 * The interface-language picker.
 *
 * Each option shows the language in its OWN language — "Български", not
 * "Bulgarian". Someone looking for their language recognises it written the
 * way they write it, not translated into one they cannot read.
 */
function buildUiLanguagePicker() {
  els.uiLang.innerHTML = "";
  for (const lang of UI_LANGUAGES) {
    els.uiLang.append(new Option(`${lang.flag} ${lang.label}`, lang.code));
  }
  els.uiLang.value = uiLanguage();
}

/**
 * Redraw everything after a language change.
 *
 * `applyTranslations()` handles the static markup; these are the parts built
 * in JavaScript, which it cannot reach.
 */
async function retranslate() {
  applyTranslations();
  rebuildModePickers();
  rebuildLanguagePickers();
  refreshModeChip();
  refreshInternetHint();
  els.envChip.textContent = isNative() ? environmentLabel() : t("chip.browserPreview");
  els.typedMessage.dispatchEvent(new Event("input"));
  renderPhrases($("phraseSearch")?.value || "");
  await Promise.all([refreshLog(), renderModels(), renderCapabilities()]);
  await refreshSpeechNote();
}

/** The two mode dropdowns hold translated labels, so they are rebuilt too. */
function rebuildModePickers() {
  const active = els.activeMode.value || state.settings.activeMode;
  const passive = els.passiveMode.value || state.settings.passiveMode;
  els.activeMode.innerHTML = "";
  els.passiveMode.innerHTML = "";
  els.activeMode.append(new Option(t("mode.audioSpeaks"), "audio"), new Option(t("mode.textTypes"), "text"));
  els.passiveMode.append(new Option(t("mode.textReads"), "text"), new Option(t("mode.audioListens"), "audio"));
  els.activeMode.value = active;
  els.passiveMode.value = passive;
}

async function persist(patch) {
  state.settings = await saveSettings(patch);
}

/** Two identical languages is a no-op the user never means. Nudge the other one. */
function guardSameLanguage(changed) {
  if (els.sourceLang.value !== els.targetLang.value) return;
  const other = LANGUAGES.find((l) => l.code !== els.sourceLang.value);
  if (changed === "source") els.targetLang.value = other.code;
  else els.sourceLang.value = other.code;
  toast(t("compose.sameLanguage"));
}

function switchScreen(name) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("hidden", screen.id !== `screen-${name}`);
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.screen === name);
  });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  if (name === "log") refreshLog();
  if (name === "settings") {
    renderModels();
    renderCapabilities();
    refreshInternetHint();
  }
  if (name === "phrasebook") renderPhrases($("phraseSearch")?.value || "");
}

// ---------------------------------------------------------------------------
// First-run: are the packs here?
// ---------------------------------------------------------------------------

async function checkLanguagePacks() {
  if (!isNative()) return;
  const missing = await missingLanguages();
  if (missing.length === 0) return;

  els.modelBannerText.textContent = t("banner.packsBody", { list: missing.map(languageLabel).join(", ") });
  show(els.modelBanner, true);
  els.offlineChip.textContent = t("banner.packsMissing");
  els.offlineChip.classList.remove("chip-ok");
  els.offlineChip.classList.add("chip-warn");
}

// ---------------------------------------------------------------------------
// Composing — speech
// ---------------------------------------------------------------------------

async function refreshSpeechNote() {
  if (els.activeMode.value !== "audio") {
    show(els.speechNote, false);
    els.recordBtn.disabled = false;
    return;
  }
  const { support, note } = await speechSupportNote(els.sourceLang.value);
  if (note) {
    els.speechNote.textContent = note;
    show(els.speechNote, true);
  } else {
    show(els.speechNote, false);
  }
  // "no" means this phone genuinely cannot do it. Leaving the button live to
  // fail on tap would be a worse experience than a disabled button plus the
  // sentence above explaining why.
  els.recordBtn.disabled = support === "no";
}

async function toggleRecording() {
  if (state.recording) {
    await stopListening();
    return;
  }

  setStatus("");
  els.partialText.textContent = "";
  state.recording = true;
  state.recordStartedAt = Date.now();
  els.recordBtn.classList.add("is-recording");
  els.recordLabel.textContent = t("compose.listening");
  startTimer();

  try {
    const result = await listen({
      languageCode: els.sourceLang.value,
      onPartial: (text) => {
        els.partialText.textContent = text;
      },
    });
    const seconds = (Date.now() - state.recordStartedAt) / 1000;
    openReview({
      text: result.transcript,
      confidence: result.confidence ?? null,
      audioSeconds: Number(seconds.toFixed(1)),
      sttMs: Date.now() - state.recordStartedAt,
      fromSpeech: true,
    });
  } catch (err) {
    const message =
      err instanceof SpeechError ? err.message : `Could not listen: ${err?.message || err}`;
    setStatus(message, true);
  } finally {
    stopRecordingUi();
  }
}

function stopRecordingUi() {
  state.recording = false;
  els.recordBtn.classList.remove("is-recording");
  els.recordLabel.textContent = t("compose.tapToSpeak");
  stopTimer();
}

function startTimer() {
  stopTimer();
  els.timer.textContent = "0:00";
  state.timerHandle = setInterval(() => {
    els.timer.textContent = formatClock((Date.now() - state.recordStartedAt) / 1000);
  }, 250);
}

function stopTimer() {
  if (state.timerHandle) clearInterval(state.timerHandle);
  state.timerHandle = null;
}

// ---------------------------------------------------------------------------
// Composing — typing
// ---------------------------------------------------------------------------

function composeFromText() {
  const text = els.typedMessage.value.trim();
  if (!text) {
    setStatus(t("compose.typeSomethingFirst"), true);
    return;
  }
  openReview({ text, confidence: null, audioSeconds: null, sttMs: null, fromSpeech: false });
}

// ---------------------------------------------------------------------------
// The check step
// ---------------------------------------------------------------------------

async function openReview({ text, confidence, audioSeconds, sttMs, fromSpeech }) {
  let sourceLanguage = els.sourceLang.value;

  if (els.autoDetect.checked) {
    const detected = await identifyLanguage(text);
    if (detected && detected !== sourceLanguage) {
      if (detected === els.targetLang.value) {
        // The other person has typed into the phone. Flipping the direction is
        // almost certainly what they meant, and getting it wrong would produce
        // a translation into the language the text is already in.
        els.sourceLang.value = detected;
        els.targetLang.value = sourceLanguage;
        sourceLanguage = detected;
        toast(t("detect.flipped", { lang: languageLabel(detected) }));
      } else {
        sourceLanguage = detected;
        els.sourceLang.value = detected;
        toast(t("detect.found", { lang: languageLabel(detected) }));
      }
      await persist({ sourceLanguage: els.sourceLang.value, targetLanguage: els.targetLang.value });
    }
  }

  state.pending = {
    transcript: fromSpeech ? text : null,
    text,
    confidence,
    audioSeconds,
    sttMs,
    sourceLanguage,
    targetLanguage: els.targetLang.value,
    activeMode: els.activeMode.value,
    passiveMode: els.passiveMode.value,
    detectedLanguage: els.autoDetect.checked ? sourceLanguage : null,
  };
  state.verified = null;

  els.editableText.value = text;
  els.editableHint.textContent = fromSpeech ? t("review.hintSpeech") : t("review.hintType");

  const uncertain = typeof confidence === "number" && confidence < 0.6;
  show(els.reviewUncertain, uncertain);
  if (uncertain) {
    els.reviewUncertainText.textContent = t("review.uncertain", {
      pct: Math.round(confidence * 100),
    });
  }
  // An empty tag still renders as a stray grey pill, so hide it rather than
  // blanking it. Most on-device recognisers report no confidence at all.
  const hasConfidence = typeof confidence === "number";
  els.reviewConfidence.textContent = hasConfidence
    ? t("review.sure", { pct: Math.round(confidence * 100) })
    : "";
  show(els.reviewConfidence, hasConfidence);

  show(els.verifyPanes, false);
  show(els.sendRow, false);
  show(els.resultCard, false);
  show(els.reviewCard, true);
  els.verifyStatus.textContent = "";
  els.reviewCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function runCheck() {
  const text = els.editableText.value.trim();
  if (!text) {
    els.verifyStatus.textContent = t("review.nothingToTranslate");
    return;
  }

  els.verifyBtn.disabled = true;
  els.verifyStatus.textContent = t("review.translating");

  try {
    const result = await translateAndVerify({
      text,
      sourceLanguage: state.pending.sourceLanguage,
      targetLanguage: state.pending.targetLanguage,
    });

    state.verified = { ...result, text };

    els.verifyTargetHead.textContent = `${t("review.theyWillSee")} (${languageNative(state.pending.targetLanguage)})`;
    els.verifyTargetTag.textContent = languageLabel(state.pending.targetLanguage);
    els.verifyTranslated.textContent = result.translated;

    els.verifyBackTag.textContent = languageLabel(state.pending.sourceLanguage);
    els.verifyBack.textContent = result.backTranslation || t("review.checkFailed");

    const overlap = meaningOverlap(text, result.backTranslation);
    if (overlap !== null && overlap < 0.35) {
      els.verifyStatus.textContent =
        t("review.meaningShifted");
    } else {
      els.verifyStatus.textContent = engineLabel(result.engine);
    }

    show(els.verifyPanes, true);
    show(els.sendRow, true);
    els.sendHint.textContent = t(
      state.pending.passiveMode === "audio" ? "review.willRead" : "review.holdUp"
    );
  } catch (err) {
    const message =
      err instanceof TranslationError ? err.message : `Translation failed: ${err?.message || err}`;
    els.verifyStatus.textContent = message;
    await addMessage({
      ...pendingRecord(),
      status: "error",
      errorCode: err instanceof TranslationError ? err.code : "TRANSLATE_FAILED",
      errorMessage: message,
    });
    refreshLog();
  } finally {
    els.verifyBtn.disabled = false;
  }
}

function pendingRecord() {
  const p = state.pending || {};
  return {
    sourceLanguage: p.sourceLanguage ?? null,
    targetLanguage: p.targetLanguage ?? null,
    detectedLanguage: p.detectedLanguage ?? null,
    activeMode: p.activeMode ?? "audio",
    passiveMode: p.passiveMode ?? "text",
    transcript: p.transcript ?? null,
    editedText: els.editableText?.value?.trim() || null,
    confidence: p.confidence ?? null,
    audioSeconds: p.audioSeconds ?? null,
    sttMs: p.sttMs ?? null,
    label: els.clientLabel?.value?.trim() || null,
  };
}

// ---------------------------------------------------------------------------
// Delivering
// ---------------------------------------------------------------------------

async function deliver() {
  if (!state.verified) return;
  const p = state.pending;
  const v = state.verified;
  const editedText = els.editableText.value.trim();
  const wasEdited = p.activeMode === "audio" && p.transcript !== null && p.transcript.trim() !== editedText;
  const overlap = meaningOverlap(editedText, v.backTranslation);

  const saved = await addMessage({
    ...pendingRecord(),
    editedText,
    wasEdited,
    translatedText: v.translated,
    backTranslation: v.backTranslation,
    translateMs: v.translateMs,
    backTranslateMs: v.backTranslateMs,
    totalMs: (p.sttMs || 0) + (v.totalMs || 0),
    uncertain: typeof p.confidence === "number" && p.confidence < 0.6,
    status: "success",
    preview: Boolean(v.preview),
    engine: v.engine,
  });
  state.lastMessageId = saved.id;

  // Result card
  els.originalLangTag.textContent = languageLabel(p.sourceLanguage);
  els.originalText.textContent = editedText;
  els.translatedLangTag.textContent = languageLabel(p.targetLanguage);
  els.translatedText.textContent = v.translated;
  // Never leave this ambiguous. "On this phone" and "over the internet" mean
  // different things for a sentence about someone's medical history.
  els.engineNote.textContent = engineLabel(v.engine);

  setMeter(els.meaningValue, els.meaningBar, overlap);
  setMeter(els.confidenceValue, els.confidenceBar, p.confidence);
  if (p.confidence === null || p.confidence === undefined) {
    els.confidenceValue.textContent = "n/a";
  }

  els.sttMs.textContent = formatMs(p.sttMs);
  els.translateMs.textContent = formatMs(v.translateMs);
  els.totalMs.textContent = formatMs((p.sttMs || 0) + (v.totalMs || 0));
  els.audioSeconds.textContent = p.audioSeconds ? `${p.audioSeconds}s` : "—";
  els.detectedLang.textContent = p.detectedLanguage ? languageLabel(p.detectedLanguage) : "—";

  els.deliveryText.textContent = `${describeExchange(p.activeMode, p.passiveMode)}${
    wasEdited ? t("result.afterCorrecting") : "."
  }`;
  show(els.deliveryBanner, true);

  show(els.uncertainBanner, overlap !== null && overlap < 0.35);
  if (overlap !== null && overlap < 0.35) {
    els.uncertainText.textContent = ` ${t("result.driftWarning")}`;
  }

  resetRatingButtons();
  show(els.reviewCard, false);
  show(els.resultCard, true);

  // Speak it, if that is how the other person is receiving it.
  const speakable = p.passiveMode === "audio";
  show(els.audioOut, speakable);
  if (speakable) {
    const voice = await canSpeak(p.targetLanguage);
    els.ttsMeta.textContent = voice
      ? ""
      : `No ${languageLabel(p.targetLanguage)} voice is installed on this phone — show the text instead.`;
    els.replayBtn.disabled = !voice;
    if (voice && state.settings.autoSpeak) await speakResult();
  }

  if (state.settings.bigText) openBigText();
  els.resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  refreshLog();
}

function setMeter(valueEl, barEl, ratio) {
  if (ratio === null || ratio === undefined || Number.isNaN(Number(ratio))) {
    valueEl.textContent = "—";
    barEl.style.width = "0%";
    return;
  }
  const pct = Math.round(Math.max(0, Math.min(1, Number(ratio))) * 100);
  valueEl.textContent = `${pct}%`;
  barEl.style.width = `${pct}%`;
}

async function speakResult() {
  const text = els.translatedText.textContent;
  const language = state.pending?.targetLanguage || els.targetLang.value;
  if (!text) return;
  try {
    await stopSpeaking();
    await speak({ text, languageCode: language });
  } catch (err) {
    toast(err.message, 5200);
  }
}

function openBigText() {
  els.bigTextLang.textContent = languageNative(state.pending?.targetLanguage || els.targetLang.value);
  els.bigTextBody.textContent = els.translatedText.textContent;
  show(els.bigTextOverlay, true);
}

// ---------------------------------------------------------------------------
// Rating
// ---------------------------------------------------------------------------

function resetRatingButtons() {
  els.ratingButtons.querySelectorAll("button").forEach((b) => b.classList.remove("is-selected"));
  els.ratingSaved.textContent = "";
}

async function onRate(event) {
  const btn = event.target.closest("[data-rating]");
  if (!btn || !state.lastMessageId) return;
  const rating = Number(btn.dataset.rating);
  try {
    await rateMessage(state.lastMessageId, rating);
    els.ratingButtons.querySelectorAll("button").forEach((b) => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");
    els.ratingSaved.textContent = t("rating.saved");
    refreshLog();
  } catch (err) {
    toast(err.message);
  }
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

function resetComposer() {
  state.pending = null;
  state.verified = null;
  state.lastMessageId = null;
  els.typedMessage.value = "";
  els.typedMessage.dispatchEvent(new Event("input"));
  els.editableText.value = "";
  els.partialText.textContent = "";
  els.timer.textContent = "0:00";
  show(els.reviewCard, false);
  show(els.resultCard, false);
  show(els.bigTextOverlay, false);
  setStatus("");
  stopSpeaking();
}

function setStatus(message, isError = false) {
  els.statusMsg.textContent = message;
  els.statusMsg.classList.toggle("is-error", Boolean(isError));
}

function isIosSafari() {
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
}

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function registerServiceWorker() {
  // Only meaningful for the browser/PWA path — the native shell serves assets
  // from the app bundle and needs no cache layer.
  if (isNative() || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* a missing cache is a slower first load, not a broken app */
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  boot().catch((err) => {
    console.error("[boot] failed", err);
    const status = $("statusMsg");
    if (status) {
      status.textContent = t("err.startFailed", { message: err?.message || err });
      status.classList.add("is-error");
    }
  });
});
