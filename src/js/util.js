export const $ = (id) => document.getElementById(id);

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function show(el, visible = true) {
  if (el) el.classList.toggle("hidden", !visible);
}

export function formatMs(ms) {
  if (ms === null || ms === undefined || Number.isNaN(Number(ms))) return "—";
  const value = Number(ms);
  return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;
}

export function formatClock(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function formatWhen(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return sameDay ? time : `${date.toLocaleDateString([], { day: "2-digit", month: "short" })} ${time}`;
}

/**
 * How much of the original survived the round trip.
 *
 * With no cloud service there is no confidence score to lean on, so this is
 * the app's own honest substitute: translate the message, translate it back,
 * and measure the word overlap between the result and what was written. A low
 * score does not prove the translation is wrong — languages legitimately
 * reshape sentences — but a high score is decent evidence the meaning held,
 * and that is exactly the reassurance someone needs before showing a screen
 * to a doctor.
 *
 * Dice coefficient over word sets: symmetric, cheap, and forgiving of word
 * order, which matters because word order is the first thing translation
 * changes.
 */
export function meaningOverlap(original, backTranslation) {
  const tokenise = (text) =>
    new Set(
      String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const a = tokenise(original);
  const b = tokenise(backTranslation);
  if (a.size === 0 || b.size === 0) return null;

  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return (2 * shared) / (a.size + b.size);
}

let toastTimer = null;

export function toast(message, ms = 3200) {
  const el = $("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), ms);
}

/** Save a generated file. Uses the browser download path, which Capacitor's
 *  WebView honours for blob URLs on Android. */
export function downloadFile(filename, contents, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older WebViews reject the async clipboard API outside a user gesture.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
