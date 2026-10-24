# Building for Android and publishing to Google Play

Everything here can be done from your Windows PC. No Mac is needed for the Android
version. (iPhone is a separate matter — see the last section.)

Budget roughly **half a day for the first build**, then **two to four weeks** before the
app is publicly downloadable, because of Google's closed-testing rule. That waiting period
is not wasted: it is exactly the time to run the accuracy testing in
[TESTING.md](TESTING.md).

---

## Part 1 — Install the toolchain (once)

| What | Where | Notes |
|---|---|---|
| **Node.js 20 or newer** | <https://nodejs.org> | You may already have it. Check with `node -v`. |
| **Java JDK 21** | <https://adoptium.net> | Android Studio bundles one, but a standalone JDK avoids a common class of build error. |
| **Android Studio** | <https://developer.android.com/studio> | Large download, around 1 GB. Accept the default SDK components. |

When Android Studio first opens, go to **More Actions → SDK Manager** and make sure these
are ticked:

- **SDK Platforms:** Android 16 (API 36) — this is what Google Play will require
- **SDK Tools:** Android SDK Build-Tools, Android SDK Platform-Tools, Android Emulator

Then set the environment variable Android Studio expects. In Windows, search for
"environment variables", and add:

```
ANDROID_HOME = C:\Users\<you>\AppData\Local\Android\Sdk
```

Close and reopen your terminal so it picks that up.

---

## Part 2 — Create the Android project

From the project folder:

```bash
npm install
npm run cap:add:android
```

That builds the web bundle and generates an `android/` folder — a real, ordinary Android
Studio project. It is generated, not hand-written, so if it ever gets into a strange state
you can delete the folder and run the command again.

**Whenever you change anything in `src/` or `www/`, run:**

```bash
npm run cap:sync
```

This is the step people forget. Changing the web code and rebuilding in Android Studio
without syncing gives you the *old* app, which is a maddening twenty minutes.

---

## Part 3 — Permissions and settings

Capacitor generates `android/app/src/main/AndroidManifest.xml`. Open it and confirm these
are inside the `<manifest>` element:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<queries>
  <intent>
    <action android:name="android.speech.RecognitionService" />
  </intent>
  <intent>
    <action android:name="android.intent.action.TTS_SERVICE" />
  </intent>
</queries>
```

The `<queries>` block matters. Since Android 11, an app cannot see which speech or
text-to-speech services are installed unless it declares that it wants to — and without
it, the app's capability check in Settings reports "no voice installed" on a phone that
has one.

`INTERNET` is needed only for downloading language packs. It is worth saying so in the
store listing, because a translator asking for internet permission invites exactly the
suspicion this app is designed to avoid.

Then in `android/app/build.gradle`, confirm:

```gradle
android {
    compileSdk 36
    defaultConfig {
        minSdk 24
        targetSdk 36
        versionCode 1
        versionName "1.0.0"
    }
}
```

`targetSdk 36` is the requirement for new apps and updates on Google Play from
**31 August 2026**. Since that date has now passed, submitting anything lower will be
rejected.

`minSdk 24` (Android 7) is what the generated project actually uses (see
`android/variables.gradle`) — it covers effectively every phone still in use while
satisfying ML Kit's floor.

---

## Part 4 — Run it on a real phone

The emulator is fine for layout, but useless for this app specifically: it has no real
microphone, and its speech and text-to-speech services are not the ones a real phone has.
Test on hardware.

1. On the phone: **Settings → About phone → tap "Build number" seven times**, then
   **Settings → System → Developer options → USB debugging** on.
2. Plug it into the PC and accept the prompt on the phone.
3. `npm run android` — this builds, syncs and opens Android Studio.
4. Pick your phone from the device dropdown at the top and press **Run** (▶).

First launch will ask for microphone permission and will show the "download the language
packs" banner. Download them on Wi-Fi. **Then turn on aeroplane mode and use the app** —
that is the test that matters, and it is the whole promise of the product.

---

## Part 5 — Sign the app

**This part is already done for this project** — the keystore exists, `build.gradle` reads
it, ProGuard/R8 shrinking is on for the release build type, and a GitHub Actions workflow
(`.github/workflows/android-release.yml`) builds a signed `.aab` (Android App Bundle) on
demand. What's left is entirely non-code:

1. Open `keys/travel-translator-release.jks.b64.txt` in the project folder and copy its
   one line.
2. On GitHub: **repo → Settings → Secrets and variables → Actions → New repository
   secret**, four times:
   - `ANDROID_KEYSTORE_BASE64` — the line you just copied
   - `ANDROID_KEYSTORE_PASSWORD` — from `android/keystore.properties`
   - `ANDROID_KEY_ALIAS` — `travel-translator`
   - `ANDROID_KEY_PASSWORD` — same value as `ANDROID_KEYSTORE_PASSWORD`
3. **Actions tab → Build signed Android release (AAB) → Run workflow.** The finished run's
   Artifacts section has `travel-translator-signed-N.aab` — that is the file you upload to
   Play Console.
4. **Back up `keys/travel-translator-release.jks` somewhere that is not this laptop** — a
   password manager's file storage, an encrypted USB drive, cloud storage. This is the one
   file in this whole project that cannot be regenerated. Losing it means losing the
   ability to ever update this app listing again.

The rest of this section is the manual Android Studio alternative, kept for reference —
useful if you ever need a *different* keystore, or want to sign a build without pushing to
GitHub first.

Google Play will not accept an unsigned app, and **if you lose this key you cannot ever
update the app again** — you would have to publish a new listing and lose your reviews and
installs. Back it up somewhere that is not this laptop.

In Android Studio: **Build → Generate Signed App Bundle / APK → Android App Bundle →
Create new…**

- **Key store path:** somewhere *outside* the project folder, e.g. `C:\Users\<you>\keys\travel-translator.jks`
- **Password:** a real one, stored in your password manager
- **Alias:** `travel-translator`
- **Validity:** 30 years (Play requires at least 25)

Then create `android/keystore.properties` — the `.gitignore` already excludes it:

```properties
storeFile=C:/Users/<you>/keys/travel-translator.jks
storePassword=YOUR_PASSWORD
keyAlias=travel-translator
keyPassword=YOUR_PASSWORD
```

And in `android/app/build.gradle`, above the `android { }` block:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file("keystore.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

and inside `android { }`:

```gradle
signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

Now `Build → Generate Signed App Bundle` produces
`android/app/release/app-release.aab`. That `.aab` is what you upload.

---

## Part 6 — Google Play

**The account.** <https://play.google.com/console> — **$25, one-off, for life**. Google now
requires identity verification (a photo ID and, for an organisation account, a D-U-N-S
number). Allow a few days for that to clear; do it early rather than when you are ready to
ship.

**The closed-testing rule.** This is the one that surprises people. A personal developer
account must run a **closed test with at least 12 testers who stay opted in for 14
consecutive days** before you can apply for production access. Twelve real Google accounts —
friends, family, colleagues. Start recruiting before you need them.

**Store listing.** The assets are already generated in `www/icons/`:

| Asset | File | Notes |
|---|---|---|
| App icon | `play-store-512.png` | 512×512, no transparency |
| Feature graphic | `play-feature-graphic-1024x500.png` | 1024×500 |
| Screenshots | take your own | At least 2, phone size. Screenshot the Translate screen mid-result, and the Settings capability table. |

**Content questionnaires.** Play will ask you to complete:

- **Data safety** — answer honestly and it is a very short form: *no* data collected, *no*
  data shared, data stored on-device only. This is a genuine selling point, so say it in
  the description too.
- **Content rating** — this app rates as Everyone.
- **Privacy policy** — required even for an app that collects nothing. A single page
  saying "this app collects nothing, stores everything on your device, and sends nothing
  anywhere" is sufficient, hosted anywhere public.
- **Ads declaration** — no ads.

**Suggested short description** (80 characters max):

> Translate offline between English, Bulgarian, Portuguese and Spanish.

**Opening line of the long description** — lead with the thing nobody else leads with:

> No signal, no roaming, no problem. Travel Translator works entirely on your phone, so it
> keeps translating on a mountain road, in an airport basement, or anywhere your data
> plan does not reach.

---

## Part 7 — Charging for it

You asked about making it purchasable. Two routes:

**Paid up front.** Set a price in Play Console under **Monetise → App pricing**. Simplest
possible thing, no code changes at all. Note that Play does not allow switching a free app
to paid later — you can only go paid → free. So if you intend to charge, set the price
before the first public release.

**Free with a paid upgrade.** Needs Google Play Billing and a real decision about what is
behind the paywall. Given the app's whole pitch is "it just works offline", crippling
that is self-defeating. If you go this way, the honest split is: all four languages and
unlimited translation free, and charge for something additive — saved favourites, more
languages, conversation history sync. That is a later release, not this one.

Given the effort involved, **paid up front at a low price is the right first move**, and
you can revisit once you know whether anyone buys it.

---

## Later: the iPhone version

The codebase is already ready — `npx cap add ios` and it builds. What Apple requires that
Google does not:

- **A Mac.** Xcode only runs on macOS. There is no legal way around this. A cloud Mac
  service (MacStadium, Codemagic, or GitHub Actions' macOS runners) is the alternative if
  you do not want to buy hardware.
- **$99 per year**, not $25 once.
- **CocoaPods** installed, and an iOS deployment target of **15.5 or higher** — that is
  ML Kit's floor, not ours.
- **Two Info.plist entries**, or the app crashes the first time it asks for the microphone:
  `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription`.

And the thing to decide before you start: **Bulgarian speech input will not work on
iPhone**, offline or otherwise, because Apple's recogniser has no Bulgarian. Everything
else does. The app already handles it gracefully, but it is worth knowing that the iPhone
version is slightly less capable than the Android one, through no fault of the code.
