# What "works offline" actually means

You asked for an app that is independent of the internet. This is exactly how far that
goes, where it stops, and why.

---

## The short version

| | English | Spanish | Portuguese | Bulgarian |
|---|---|---|---|---|
| **Typing → translation** | ✅ | ✅ | ✅ | ✅ |
| **Reading the result aloud** | ✅ | ✅ | ✅ | ⚠️ voice must be installed |
| **Speaking into the phone (Android)** | ✅ | ✅ | ✅ | ⚠️ offline pack must be installed |
| **Speaking into the phone (iPhone)** | ✅ | ✅ | ✅ | ❌ not possible |
| **The app opening at all** | ✅ | ✅ | ✅ | ✅ |
| **The message log** | ✅ | ✅ | ✅ | ✅ |
| **The phrasebook** | ✅ | ✅ | ✅ | ✅ |

**The core promise holds in all four languages: type a sentence, get an accurate
translation, with no signal.** The gap is only in speaking *into* the phone in Bulgarian.

---

## The one thing that needs the internet: the language packs

Translation runs on Google's ML Kit, which works on the phone against models it downloads
once. Each is about 30 MB, and there are four (English, Bulgarian, Portuguese, Spanish).

They are downloaded from **Settings → Offline language packs**, and the app prompts on
first run if any are missing. After that the app never touches the network again.

**Why English is not removable.** ML Kit pivots every translation through English
internally — Bulgarian to Portuguese is really bg → en → pt. Deleting English would break
all six language pairs, not just the two involving English. The app refuses.

**The realistic failure mode** is a user who installs the app at the airport, never opens
Settings, and lands somewhere with no data. The app guards against it with a banner on
first run and a chip in the header, but it is worth saying in the store listing too:
*download the packs before you fly.*

---

## Why Bulgarian speech is the exception

Speech recognition is not something an app can bring with it. It uses whatever engine the
phone's operating system provides.

**On iPhone**, that is Apple's `SFSpeechRecognizer`. Its on-device mode covers roughly 22
locales — Spanish and Portuguese among them, Bulgarian not. There is no setting, no
download and no plugin that adds it. Apple simply has not shipped a Bulgarian on-device
model.

**On Android**, Google's recogniser does support Bulgarian, but the offline language data
is not installed by default. The user adds it in **the Google app → Settings → Voice →
Offline speech recognition → Bulgarian**. Once installed it works with no signal. The
app's Settings screen checks whether it is there and tells the user what to do if not.

**What the app does about it.** In Settings, the "What works without internet" table is
built by asking the phone in the user's hand, not by claiming from a list. If Bulgarian
speech is unavailable, the record button is disabled and a sentence explains why and
points at typing. Typing is offline, unlimited and perfectly accurate — for the language
where speech is weakest, the fallback is the strongest option available.

---

## What it would take to close the gap

There is exactly one technology that does offline Bulgarian speech-to-text: **OpenAI's
Whisper**, compiled to run on the device (`whisper.cpp`). It is genuinely good and it
genuinely works offline. The costs are real:

- **Size.** The `tiny` and `base` models are small but transcribe Bulgarian badly. The
  `small` model is the first one worth using for Bulgarian, and it is roughly 466 MB
  bundled inside the app — turning a ~50 MB download into a ~500 MB one.
- **Speed.** On a mid-range phone, several seconds per sentence rather than the near-instant
  response of the system recogniser.
- **Effort.** It needs custom native code on both platforms; there is no maintained
  Capacitor plugin for it.
- **Review risk.** Large bundled model files and custom native audio code attract more
  scrutiny in store review, not less.

**The recommendation is to ship without it.** Get the app in front of real users with
typing as the Bulgarian input path, and see whether anyone actually asks for Bulgarian
voice. If they do, it is an additive feature for version 2 — and by then you would know
it is worth 450 MB.

---

## Text-to-speech, and the smaller Bulgarian catch

Reading the translation aloud uses the phone's installed voices. Android ships a limited
set by default and Bulgarian is often not among them; the user installs it in
**Settings → System → Languages & input → Text-to-speech output**. iPhones generally do
have a Bulgarian voice.

The app checks before offering the button, so the failure is a clear message rather than
silence — which is the specific failure worth avoiding, because a user holding a phone up
to a stranger cannot tell "no voice installed" from "they did not hear it".

---

## Privacy, which is the quiet advantage here

Because there is no server, there is nothing to have a privacy policy *about*. Messages
are translated on the device, stored on the device in IndexedDB, and deleted when the app
is uninstalled. Nothing is transmitted; there is no account, no analytics and no
identifier.

That is worth stating prominently in the store listing. Every competitor sends your voice
to a server, and a traveller describing a medical symptom or a stolen passport is
producing exactly the kind of data people would rather not upload. **Google Play's Data
Safety form for this app is "collects nothing, shares nothing"** — which is a rare and
credible thing to be able to say.

---

## Sources

- [Capacitor ML Kit Translation plugin — Capawesome](https://capawesome.io/docs/plugins/mlkit/translation/)
- [ML Kit on-device Translation — Google](https://developers.google.com/ml-kit/language/translation)
- [Available languages in on-device speech recognition on iOS](https://medium.com/@toru_furuya/available-languages-in-on-device-speech-recognition-on-ios-in-2022-8c6383fac9f2)
- [capacitor-community/speech-recognition](https://github.com/capacitor-community/speech-recognition)
- [Vosk offline speech recognition models](https://alphacephei.com/vosk/models) — checked for a Bulgarian model; there is none
