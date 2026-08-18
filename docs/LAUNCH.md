# Launching the app: web link, Android file, or both

For a translator you use yourself and share with friends — no store, no purchase, no
review process.

There are two ways to put this app in someone's hand, and they are genuinely different
products. Read the trade-off first, then follow whichever section you choose. You can do
both; they share one codebase.

---

## The trade-off, plainly

|  | **Web app** (a link) | **Android app** (a file) |
|---|---|---|
| Works on iPhone | ✅ Yes | ❌ No |
| Works on Android | ✅ Yes | ✅ Yes |
| **Translation with no signal** | ❌ **Built-in phrases only** | ✅ **All four languages, fully** |
| Translation with a signal | ✅ Good, often better on Bulgarian | ✅ Both engines available |
| Sharing | Send a link. Done. | Send a 25 MB file; they allow "unknown apps" |
| Updating everyone | Instant — you publish, they get it | Resend the file; each person reinstalls |
| Install friction | Open link → Add to Home Screen | Download → permission prompt → install |
| Cost | £0 | £0 |
| Feels like a real app | Close. No store listing, no icon in the app drawer on iOS until added | Yes — proper app, own icon, appears everywhere |
| Setup effort for you | ~30 min | ~40 min |

### The one line that matters

**A web app cannot translate offline on a phone.** Not a limitation of this app — no phone
browser has an on-device translation engine. Chrome shipped one, but Google's documentation
is explicit that it is desktop-only. So on a phone, a web app needs a connection for
anything you type freely; only the built-in phrasebook works with no signal.

If offline translation is the reason this app exists, **the Android file is the real
product and the web link is the demo**. If reach across both platforms matters more right
now, invert that.

### What I would actually do

**Both, in this order.** Publish the web app first — it takes half an hour, costs nothing,
and gives every friend on any phone something to try this week. Build the Android file
second, and send it to the Android users who will actually travel with it. The app already
tells each user honestly which mode they are in, so nobody is misled about what they have.

---

## What changed in the app for this

Three things, now in the build:

**A "Use the internet when it is available" switch** in Settings. Off by default in the
Android app (it has a real on-device engine, and offline-first is the point). On by default
in the web app (which otherwise cannot translate at all).

**Every translation says where it came from** — "Translated on this phone", "Translated
over the internet", or "From the built-in phrases", on both the check screen and the
result. This is not decoration: those three have different privacy meanings, and a user
typing a medical symptom is entitled to know which just happened.

**The header chip tells the truth per build** — "Works offline", "Online, offline backup",
"Needs internet", or "Phrases only", computed from what is actually available rather than
claimed.

The online tier uses a translation service that needs **no API key and no server of your
own**, called straight from the page. That keeps the whole no-running-costs design intact.
It has a daily free character allowance, which is ample for personal and small-group use.

---

# Route A — The web app (works on iPhone and Android)

## Step 1 — Put the code on GitHub

Create a free account at <https://github.com>, install
[GitHub Desktop](https://desktop.github.com), then **File → Add local repository** and
choose your project folder. It will offer to create a repository — accept — then press
**Publish repository**.

**Public or private?** This decides your hosting in the next step:

- **Public repo** → GitHub Pages hosting is free. Anyone can read your source code.
- **Private repo** → GitHub Pages needs a paid plan, so use Cloudflare Pages instead, which
  is free from a private repository.

*Why it matters:* if you might ever sell this, keep the source private. Public is fine if
you don't mind others reading it. Either way **the published app is public to anyone with
the link** — site visibility and repository visibility are separate.

## Step 2 — Publish it

### If your repo is public — GitHub Pages

The workflow is already written at `.github/workflows/pages.yml`.

In your repository: **Settings → Pages → Source: GitHub Actions**. Then **Actions →
Publish web app → Run workflow**.

When it finishes, the run summary shows your URL, something like
`https://yourname.github.io/mobile-translator-app-en-bg-pt-es/`.

### If your repo is private — Cloudflare Pages (recommended)

1. Sign up free at <https://pages.cloudflare.com>.
2. **Create a project → Connect to Git**, authorise GitHub, pick your repository.
3. Set:
   - **Build command:** `npm ci && npm run build`
   - **Build output directory:** `www`
4. **Save and Deploy.**

You get a URL like `https://travel-translator.pages.dev`. Free tier is 500 builds a month
and unlimited visitors — you will not get near either.

*Why a build command at all:* `www/app.js` is generated from `src/`, and generated files
are deliberately not stored in version control. The host rebuilds it.

## Step 3 — Check it on HTTPS

Open the URL on your laptop first. **The `https://` matters** — browsers refuse microphone
access, and refuse to install a web app to a home screen, on plain `http://`. Both hosts
give you HTTPS automatically.

## Step 4 — Install it on your phone

**Android:** open the link in Chrome. A banner offers to install; or use the ⋮ menu →
**Add to Home screen**. It then opens full-screen with its own icon, no browser bars.

**iPhone:** open the link in **Safari** — this does not work in Chrome on iOS. Tap the
Share button, scroll down, tap **Add to Home Screen**. The app already shows an on-screen
hint about this the first time an iPhone opens it.

## Step 5 — Share it

Send the link. That is the whole process for the other person on either platform.

Worth saying in the message: *"open it in Safari if you're on iPhone, then Share → Add to
Home Screen"* — that one sentence prevents most of the confusion.

## Step 6 — Updating

Change the code, push from GitHub Desktop, and the site rebuilds within a couple of
minutes. Everyone gets the new version next time they open it. **Nobody has to reinstall
anything.** This is the web app's real advantage over the file.

---

# Route B — The Android file (full offline translation)

## Step 1 — Get GitHub set up

Same as Route A, Step 1. If you have already done it, skip.

## Step 2 — Let GitHub build the app

The workflow is already written at `.github/workflows/android.yml`. It runs by itself on
every push, or from **Actions → Build Android APK → Run workflow**.

First run takes 8–12 minutes; later ones 3–5. You install nothing on your laptop. Full
detail in [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md).

## Step 3 — Download the file

At the bottom of the finished run page, **Artifacts** →
`travel-translator-debug-1.apk`. It downloads as a `.zip` containing the `.apk`.

## Step 4 — Install it on your phone

The neat trick: **do this from the phone itself, no cable needed.** Open github.com in your
phone's browser, sign in, go to the repository → Actions → the latest run → Artifacts →
download. Extract with the Files app, tap the `.apk`.

Android will say the app is from an unknown source and ask you to allow "install unknown
apps" for whichever app you opened it from. Allow it. This is normal for anything not from
the Play Store — you are the source it is warning you about.

## Step 5 — First run, in this order

1. **Allow the microphone.** Declining still leaves typing fully working.
2. **Download the language packs** from the banner — four packs, ~30 MB each, about two
   minutes on Wi-Fi. This is the step that buys offline translation.
3. **Turn on aeroplane mode and use it.** That is the test that matters and the whole point
   of this route.

## Step 6 — Sharing with other Android users

Send them the `.apk` — email, WhatsApp, Google Drive, a USB stick. They allow "unknown
apps" once and install it.

Tell them two things or they will hit them cold:
- Android will warn about the unknown source. That is expected.
- **They must download the language packs on Wi-Fi before travelling.**

### Debug versus signed — worth deciding before you share widely

The workflow currently produces a **debug** build. Fine for you and a few friends. Two
consequences once more people have it:

- It is marked debuggable, which is a (mild) security weakness on their phone.
- If you later switch to a properly signed build, **everyone must uninstall first** —
  Android refuses to upgrade across a change of signing key, and they lose their message
  log.

If you expect more than a handful of users, create a signing key now rather than later.
The steps are in [ANDROID-BUILD.md](ANDROID-BUILD.md) and the extra workflow lines are in
[GITHUB-ACTIONS.md](GITHUB-ACTIONS.md). About fifteen minutes, and it removes a future
migration you would otherwise have to ask people to do.

---

## Pros and cons of skipping the app stores entirely

You asked for this specifically. Both sides honestly.

### In favour

**No review, no waiting, no rejection.** You publish when you decide to. No 12-testers-for-
14-days rule, no policy questionnaire, no reviewer deciding your screenshots are wrong.

**No money and no accounts.** You skip $25 for Google Play and $99 a year for Apple. No
tax forms, no identity verification, no D-U-N-S number.

**No obligations.** Store listings come with expectations: a privacy policy, data-safety
declarations, a support address, responding to reviews, and keeping up with target-API
deadlines every year. A private app has none of that.

**You can change anything, instantly.** Especially with the web version, where a fix
reaches everyone in two minutes.

**Total privacy control.** No store analytics, no install tracking, nobody's dashboard.

### Against

**Discovery is zero.** Nobody finds it. Every single user comes from you sending a link or
a file. If the aim is ever "strangers use this", this route cannot get you there.

**No automatic updates for the Android file.** Every fix means resending the file and
asking people to reinstall. With five users that is fine. With fifty it becomes a job.
(The web version does not have this problem, which is a real argument for it.)

**Friction and suspicion for Android installs.** The "unknown apps" warning is designed to
be alarming. Some people will not proceed, and some will ask you whether it is safe — which
is a conversation, every time.

**iPhone users can only ever have the web version**, so they can only ever have the online
translator. There is no sideloading route on iOS worth the trouble.

**You cannot charge for it.** No store means no payment mechanism.

**Some phones fight you.** Certain manufacturers' security software blocks sideloaded apps
by default, and corporate-managed phones usually block them outright.

**No crash reports.** If it breaks on someone's phone, you find out only if they tell you.

### The honest summary

For **you, family and a handful of friends**, skipping the stores is clearly right — the
overhead of publishing buys you nothing at that scale. The web version is genuinely lovely
for this: one link, both platforms, instant updates.

The moment you want **strangers** to use it, or to charge for it, Google Play at $25 once
becomes worth it — and nothing in this project would need rebuilding to get there. The
Android project, the icons and the store graphics are already prepared.

---

## Quick reference

| I want to… | Do this |
|---|---|
| Try it on my own phone today | Route A, it takes 30 minutes |
| Give it to an iPhone-owning friend | Route A. It is the only option |
| Have it work on a plane, in all four languages | Route B |
| Send it to five Android friends | Route B, and read the debug-versus-signed note |
| Fix a bug for everyone at once | Route A — push, done |
| Sell it later | Keep the repo private; nothing else changes |

---

## Sources

- [Translation with built-in AI — Chrome for Developers](https://developer.chrome.com/docs/ai/translator-api) (the desktop-only limitation)
- [GitHub Pages from a private repository — plan requirements](https://smartscope.blog/en/Tips/GitHub/github-pages-private-repository/)
- [Cloudflare Pages free tier](https://freetier.co/directory/products/cloudflare-pages)
- [MyMemory translation API from browser JavaScript](https://lilting.ch/en/articles/mymemory-api)
