/**
 * The phrasebook screen.
 *
 * Deliberately the second tab rather than something buried: for a large share
 * of real use — greeting, ordering, asking for a pharmacy — no translation is
 * needed at all, and a stored sentence is faster, more accurate and less
 * battery than anything the engine can do. Getting people to the fixed
 * phrases first is a feature, not a fallback.
 */
import { $, escapeHtml, toast } from "../util.js";
import { PHRASEBOOK, searchPhrases } from "../data/phrasebook.js";
import { languageLabel } from "../languages.js";
import { t } from "../i18n.js";
import { speak, canSpeak } from "../engine/speaker.js";

let onUsePhrase = () => {};
let getPair = () => ({ source: "en", target: "bg" });

export function initPhrasebook({ onUse, pair }) {
  onUsePhrase = onUse || onUsePhrase;
  getPair = pair || getPair;

  $("phraseSearch")?.addEventListener("input", (event) => renderPhrases(event.target.value));

  $("phraseList")?.addEventListener("click", async (event) => {
    const speakBtn = event.target.closest("[data-speak]");
    if (speakBtn) {
      const { target } = getPair();
      const text = speakBtn.dataset.speak;
      if (!(await canSpeak(target))) {
        toast(t("voice.none", { lang: languageLabel(target) }), 6000);
        return;
      }
      try {
        await speak({ text, languageCode: target });
      } catch (err) {
        toast(err.message);
      }
      return;
    }

    const useBtn = event.target.closest("[data-use]");
    if (useBtn) onUsePhrase(useBtn.dataset.use);
  });
}

export function renderPhrases(query = "") {
  const list = $("phraseList");
  if (!list) return;

  const { source, target } = getPair();
  const pairEl = $("phrasebookPair");
  if (pairEl) pairEl.textContent = `${languageLabel(source)} → ${languageLabel(target)}`;

  const trimmed = String(query || "").trim();

  const groups = trimmed
    ? [{ title: t("phrases.matches"), phrases: searchPhrases(trimmed) }]
    : PHRASEBOOK.map((g) => ({ title: t(g.key), phrases: g.phrases }));

  if (groups.every((g) => g.phrases.length === 0)) {
    list.innerHTML = `<p class="pane-note">${escapeHtml(t("phrases.noMatch", { q: trimmed }))}</p>`;
    return;
  }

  list.innerHTML = groups
    .filter((group) => group.phrases.length > 0)
    .map((group) => {
      const items = group.phrases
        .map((phrase) => {
          const from = phrase[source] ?? phrase.en;
          const to = phrase[target] ?? phrase.en;
          return `
            <div class="phrase">
              <button class="phrase-body" type="button" data-use="${escapeHtml(from)}">
                <span class="phrase-source">${escapeHtml(from)}</span>
                <span class="phrase-target">${escapeHtml(to)}</span>
              </button>
              <button
                class="phrase-speak"
                type="button"
                data-speak="${escapeHtml(to)}"
                aria-label="${escapeHtml(t("phrases.readAloud", { lang: languageLabel(target) }))}"
                title="${escapeHtml(t("phrases.readAloud", { lang: languageLabel(target) }))}"
              >🔊</button>
            </div>`;
        })
        .join("");
      return `<div><p class="phrase-group-title">${escapeHtml(group.title)}</p>${items}</div>`;
    })
    .join("");
}
