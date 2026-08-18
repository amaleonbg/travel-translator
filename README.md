# Travel Translator — English · Български · Português · Español

A translator for travellers that **works with no internet connection**. No server, no
account, no API key, no per-message cost. Translation happens on the phone itself, using
language packs downloaded once over Wi-Fi.

Built as an Android app (Google Play first) from a single codebase that also runs in a
browser, so the whole thing can be developed and demonstrated on a laptop.

---

## What it does

**Two people, one phone.** One of you is the *active* user — you speak or type. The other
is the *passive* user — they read the screen or listen to the phone say it. No roles, no
accounts, no setup: just pick which of you is doing which.

**It checks itself before you show anything.** Every message is translated, and then the
translation is translated *back* into your own language. You read the round trip before
handing the phone over. This is the single most valuable thing in the app — you cannot
judge whether Bulgarian says what you meant, but you can absolutely judge whether the
English it turns back into still does.

**A built-in phrasebook.** Around sixty sentences that actually come up — pharmacy,
tickets, allergies, lost passport — in all four languages, needing no engine at all.

**A message log on the phone.** Every exchange, searchable and exportable to CSV. It never
leaves the device.

---

## Quick start on your laptop

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

This is the **browser preview**. Everything works — the flow, the log, the phrasebook, the
layout — except that translation comes from the built-in phrasebook rather than the real
engine, because ML Kit only exists on a phone. The header says `Browser preview` so this
is never in any doubt.

To check the whole thing is sound:

```bash
npm run verify        # 277 checks, no dependencies beyond Node
```

## Getting it onto an Android phone

The `android/` folder is already generated and configured — permissions, Android 11+
`<queries>`, launcher icon and splash screen are all in place. You need Android Studio,
then:

```bash
npm install                # must come first: the Android project points at node_modules
npm run android            # build, sync, and open Android Studio — then press Run
npm run apk                # or: produce an installable .apk file to copy onto a phone
```

Step-by-step with explanations: **[docs/INSTALL-ON-ANDROID.md](docs/INSTALL-ON-ANDROID.md)**.
Signing and the Play Store submission: **[docs/ANDROID-BUILD.md](docs/ANDROID-BUILD.md)**.
All of it can be done from Windows.

**After any code change, run `npm run cap:sync`** before rebuilding, or the phone gets the
previous version. This is the single most common cause of "my change did nothing".

---

## What works without a connection

| | English | Spanish | Portuguese | Bulgarian |
|---|---|---|---|---|
| **Typing → translation** | ✅ offline | ✅ offline | ✅ offline | ✅ **offline** |
| **Reading it aloud** | ✅ offline | ✅ offline | ✅ offline | ⚠️ needs the voice installed |
| **Speaking into it** | ✅ offline | ✅ offline | ✅ offline | ❌ **not on iPhone**, needs the pack on Android |

The one honest limitation: **Apple's on-device speech recogniser does not support
Bulgarian**, and no plugin changes that. On Android it works if the user has installed the
offline pack. The app checks this at runtime, says so plainly in Settings, and steers the
user to typing — which is always offline, always available and always perfectly accurate.

The full explanation, and what it would take to remove the limitation, is in
**[docs/OFFLINE.md](docs/OFFLINE.md)**.

---

## How it is put together

```
src/js/
  main.js              The compose → check → show flow, and all the wiring
  languages.js         The four languages. One source of truth.
  modes.js             Active/passive × audio/text. Replaces the old role picker.
  util.js              Formatting, the meaning-overlap score, toast, clipboard
  engine/
    platform.js        Native shell or browser? Everything else asks this.
    translator.js      ML Kit offline translation + the browser fallback
    recogniser.js      Speech in, and the honest capability reporting
    speaker.js         Speech out
    models.js          Language pack download / delete / check
  store/
    log.js             The message log (IndexedDB) and CSV export
    settings.js        Preferences
  ui/
    logtable.js        The Message Log table
    phrasebook.js      The Phrases screen
    settings-screen.js Language packs, toggles, capability table
  data/
    phrasebook.js      The phrases themselves

www/                   Static assets, and the built bundle (app.js)
scripts/
  build.mjs            esbuild bundle
  dev.mjs              Static server + watcher for the browser preview
  verify.mjs           277 checks: data, wiring, packaging
  e2e.mjs              Browser smoke test of the whole flow (needs Playwright)
docs/                  Build, offline, testing and recommendation notes
```

Each engine module has two implementations — the native one and a browser one — and
`engine/platform.js` is the only file that decides which is in use. That is what lets the
whole app be developed on a laptop without pretending the laptop is a phone.

---

## Differences from the Amaleon Voice Translator

This started from `Claude-Amaleon-Voice_Translator` and changed in four deliberate ways:

1. **No server, no Google Cloud, no API key.** The old app sent audio to Google Cloud
   Speech-to-Text and Translation. This one does everything on the device. That removes
   the running cost, the spend meter, the budget cap, the offline queue and the entire
   `server/` directory — none of which have anything to guard any more.
2. **No role picker.** Guest / Host / Owner / Cleaner / Maintenance / Agency made sense
   for a lettings business. A traveller is not a role in someone's business. What is left
   is Active user and Passive user, each with a dropdown for Audio (speaks/listens) or
   Text (types/reads).
3. **Four languages instead of six.** French and German are gone.
4. **The eight aggregate tiles are gone** from the Message Log — Tests, Success, Avg conf.,
   Uncertain, Edited, Avg rating, Audio min., Avg time. `npm run verify` fails if any of
   them reappears.

Kept: the review-before-send flow, the back-translation check, the 1–5 accuracy rating,
the label field, CSV export, the select/delete tick boxes, dark mode, install-to-home-screen
and the offline shell.

---

## Licence

Private. Not for redistribution.
