# Installing it on your Android phone

This gets the **real** app onto your phone — the one with genuine offline translation,
not the browser preview. Everything here is done from Windows.

**Time:** about 1½ hours, most of it downloads you can leave running.
**Disk:** roughly 8 GB for Android Studio and its build libraries.

The Android project is already generated and configured in the `android/` folder —
permissions, launcher icon, splash screen and all. You do not have to edit any of it.

---

## Step 1 — Install Android Studio (about 40 minutes, mostly waiting)

Download from <https://developer.android.com/studio> and run the installer. Accept every
default.

When it first opens it runs a setup wizard — let it finish. It downloads the Android SDK
(Software Development Kit) and a Java runtime, which is why it takes a while.

*Why you need it:* an Android app is compiled Java plus your web code in a wrapper.
Android Studio is what does the compiling, and it also handles talking to your phone.
There is no way to make a real installable app without it.

Then check one thing. On the welcome screen click **More Actions → SDK Manager**, and in
the **SDK Platforms** tab make sure **Android 16 (API level 36)** is ticked. Apply if you
have to tick it.

*Why API 36:* Google Play has required it for all new apps and updates since 31 August
2026. Building against anything lower means a rejected upload later, so it is worth
getting right now rather than discovering it at submission.

---

## Step 2 — Install the project's packages (about 3 minutes)

Open a terminal in the project folder (File Explorer → click the address bar → type `cmd`)
and run:

```
npm install
```

*Why this must come first:* the Android project does not contain copies of the Capacitor
plugins. It points at them, in `node_modules`. Open Android Studio before running this and
the build fails with a confusing "project not found" error.

---

## Step 3 — Put your phone into developer mode (2 minutes)

On the phone:

1. **Settings → About phone** → find **Build number** → **tap it seven times**. It will
   count down and then say "You are now a developer".
2. Go back to **Settings → System → Developer options** and turn on **USB debugging**.

*Why:* by default a phone will not let a computer install apps onto it. This is the switch
that allows it. You can turn it back off afterwards.

---

## Step 4 — Connect the phone

Plug it into the PC with a USB cable. **Use the cable that came with the phone** — a lot of
cheap cables carry power only and no data, and the symptom is simply that the phone never
appears in Android Studio.

The phone will show a prompt: *Allow USB debugging?* Tick "Always allow from this computer"
and accept.

**No cable, or the cable does not work?** Android 11 and newer can do it over Wi-Fi.
In **Developer options → Wireless debugging**, turn it on, tap **Pair device with pairing
code**, and in Android Studio use **Device Manager → Pair using Wi-Fi**. The phone and the
PC must be on the same network.

---

## Step 5 — Open the project and let it build (15–30 minutes the first time)

In Android Studio: **File → Open**, and select the **`android`** folder inside your project
folder — not the project folder itself.

```
C:\Users\<you>\Desktop\Mobile Translator App-EN-BG-PT-ES\android
```

It will start a **Gradle sync** — a progress bar at the bottom. This downloads Gradle
itself and all the Android libraries, including Google's ML Kit. It is a large one-off
download; later builds take under a minute.

*If a yellow bar appears offering to upgrade the Android Gradle Plugin: decline it.* The
version that is there works. Upgrading mid-project is a well-known way to spend an evening
fixing a build that was fine.

---

## Step 6 — Run it

At the top of the window there is a device dropdown. Your phone should be listed by name.
Select it and press the green **Run** button (▶).

The app builds, installs and opens on your phone. The first launch shows the splash screen
and then the translator.

---

## Step 7 — First launch, in this order

**7a. Allow the microphone** when asked. If you decline, typing still works — the app is
designed so that refusing never blocks you — but you will not be able to speak into it.

**7b. Download the language packs.** A banner appears at the top: *"Download the language
packs before you travel."* Tap **Download now**. It goes to Settings and fetches all four,
about 30 MB each, roughly 2 minutes on Wi-Fi.

*Why this is the only step that needs internet:* the translation engine runs on your phone,
but the language models have to get there somehow. Once they are downloaded the app never
uses the network again.

**7c. Check what your phone can actually do.** Stay on **Settings** and read the *"What
works without internet"* table. It is filled in by asking your specific phone, so it tells
you the truth for this device — including whether Bulgarian speech and the Bulgarian voice
are available on it.

---

## Step 8 — The test that actually matters

**Turn on aeroplane mode. Then use the app normally.**

Translate a few sentences in each direction. Try the phrasebook. Play a translation aloud.
Everything should work exactly as it did with Wi-Fi on.

That is the whole product promise, and it is the one test worth doing before anything else.

---

## Step 9 — Optional: build an APK you can share

If you want a file you can email to someone, or install without a cable:

```
npm run apk
```

This bundles the web code, copies it into the Android project, and runs Gradle. When it
finishes it prints the path, which will be:

```
android\app\build\outputs\apk\debug\app-debug.apk
```

Copy that onto a phone — email, Google Drive, USB, whatever — and tap it. Android will ask
you to allow "install unknown apps" for whichever app you opened it from; that is normal
for anything not from the Play Store.

*This is a debug build.* Fine for testing and sharing with friends; not signed for Play.
The signing steps for a Play release are in **[ANDROID-BUILD.md](ANDROID-BUILD.md)**.

---

## After you change the code

Every time you edit anything in `src/` or `www/`:

```
npm run cap:sync
```

Then press Run in Android Studio again.

**This is the step everyone forgets.** Skip it and Android Studio happily rebuilds the
*old* web code, which looks exactly like your change not working. If a change does not
appear on the phone, this is almost always why.

---

## When something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| Phone not in the device dropdown | Cable is charge-only, or USB debugging is off | Try the phone's own cable; re-check Developer options; unplug and replug and watch for the prompt |
| `SDK location not found` | Android Studio has not written `local.properties` yet | Let the Gradle sync finish; if it persists, **File → Sync Project with Gradle Files** |
| `Could not find :capacitor-android` | `npm install` was not run | Run it, then **File → Sync Project with Gradle Files** |
| Gradle sync hangs at 0% | Corporate proxy or firewall blocking Google's servers | Try a different network; a phone hotspot works |
| App installs but shows a white screen | Web assets did not get copied | `npm run cap:sync`, then Run again |
| Translation says "language pack not on this phone" | Exactly that | Settings → download the pack. Needs a connection |
| Record button greyed out for Bulgarian | Your phone has no offline Bulgarian recogniser | Expected — see [OFFLINE.md](OFFLINE.md). Type instead |
| "Read aloud" says no voice installed | Android ships a limited voice set | Settings → System → Languages & input → Text-to-speech output → install the voice |
| Your code change did not appear | `npm run cap:sync` was skipped | Run it |

---

## What you will have at the end

A real app on your home screen, with its own icon, that translates between English,
Bulgarian, Portuguese and Spanish with the phone in aeroplane mode. No account, no server,
no subscription, and nothing leaving the device.

When you are happy it is reliable, **[ANDROID-BUILD.md](ANDROID-BUILD.md)** covers signing
it and putting it on Google Play — including the $25 account, the 12-testers-for-14-days
rule, and the store listing assets, which are already generated in `www/icons/`.
