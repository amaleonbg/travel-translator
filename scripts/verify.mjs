/**
 * `npm run verify` — everything that can be checked without a phone.
 *
 * Dependency-free on purpose: it must still run on a Windows laptop in six
 * months with nothing installed but Node. It covers three kinds of mistake,
 * chosen because each has actually bitten this kind of project before:
 *
 *   1. Data mistakes  — a phrasebook entry missing one of the four languages,
 *                       a language record missing a code.
 *   2. Wiring mistakes — main.js reaching for an element id that index.html
 *                        does not have. Silent at build time, fatal at run time.
 *   3. Packaging       — a manifest icon that does not exist on disk, which
 *                        Play Console rejects only after you have uploaded.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function exists(path) {
  return stat(path).then(
    () => true,
    () => false
  );
}

const importModule = (rel) => import(pathToFileURL(join(root, rel)).href);

// ---------------------------------------------------------------------------
// 1. Languages
// ---------------------------------------------------------------------------

const { LANGUAGES, resolveLanguage, supportedCodes } = await importModule("src/js/languages.js");

check("exactly four languages", LANGUAGES.length === 4, `found ${LANGUAGES.length}`);
check(
  "the four are English, Bulgarian, Portuguese, Spanish",
  ["en", "bg", "pt", "es"].every((c) => supportedCodes().includes(c)),
  supportedCodes().join(", ")
);

for (const lang of LANGUAGES) {
  for (const field of ["code", "translate", "stt", "tts", "label", "native", "flag"]) {
    check(`${lang.code}.${field} is set`, Boolean(lang[field]));
  }
  check(`${lang.code}.stt has a region`, lang.stt.includes("-"), lang.stt);
  check(
    `${lang.code}.translate is a bare two-letter code`,
    /^[a-z]{2}$/.test(lang.translate),
    lang.translate
  );
}

check("resolveLanguage('bg-BG') → bg", resolveLanguage("bg-BG")?.code === "bg");
check("resolveLanguage('pt-BR') → pt", resolveLanguage("pt-BR")?.code === "pt");
check("resolveLanguage('ES') → es", resolveLanguage("ES")?.code === "es");
check("resolveLanguage('fr') → null", resolveLanguage("fr") === null);
check("resolveLanguage('') → null", resolveLanguage("") === null);
check("resolveLanguage(null) → null", resolveLanguage(null) === null);

// ---------------------------------------------------------------------------
// 2. Modes — the role picker really is gone
// ---------------------------------------------------------------------------

const { ACTIVE_MODES, PASSIVE_MODES, normaliseMode, describeExchange } = await importModule(
  "src/js/modes.js"
);

check("two active modes", ACTIVE_MODES.length === 2);
check("two passive modes", PASSIVE_MODES.length === 2);
check("active modes are Audio (speaks) / Text (types)", ACTIVE_MODES.map((m) => m.label).join(" | ") === "Audio (speaks) | Text (types)");
check("normaliseMode falls back", normaliseMode("nonsense", "text") === "text");
check("describeExchange reads plainly", describeExchange("audio", "text") === "Speaks → Reads");

// ---------------------------------------------------------------------------
// 3. Phrasebook
// ---------------------------------------------------------------------------

const { ALL_PHRASES, lookup, searchPhrases } = await importModule("src/js/data/phrasebook.js");

check("phrasebook is not empty", ALL_PHRASES.length > 30, `${ALL_PHRASES.length} phrases`);

for (const phrase of ALL_PHRASES) {
  const missing = ["en", "bg", "pt", "es"].filter((c) => !phrase[c] || !String(phrase[c]).trim());
  check(`phrase "${phrase.en}" has all four languages`, missing.length === 0, missing.join(", "));
}

const seen = new Set();
for (const phrase of ALL_PHRASES) {
  check(`phrase "${phrase.en}" appears once`, !seen.has(phrase.en));
  seen.add(phrase.en);
}

check("lookup is case-insensitive", lookup("HELLO", "en")?.bg === "Здравейте");
check("lookup ignores trailing punctuation", Boolean(lookup("Hello.", "en")));
check("lookup works from Bulgarian", lookup("Здравейте", "bg")?.en === "Hello");
check("lookup misses cleanly", lookup("xyzzy nothing", "en") === null);
check("search finds by meaning", searchPhrases("pharmacy").length > 0);
check("search finds across languages", searchPhrases("аптека").length > 0);

// ---------------------------------------------------------------------------
// 4. Meaning-overlap maths
// ---------------------------------------------------------------------------

const { meaningOverlap, formatMs, formatClock } = await importModule("src/js/util.js");

check("identical text scores 1", meaningOverlap("where is the pharmacy", "where is the pharmacy") === 1);
check(
  "unrelated text scores low",
  meaningOverlap("where is the pharmacy", "my flight leaves tomorrow morning") < 0.2
);
check("partial overlap lands in between", (() => {
  const score = meaningOverlap("I need a doctor quickly", "I need a doctor now");
  return score > 0.3 && score < 1;
})());
check("empty input returns null", meaningOverlap("", "anything") === null);
// Words of two letters or fewer carry almost no meaning and would inflate the
// score on any sentence, so they are dropped before comparing. A string made
// only of them therefore has nothing left to compare.
check("very short words are ignored, not counted", meaningOverlap("a an is", "a an is") === null);
check("punctuation does not change the score", meaningOverlap("¿Dónde está la farmacia?", "Donde esta la farmacia") === 1);

check("formatMs sub-second", formatMs(420) === "420ms");
check("formatMs over a second", formatMs(1500) === "1.5s");
check("formatMs handles nothing", formatMs(null) === "—");
check("formatClock pads", formatClock(65) === "1:05");

// ---------------------------------------------------------------------------
// 5. Wiring — every id main.js reaches for exists in index.html
// ---------------------------------------------------------------------------

const html = await readFile(join(root, "www/index.html"), "utf8");
const mainSource = await readFile(join(root, "src/js/main.js"), "utf8");

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

const idsBlock = mainSource.match(/const IDS = \[([\s\S]*?)\];/);
check("main.js declares its element ids", Boolean(idsBlock));
if (idsBlock) {
  const wanted = [...idsBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  for (const id of wanted) {
    check(`index.html has #${id}`, htmlIds.has(id));
  }
}

// The eight aggregate tiles were removed by request. Guard against them
// creeping back in through a copy-paste from the original app.
const bannedLabels = [
  ">Tests<", ">Success<", ">Avg conf.<", ">Uncertain<",
  ">Edited<", ">Avg rating<", ">Audio min.<", ">Avg time<",
];
for (const label of bannedLabels) {
  check(`removed stat tile ${label.slice(1, -1)} stays removed`, !html.includes(label));
}
check("the stats row itself is gone", !html.includes('id="statsRow"'));
check("no role picker remains", !html.includes('id="activeRole"') && !html.includes('id="passiveRole"'));

// ---------------------------------------------------------------------------
// 6. Packaging
// ---------------------------------------------------------------------------

const manifest = JSON.parse(await readFile(join(root, "www/manifest.webmanifest"), "utf8"));
for (const icon of manifest.icons) {
  check(`manifest icon ${icon.src} exists`, await exists(join(root, "www", icon.src)));
}
check("manifest has a maskable icon", manifest.icons.some((i) => i.purpose === "maskable"));
check("manifest is standalone", manifest.display === "standalone");

const capacitor = JSON.parse(await readFile(join(root, "capacitor.config.json"), "utf8"));
check("capacitor appId is a reverse-domain id", /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(capacitor.appId), capacitor.appId);
check("capacitor webDir points at www", capacitor.webDir === "www");

const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
for (const dep of [
  "@capacitor/core",
  "@capacitor/android",
  "@capacitor-mlkit/translation",
  "@capacitor-community/speech-recognition",
  "@capacitor-community/text-to-speech",
]) {
  check(`package.json depends on ${dep}`, Boolean(pkg.dependencies?.[dep]));
}

check("service worker is present", await exists(join(root, "www/sw.js")));
check("built bundle is present (run `npm run build` if this fails)", await exists(join(root, "www/app.js")));

const icons = await readdir(join(root, "www/icons")).catch(() => []);
check("Play Store 512 icon is present", icons.includes("play-store-512.png"));
check("Play Store feature graphic is present", icons.includes("play-feature-graphic-1024x500.png"));

// ---------------------------------------------------------------------------
// 7. The Android project, if it has been generated
// ---------------------------------------------------------------------------
//
// Skipped entirely when there is no android/ folder, so the check suite still
// passes on a fresh clone. When the folder does exist these are the settings
// that produce a silently broken app rather than a build error — a missing
// permission is not a compile failure, it is a feature that quietly does
// nothing on a real phone.

if (await exists(join(root, "android"))) {
  const manifest = await readFile(join(root, "android/app/src/main/AndroidManifest.xml"), "utf8");

  for (const permission of ["RECORD_AUDIO", "INTERNET", "ACCESS_NETWORK_STATE"]) {
    check(
      `AndroidManifest declares ${permission}`,
      manifest.includes(`android.permission.${permission}`)
    );
  }
  check(
    "AndroidManifest can see the speech recogniser (Android 11+ queries)",
    manifest.includes("android.speech.RecognitionService")
  );
  check(
    "AndroidManifest can see text-to-speech voices",
    manifest.includes("android.intent.action.TTS_SERVICE")
  );
  check(
    "the microphone is optional, not required",
    /android.hardware.microphone[\s\S]{0,80}required="false"/.test(manifest)
  );

  const variables = await readFile(join(root, "android/variables.gradle"), "utf8");
  const targetSdk = Number(variables.match(/targetSdkVersion\s*=\s*(\d+)/)?.[1] || 0);
  check(
    "targetSdk is 36 or higher (Google Play requires it)",
    targetSdk >= 36,
    `found ${targetSdk}`
  );

  const settings = await readFile(join(root, "android/capacitor.settings.gradle"), "utf8");
  for (const plugin of [
    "capacitor-mlkit-translation",
    "capacitor-mlkit-language-identification",
    "capacitor-community-speech-recognition",
    "capacitor-community-text-to-speech",
  ]) {
    check(`Android project includes ${plugin}`, settings.includes(plugin));
  }

  check(
    "the web assets were copied into the Android project (run `npm run cap:sync` if this fails)",
    await exists(join(root, "android/app/src/main/assets/public/app.js"))
  );

  const launcherBg = await readFile(
    join(root, "android/app/src/main/res/values/ic_launcher_background.xml"),
    "utf8"
  ).catch(() => "");
  check("the launcher icon uses the app's colour, not the default white", launcherBg.includes("0D7A5F"));
}


// ---------------------------------------------------------------------------
// 8. The internet tier
// ---------------------------------------------------------------------------
//
// The value of this tier is entirely in its honesty. An app that quietly sends
// text to a third party while showing a green "Works offline" badge would be
// worse than one with no online mode at all, so these checks are about the
// labelling as much as the plumbing.

const onlineSource = await readFile(join(root, "src/js/engine/online-translator.js"), "utf8");
check(
  "the online translator needs no API key",
  !/api[_-]?key|apikey/i.test(onlineSource.replace(/^.*no API key.*$/gim, "")),
  "a key would require a server to hide it behind"
);
check("the online translator has a timeout", /timeoutMs/.test(onlineSource));
check("it handles the quota being exhausted", /QUOTA_EXCEEDED/.test(onlineSource));
check("it splits text that is too long rather than truncating", /MAX_CHUNK_BYTES/.test(onlineSource));

const translatorSource = await readFile(join(root, "src/js/engine/translator.js"), "utf8");
check("the engine chain is explicit", /function engineOrder/.test(translatorSource));
check("on-device is preferred when the internet is not allowed", /return \["mlkit", "phrasebook"\]/.test(translatorSource));
check("a web build with no internet allowed falls back to phrases", /return \["phrasebook"\]/.test(translatorSource));
check("every result carries the engine that produced it", /export function engineLabel/.test(translatorSource));

for (const label of ["Translated on this phone", "Translated over the internet", "From the built-in phrases"]) {
  check(`engineLabel covers "${label}"`, translatorSource.includes(label));
}

const settingsSource = await readFile(join(root, "src/js/store/settings.js"), "utf8");
check("there is a useInternet setting", /useInternet/.test(settingsSource));
check(
  "its default is platform-aware, not a single value",
  /export function internetDefault/.test(settingsSource)
);

check("index.html has the internet toggle", htmlIds.has("useInternetToggle"));
check("index.html has somewhere to name the engine", htmlIds.has("engineNote"));

// The Bulgarian speech note must not claim it is impossible — on Android with a
// connection it works, and the earlier wording sent people to typing for no
// reason.
const recogniserSource = await readFile(join(root, "src/js/engine/recogniser.js"), "utf8");
check(
  "the Bulgarian speech note mentions the online fallback",
  /uses the internet on this phone/.test(recogniserSource)
);

// ---------------------------------------------------------------------------
// 9. Publishing workflows
// ---------------------------------------------------------------------------

for (const [file, needle, why] of [
  [".github/workflows/android.yml", "npm run cap:sync", "without the sync step the app is a white screen"],
  [".github/workflows/android.yml", "npm run verify", "the checks must run before the expensive build"],
  [".github/workflows/pages.yml", "npm run build", "www/app.js is gitignored and must be regenerated"],
  [".github/workflows/pages.yml", "path: www", "only www/ should be published"],
]) {
  const path = join(root, file);
  if (await exists(path)) {
    const content = await readFile(path, "utf8");
    check(`${file} contains "${needle}"`, content.includes(needle), why);
  }
}


// ---------------------------------------------------------------------------
// 10. The online tier, against a stubbed network
// ---------------------------------------------------------------------------
//
// Kept in its own file because it replaces global fetch, and doing that in the
// middle of this one would be a nasty surprise for anything added later.

const onlineTests = (await import(pathToFileURL(join(root, "scripts/test-online.mjs")).href)).default;
passed += onlineTests.passed;
for (const failure of onlineTests.failures) failures.push(`online tier: ${failure}`);

// ---------------------------------------------------------------------------

console.log("");
if (failures.length === 0) {
  console.log(`  ✓ ${passed} checks passed.`);
  console.log("");
  process.exit(0);
}
console.log(`  ✗ ${failures.length} failed, ${passed} passed:\n`);
for (const failure of failures) console.log(`    - ${failure}`);
console.log("");
process.exit(1);
