/**
 * The Message Log table: render, select, delete, export.
 *
 * The eight aggregate tiles from the serviced-accommodation version — Tests,
 * Success, Avg conf., Uncertain, Edited, Avg rating, Audio min., Avg time —
 * are gone by request, and their absence is why this file has no stats query
 * at all rather than a hidden one. A traveller wants to find the sentence they
 * used at the pharmacy yesterday, not a success rate.
 */
import { $, escapeHtml, formatWhen, show, toast, downloadFile } from "../util.js";
import { listMessages, deleteMessages, exportCsv } from "../store/log.js";
import { describeExchange } from "../modes.js";
import { languageLabel } from "../languages.js";
import { t } from "../i18n.js";

const selected = new Set();
let rows = [];

export async function refreshLog() {
  rows = await listMessages({ limit: 200 });
  // Drop selections for rows that no longer exist, or the count lies.
  const live = new Set(rows.map((r) => r.id));
  for (const id of [...selected]) if (!live.has(id)) selected.delete(id);
  render();
}

function statusPill(row) {
  if (row.status === "error") {
    return `<span class="status-pill is-error" title="${escapeHtml(row.errorMessage || "")}">${escapeHtml(
      row.errorCode || "error"
    )}</span>`;
  }
  if (row.preview) return `<span class="status-pill">${t("log.statusPreview")}</span>`;
  return `<span class="status-pill">${t("log.statusSent")}</span>`;
}

function render() {
  const body = $("runsBody");
  if (!body) return;

  if (rows.length === 0) {
    body.innerHTML = `<tr><td colspan="9" class="empty">${t("log.empty")}</td></tr>`;
    updateSelectionUi();
    return;
  }

  body.innerHTML = rows
    .map((row) => {
      const who = describeExchange(row.activeMode, row.passiveMode);
      const pair = `${escapeHtml(languageLabel(row.sourceLanguage))} → ${escapeHtml(
        languageLabel(row.targetLanguage)
      )}`;
      const sent = row.editedText || row.transcript || "—";
      const received = row.translatedText || "—";
      const rating = row.rating ? `${row.rating}/5` : "—";

      return `
        <tr data-id="${row.id}">
          <td class="select-col">
            <input type="checkbox" class="row-check row-select" data-id="${row.id}" ${
              selected.has(row.id) ? "checked" : ""
            } aria-label="${escapeHtml(t("log.selectRow", { id: row.id }))}" />
          </td>
          <td>${row.id}</td>
          <td>${escapeHtml(formatWhen(row.createdAt))}</td>
          <td title="${escapeHtml(who)}">${escapeHtml(who)}</td>
          <td>${pair}</td>
          <td><span class="cell-text" title="${escapeHtml(sent)}">${escapeHtml(sent)}</span></td>
          <td><span class="cell-text" title="${escapeHtml(received)}">${escapeHtml(received)}</span></td>
          <td>${rating}</td>
          <td>${statusPill(row)}</td>
        </tr>`;
    })
    .join("");

  updateSelectionUi();
}

function updateSelectionUi() {
  const count = selected.size;
  const countEl = $("selectionCount");
  if (countEl) {
    countEl.textContent = t("log.selected", { n: count });
    show(countEl, count > 0);
  }
  show($("deleteSelectedBtn"), count > 0);
  show($("exportSelectedBtn"), count > 0);

  const all = $("selectAll");
  if (all) {
    all.checked = count > 0 && count === rows.length;
    all.indeterminate = count > 0 && count < rows.length;
  }
}

function setAll(value) {
  selected.clear();
  if (value) for (const row of rows) selected.add(row.id);
  render();
}

export function wireLogTable() {
  $("runsBody")?.addEventListener("change", (event) => {
    const box = event.target.closest(".row-select");
    if (!box) return;
    const id = Number(box.dataset.id);
    if (box.checked) selected.add(id);
    else selected.delete(id);
    updateSelectionUi();
  });

  $("selectAll")?.addEventListener("change", (event) => setAll(event.target.checked));

  const menu = $("selectMenu");
  $("selectMenuBtn")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.classList.toggle("hidden");
  });
  menu?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-select]");
    if (!btn) return;
    setAll(btn.dataset.select === "all");
    menu.classList.add("hidden");
  });
  document.addEventListener("click", () => menu?.classList.add("hidden"));

  $("refreshBtn")?.addEventListener("click", () => refreshLog());

  $("deleteSelectedBtn")?.addEventListener("click", async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const ok = window.confirm(t("log.confirmDelete", { n: ids.length }));
    if (!ok) return;
    const deleted = await deleteMessages(ids);
    selected.clear();
    await refreshLog();
    toast(t("log.deleted", { n: deleted }));
  });

  $("exportBtn")?.addEventListener("click", async () => {
    const csv = await exportCsv(null);
    downloadFile(`translator-log-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast(t("log.exported"));
  });

  $("exportSelectedBtn")?.addEventListener("click", async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const csv = await exportCsv(ids);
    downloadFile(
      `translator-log-${new Date().toISOString().slice(0, 10)}-selection-${ids.length}.csv`,
      csv
    );
    toast(t("log.exported"));
  });
}
