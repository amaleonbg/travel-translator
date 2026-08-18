/**
 * How each end of the conversation uses the message.
 *
 * This replaces the role picker (Guest / Host / Owner / Cleaner …) from the
 * serviced-accommodation version. A traveller is not a role in someone's
 * business — there are only ever two people, the one sending and the one
 * receiving, and the only thing the app needs to know about each is whether
 * they are using their voice or the screen.
 *
 * For the active user this decides whether speech recognition runs at all —
 * typing skips it entirely, which is both instant and perfectly accurate.
 * For the passive user it decides whether the phone reads the result aloud.
 */
export const ACTIVE_MODES = [
  { code: "audio", label: "Audio (speaks)" },
  { code: "text", label: "Text (types)" },
];

export const PASSIVE_MODES = [
  { code: "text", label: "Text (reads)" },
  { code: "audio", label: "Audio (listens)" },
];

export function normaliseMode(value, fallback) {
  return value === "audio" || value === "text" ? value : fallback;
}

export function modeLabel(list, code) {
  return list.find((m) => m.code === code)?.label || code || "—";
}

/** "Speaks → Listens" — the compact form used in the Message Log's Who column. */
export function describeExchange(activeMode, passiveMode) {
  const a = activeMode === "audio" ? "Speaks" : "Types";
  const p = passiveMode === "audio" ? "Listens" : "Reads";
  return `${a} → ${p}`;
}
