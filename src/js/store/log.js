/**
 * The Message Log, stored on the phone.
 *
 * The serviced-accommodation version kept this in SQLite on a server. With no
 * server there is nowhere to put it but the device, which is the better answer
 * anyway: a traveller's conversations — a medical complaint, a lost passport,
 * an argument with a landlord — are about as private as data gets, and the
 * strongest privacy guarantee is the one where the data never leaves.
 *
 * IndexedDB rather than localStorage because a log grows without bound and
 * localStorage is a few megabytes shared with everything else, hits the main
 * thread, and stores strings only. IndexedDB is asynchronous, roomy, and
 * indexed — which is what makes filtering by date and status cheap.
 */
const DB_NAME = "travel-translator";
const DB_VERSION = 1;
const STORE = "messages";

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser has no IndexedDB, so the message log cannot be stored."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("createdAt", "createdAt");
        store.createIndex("status", "status");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function tx(mode) {
  return openDb().then((db) => db.transaction(STORE, mode).objectStore(STORE));
}

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * One row per message. Written at the moment of delivery rather than in stages,
 * because with no network there is no half-sent state to recover from — the
 * whole exchange either happened on this phone or it did not.
 */
export async function addMessage(record) {
  const store = await tx("readwrite");
  const row = {
    createdAt: new Date().toISOString(),
    sourceLanguage: null,
    targetLanguage: null,
    detectedLanguage: null,
    activeMode: "audio",
    passiveMode: "text",
    transcript: null,
    editedText: null,
    wasEdited: false,
    translatedText: null,
    backTranslation: null,
    confidence: null,
    uncertain: false,
    audioSeconds: null,
    sttMs: null,
    translateMs: null,
    backTranslateMs: null,
    ttsMs: null,
    totalMs: null,
    status: "success",
    errorCode: null,
    errorMessage: null,
    label: null,
    rating: null,
    notes: null,
    preview: false,
    engine: null,
    ...record,
  };
  const id = await promisify(store.add(row));
  return { ...row, id };
}

export async function updateMessage(id, patch) {
  const store = await tx("readwrite");
  const existing = await promisify(store.get(Number(id)));
  if (!existing) return null;
  const updated = { ...existing, ...patch, id: existing.id };
  await promisify(store.put(updated));
  return updated;
}

export async function getMessage(id) {
  const store = await tx("readonly");
  return promisify(store.get(Number(id)));
}

/** Newest first, which is the only order anyone ever wants to read a log in. */
export async function listMessages({ limit = 100, offset = 0, status = null } = {}) {
  const store = await tx("readonly");
  const all = await promisify(store.getAll());
  const filtered = status ? all.filter((r) => r.status === status) : all;
  filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : b.id - a.id));
  return filtered.slice(offset, offset + limit);
}

export async function countMessages() {
  const store = await tx("readonly");
  return promisify(store.count());
}

export async function deleteMessages(ids) {
  const store = await tx("readwrite");
  let deleted = 0;
  for (const id of ids) {
    try {
      await promisify(store.delete(Number(id)));
      deleted += 1;
    } catch {
      /* a row that has already gone is not a failure worth reporting */
    }
  }
  return deleted;
}

export async function clearMessages() {
  const store = await tx("readwrite");
  await promisify(store.clear());
}

export async function rateMessage(id, rating, notes = null) {
  const value = Number(rating);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("Rating must be a whole number from 1 to 5.");
  }
  return updateMessage(id, { rating: value, notes });
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

const CSV_COLUMNS = [
  ["id", "ID"],
  ["createdAt", "When"],
  ["sourceLanguage", "From"],
  ["targetLanguage", "To"],
  ["detectedLanguage", "Detected"],
  ["activeMode", "Sender"],
  ["passiveMode", "Receiver"],
  ["transcript", "Heard"],
  ["editedText", "Sent"],
  ["wasEdited", "Corrected"],
  ["translatedText", "Received"],
  ["backTranslation", "Checked back as"],
  ["confidence", "Confidence"],
  ["audioSeconds", "Audio seconds"],
  ["sttMs", "Speech ms"],
  ["translateMs", "Translate ms"],
  ["backTranslateMs", "Back-translate ms"],
  ["totalMs", "Total ms"],
  ["status", "Status"],
  ["errorCode", "Error code"],
  ["errorMessage", "Error"],
  ["label", "Label"],
  ["rating", "Rating"],
  ["notes", "Notes"],
  ["engine", "Engine"],
];

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  // A leading =, +, - or @ makes Excel treat the cell as a formula. Prefixing
  // an apostrophe is the standard defence; without it a transcript beginning
  // "-10 degrees" can execute rather than display.
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
}

/** UTF-8 with a byte-order mark, so Excel opens Cyrillic correctly on Windows. */
export async function exportCsv(ids = null) {
  const store = await tx("readonly");
  const all = await promisify(store.getAll());
  const wanted = ids && ids.length ? all.filter((r) => ids.includes(r.id)) : all;
  wanted.sort((a, b) => a.id - b.id);

  const header = CSV_COLUMNS.map(([, title]) => csvCell(title)).join(",");
  const rows = wanted.map((row) => CSV_COLUMNS.map(([key]) => csvCell(row[key])).join(","));
  return `\uFEFF${[header, ...rows].join("\r\n")}\r\n`;
}
