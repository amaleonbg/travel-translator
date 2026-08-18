# Evaluation: Google AI Studio, and cross-platform routes for iPhone

Written in response to two questions: should the app be built with Google AI Studio
instead, and what cross-platform option should be used if iPhone users are included.

---

## Short answer

**Google AI Studio is the wrong tool for this app** — not because it is a bad tool, but
because everything it builds depends on a live internet connection to Google's servers,
which is the one thing you specifically ruled out. It would also not save you from
installing Android Studio.

**You already have cross-platform.** Capacitor, which this app is built on, targets Android
and iPhone from the same code. Adding iPhone is one command, not a rewrite. Switching to
Flutter or React Native would mean starting again for no gain.

**You can test on a phone without installing Android Studio**, using a free cloud build.
That is the practical answer to "not yet" — see the last section.

---

## 1. Google AI Studio

### What it actually is

Google AI Studio is a tool for building apps *powered by the Gemini models*. Its Build tab
takes a description in plain English and generates a working app. As of 2026 it produces
two kinds:

- **Web apps** — React frontend with a Node.js backend, deployed to Google Cloud Run.
- **Android apps** — Kotlin and Jetpack Compose source code, which you can preview in a
  browser emulator and then install on a device.

It is genuinely impressive, and for a different app it would be a reasonable starting
point.

### Why it does not fit this one

**It is online by design.** Gemini API calls are made from server-side code with a
server-held key. Every translation would be a round trip to Google. Your requirement was
that the app is independent of the internet — this inverts that completely. A traveller in
a dead spot gets nothing.

**It brings back the running costs you just removed.** An API (Application Programming
Interface) key, per-request billing, a spend cap to police, a server to keep up, and a
privacy policy with real substance to it. The current app has none of those, deliberately.

**It does not avoid Android Studio.** AI Studio hands you Kotlin source code, not an
installable file. You would still install Android Studio to build it — so it costs you the
setup *and* the rewrite.

**It is Android only.** There is no iPhone output. That makes your second question harder,
not easier.

**You would be discarding working software.** The current app passes 290 automated checks
and 28 browser checks, handles the offline edge cases, and has the review-before-send flow
you asked to keep. Regenerating it from a prompt starts that at zero.

### Where AI Studio genuinely would help you

It is a good tool pointed at the right job. Three that fit:

1. **Expanding the phrasebook.** Ask it to draft 150 travel phrases in the four languages,
   grouped by situation. You paste the result into `src/js/data/phrasebook.js`. No
   dependency added, no architecture change — content is content.
2. **Store listing copy.** Descriptions, keyword research, the privacy policy page.
3. **Prototyping a version 2 feature** before committing to building it — the camera
   translation idea, say — to see whether it feels worth the effort.

None of these touch the app's architecture, which is the point.

---

## 2. Cross-platform — you already have it

This is the part worth being clear about, because it changes the question.

**Capacitor is a cross-platform framework.** Your app is one codebase that already produces
both an Android app and an iPhone app. The `android/` folder exists because I generated it;
`npx cap add ios` generates the iPhone equivalent from exactly the same code. There is
nothing to port.

The offline translation plugin, `@capacitor-mlkit/translation`, supports Android **and**
iOS. So does the speech and the text-to-speech. Nothing in the app is Android-specific.

### If you switched framework anyway

| | Capacitor **(current)** | Flutter | React Native | Google AI Studio |
|---|---|---|---|---|
| Android + iPhone from one codebase | ✅ | ✅ | ✅ | ❌ Android only |
| Offline ML Kit translation available | ✅ | ✅ | ⚠️ less-maintained library | ❌ cloud only |
| Reuses your existing app | ✅ 100% | ❌ full rewrite | ❌ full rewrite | ❌ full rewrite |
| Mac needed for iPhone | Yes* | Yes* | Yes* | n/a |
| Language you'd write in | HTML/CSS/JavaScript | Dart | JavaScript | Kotlin |
| Effort from here | **zero** | 3–6 weeks | 3–6 weeks | 2–4 weeks |

\* Apple's requirement, not the framework's — see below.

Flutter is an excellent framework and if you were starting today with no code, it would be
a defensible choice. You are not starting today. **Switching buys you nothing you do not
already have and costs you everything you have already built.**

---

## 3. The Mac problem, and how to get around it

The single real obstacle to an iPhone version is that **Apple only allows iPhone apps to be
compiled on macOS**. No framework changes this. Flutter does not, React Native does not,
Capacitor does not. It is a licensing decision by Apple, not a technical one.

Three ways round it:

**A. Cloud Mac build service.** A company rents you a Mac in a data centre that builds your
app. **Codemagic** gives individuals **500 free macOS minutes a month**, and standard
Capacitor projects build with no configuration file to write. A build takes roughly 10–15
minutes, so the free tier covers real use. Beyond that it is about $0.095 per minute.

**B. Borrow or buy a Mac.** A second-hand Mac mini is the cheapest route if you expect to
iterate a lot. Only worth it if iPhone becomes a serious line of the business.

**C. Skip iPhone for now.** Perfectly reasonable. Android is roughly 70% of phones
worldwide and higher in Bulgaria and Portugal.

### What iPhone actually costs

| | Cost | What it gets you |
|---|---|---|
| Free Apple ID | £0 | Install on your **own** iPhone, up to 3 devices — but the app **stops working after 7 days** and must be reinstalled. Fine for testing, not for users. |
| Apple Developer Program | **$99/year** | TestFlight (beta testing with other people) and App Store publishing. |
| Codemagic cloud Mac | Free for 500 min/month | Builds without owning a Mac. |

Compare with Google Play: **$25 once, for life**. That difference alone is a fair reason to
prove the app on Android first.

### One thing to decide before committing to iPhone

**Spoken Bulgarian input will never work on iPhone.** Apple's on-device speech recogniser
has no Bulgarian and no plugin adds one. Typing and translation work perfectly; speaking
into it in Bulgarian does not. The app already handles this gracefully, but the iPhone
version is permanently slightly less capable than the Android one, through no fault of the
code. Full detail in [OFFLINE.md](OFFLINE.md).

---

## 4. Testing on a phone without installing Android Studio

Since you would rather not set up Android Studio yet, here are the three routes, in the
order I would try them.

### Route A — Free cloud build, then install the file (recommended)

Put the project on GitHub as a **private** repository and let **GitHub Actions** build the
Android app for you. It runs on Google's and GitHub's machines; you install nothing.

- **Cost:** free. The Free plan includes 2,000 Linux minutes a month for private
  repositories, and unlimited for public ones. An Android build is a Linux build, so it
  costs about 5 of those minutes.
- **What you get:** an `.apk` file to download and tap on your phone.
- **What it costs you:** about 30 minutes of one-off setup, most of it creating a GitHub
  account.

I can write the build configuration for you whenever you want it — it is one file and does
not require building anything locally.

### Route B — Codemagic

Same idea, but purpose-built for Capacitor apps and it does iPhone too when you get there.
Connect the repository and press build; no configuration file to write. 500 free macOS
minutes a month.

Slightly less setup than Route A, but it is a third-party account and the free tier is
smaller. Worth choosing over Route A **if** you think iPhone is coming soon, since the same
setup covers both.

### Route C — Install it as a web app (zero setup, but limited)

The app can be added to a phone's home screen straight from the browser, on Android **and**
iPhone, with nothing installed on either side.

**Be clear about what this does and does not test.** It gives you the real layout, the real
flow, the real message log, the phrasebook, and the offline shell. It does **not** give you
ML Kit — so translation falls back to the built-in phrasebook only, exactly as in the
laptop preview. It also needs HTTPS for the microphone, which needs a certificate.

So it is a good way to check the app *feels* right in your hand, and a poor way to judge
whether the translation is good enough to sell. Those are different questions, and only the
second one gates your launch.

---

## 5. What I would do

1. **Stay on Capacitor.** You have a working cross-platform app. Do not restart it.
2. **Use Google AI Studio for content, not architecture** — the phrasebook expansion is a
   genuinely good use of it.
3. **When you are ready to test on a phone, use a free cloud build** rather than installing
   Android Studio. You get an installable file and touch nothing on your laptop.
4. **Prove it on Android first.** $25 once versus $99 a year, no Mac needed, and Bulgarian
   speech input actually works there.
5. **Add iPhone once Android has real users**, via a cloud Mac. It is one command plus a
   build service — a day's work, not a project.

Install Android Studio only when you want the tight edit-run-see loop of active
development. For testing a build, it is optional.

---

## Sources

- [Build apps in Google AI Studio — Google AI for Developers](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
- [Comparing CI/CD platforms for Capacitor apps — Capawesome](https://capawesome.io/blog/comparing-ci-cd-platforms-for-capacitor-apps/)
- [Codemagic pricing](https://docs.codemagic.io/billing/pricing/)
- [GitHub Actions free tier limits](https://cicdcalculator.com/github-actions-free-tier)
- [Apple Developer Program: free vs paid](https://bitrig.com/blog/apple-developer-program-free-vs-paid)
- [Capacitor ML Kit Translation plugin — Android and iOS](https://capawesome.io/docs/plugins/mlkit/translation/)
- [google_mlkit_translation — Flutter package](https://pub.dev/packages/google_mlkit_translation)
