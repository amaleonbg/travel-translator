/**
 * End-to-end smoke test in a real browser.
 *
 * Separate from `npm run verify` because it needs Playwright, which is a large
 * install and not something to require of anyone who just wants to check the
 * project is sound. Run it when changing the compose → check → show flow.
 *
 *   npx playwright install chromium   (once)
 *   node scripts/e2e.mjs
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 5199;

let passed = 0;
const failures = [];
function check(name, ok, detail = "") {
  if (ok) passed += 1;
  else failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
}

const server = spawn(process.execPath, [join(root, "scripts/dev.mjs")], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: "ignore",
});
await sleep(2500);

// PLAYWRIGHT_CHROMIUM_PATH lets a sandbox point at a preinstalled browser.
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {}
);
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const consoleErrors = [];
// A blocked network is expected here: this environment has no internet, which
// is precisely the condition the fallback chain exists for. Anything else is a
// real error and still fails the run.
const EXPECTED_OFFLINE = /ERR_TUNNEL_CONNECTION_FAILED|ERR_INTERNET_DISCONNECTED|ERR_NAME_NOT_RESOLVED|Failed to fetch|net::ERR/i;
page.on("console", (msg) => {
  if (msg.type() === "error" && !EXPECTED_OFFLINE.test(msg.text())) consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => {
  if (!EXPECTED_OFFLINE.test(String(err))) consoleErrors.push(String(err));
});

try {
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  check("page has a title", (await page.title()).includes("Travel Translator"));
  check("four language options", (await page.locator("#sourceLang option").count()) === 4);
  check("two active modes", (await page.locator("#activeMode option").count()) === 2);
  check("no role picker exists", (await page.locator("#activeRole").count()) === 0);
  check("no stats row exists", (await page.locator("#statsRow").count()) === 0);

  // --- compose by typing ---------------------------------------------------
  await page.selectOption("#activeMode", "text");
  await page.selectOption("#sourceLang", "en");
  await page.selectOption("#targetLang", "bg");
  check("text box appears when typing is chosen", await page.locator("#typedMessage").isVisible());

  await page.fill("#typedMessage", "Where is the nearest pharmacy?");
  await page.click("#composeBtn");
  await page.waitForSelector("#reviewCard:not(.hidden)", { timeout: 4000 });
  check("check step opens", await page.locator("#reviewCard").isVisible());
  check(
    "the composed text carries over",
    (await page.inputValue("#editableText")).includes("pharmacy")
  );

  // --- translate + back-translate -----------------------------------------
  await page.click("#verifyBtn");
  await page.waitForSelector("#verifyPanes:not(.hidden)", { timeout: 4000 });
  const translated = (await page.locator("#verifyTranslated").textContent())?.trim();
  const back = (await page.locator("#verifyBack").textContent())?.trim();
  check("a translation appears", Boolean(translated), translated);
  check("it is the Bulgarian phrase", translated === "Къде е най-близката аптека?", translated);
  check("a back-translation appears", Boolean(back), back);
  check("the back-translation is English again", /pharmacy/i.test(back || ""), back);

  // --- deliver -------------------------------------------------------------
  await page.click("#sendBtn");
  await page.waitForSelector("#resultCard:not(.hidden)", { timeout: 4000 });
  check("result card shows", await page.locator("#resultCard").isVisible());
  check(
    "received pane holds the translation",
    (await page.locator("#translatedText").textContent())?.trim() === "Къде е най-близката аптека?"
  );
  const meaning = await page.locator("#meaningValue").textContent();
  check("a meaning-match score is shown", /\d+%/.test(meaning || ""), meaning);

  // --- the app says where the translation came from ------------------------
  const engineNote = (await page.locator("#engineNote").textContent())?.trim();
  check("the result names the engine that produced it", Boolean(engineNote), engineNote);
  check(
    "with no network it fell back to the phrasebook and said so",
    engineNote === "From the built-in phrases",
    engineNote
  );

  const chip = (await page.locator("#offlineChip").textContent())?.trim();
  check(
    "the header chip does not falsely claim offline in the web build",
    chip !== "Works offline",
    chip
  );

  // --- rating --------------------------------------------------------------
  await page.click('#ratingButtons button[data-rating="5"]');
  await page.waitForTimeout(400);
  check("rating saves", (await page.locator("#ratingSaved").textContent())?.includes("Saved"));

  // --- log -----------------------------------------------------------------
  await page.click('.tab[data-screen="log"]');
  await page.waitForTimeout(500);
  const rowCount = await page.locator("#runsBody tr").count();
  check("the message reached the log", rowCount >= 1, `${rowCount} rows`);
  const rowText = await page.locator("#runsBody tr").first().textContent();
  check("log row shows who did what", /Types → Reads/.test(rowText || ""), rowText?.slice(0, 120));
  check("log row shows the rating", /5\/5/.test(rowText || ""));

  const headers = await page.locator("#runsTable thead th").allTextContents();
  const banned = ["Tests", "Success", "Avg conf.", "Uncertain", "Edited", "Avg rating", "Audio min.", "Avg time"];
  check(
    "no removed stat headings",
    !headers.some((h) => banned.includes(h.trim())),
    headers.join(" | ")
  );

  // --- phrasebook ----------------------------------------------------------
  await page.click('.tab[data-screen="phrasebook"]');
  await page.waitForTimeout(400);
  check("phrases render", (await page.locator(".phrase").count()) > 20);
  await page.fill("#phraseSearch", "doctor");
  await page.waitForTimeout(300);
  const filtered = await page.locator(".phrase").count();
  check("search narrows the list", filtered > 0 && filtered < 10, `${filtered} shown`);

  // --- settings ------------------------------------------------------------
  await page.click('.tab[data-screen="settings"]');
  // The capability table waits for the browser's voice list, which is only
  // announced asynchronously — and never at all in a headless browser with no
  // speech engine, so allow for the timeout.
  await page.waitForSelector(".capability-row", { timeout: 8000 });
  check("four language packs listed", (await page.locator(".model-row").count()) === 4);
  check("the internet toggle exists", (await page.locator("#useInternetToggle").count()) === 1);
  check(
    "the internet toggle defaults ON in the web build",
    await page.locator("#useInternetToggle").isChecked()
  );
  const hint = (await page.locator("#useInternetHint").textContent())?.trim();
  check("the toggle explains itself", (hint || "").length > 40, hint?.slice(0, 60));

  // Turning it off must warn that the web build is then phrases-only.
  await page.uncheck("#useInternetToggle");
  await page.waitForTimeout(400);
  check(
    "turning it off warns the web version becomes phrases-only",
    await page.locator("#internetNote").isVisible()
  );
  await page.check("#useInternetToggle");
  await page.waitForTimeout(300);
  check("capability table lists four languages", (await page.locator(".capability-row").count()) === 4);

  // --- swap ----------------------------------------------------------------
  await page.click('.tab[data-screen="translate"]');
  await page.click("#swapBtn");
  await page.waitForTimeout(300);
  check("swap flips the languages", (await page.inputValue("#sourceLang")) === "bg");
  check("swap flips the target too", (await page.inputValue("#targetLang")) === "en");

  // --- same-language guard -------------------------------------------------
  await page.selectOption("#targetLang", "bg");
  await page.waitForTimeout(300);
  check(
    "the app refuses the same language on both sides",
    (await page.inputValue("#sourceLang")) !== (await page.inputValue("#targetLang"))
  );

  // --- interface language --------------------------------------------------
  // The point of the picker is that someone who reads no English can use the
  // app, so the test asserts the *visible* text changes, not that a setting
  // was written. A stored preference that never reaches the screen is exactly
  // the bug worth catching here.
  const beforeSettings = await page.textContent("[data-i18n='tab.settings']");

  await page.selectOption("#uiLang", "bg");
  await page.waitForTimeout(400);

  const afterSettings = await page.textContent("[data-i18n='tab.settings']");
  check("switching to Bulgarian changes the interface text", beforeSettings !== afterSettings);
  check(
    "the Bulgarian interface really is Cyrillic",
    /[\u0400-\u04FF]/.test(afterSettings || ""),
    afterSettings || ""
  );
  check("nothing is left as a raw key like tab.settings", !/^[a-z]+\.[a-zA-Z]+$/.test((afterSettings || "").trim()));

  // Parts of the screen are built by JavaScript rather than marked up in the
  // HTML, and those are the ones that stay English if retranslate() misses.
  const modeOption = await page.textContent("#activeMode option");
  check("JavaScript-built dropdowns translate too", /[\u0400-\u04FF]/.test(modeOption || ""), modeOption || "");

  await page.reload();
  await page.waitForSelector("#uiLang");
  await page.waitForTimeout(600);
  check("the chosen language survives a reload", (await page.inputValue("#uiLang")) === "bg");

  await page.selectOption("#uiLang", "en");
  await page.waitForTimeout(400);
  check("switching back to English restores it", (await page.textContent("[data-i18n='tab.settings']")) === beforeSettings);

  check("the header shows the app icon, not an emoji", (await page.getAttribute("img.brand-mark", "src"))?.includes("icon-192"));

  check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" ⏎ "));

  await page.screenshot({ path: join(root, "docs/screenshot-translate.png"), fullPage: true });
} finally {
  await browser.close();
  server.kill();
}

console.log("");
if (failures.length === 0) {
  console.log(`  ✓ ${passed} browser checks passed.\n`);
  process.exit(0);
}
console.log(`  ✗ ${failures.length} failed, ${passed} passed:\n`);
for (const f of failures) console.log(`    - ${f}`);
console.log("");
process.exit(1);
