# Building the app in the cloud with GitHub Actions

How to get a real, installable Android app **without installing Android Studio, the
Android SDK, or Java on your laptop**.

The build configuration is already written and sitting in `.github/workflows/android.yml`.
It does nothing until you push the project to GitHub — so it is safe to have there while
you decide.

---

## What GitHub Actions actually is

GitHub is where the world stores source code. **Actions** is a feature bolted onto it: for
every change you push, GitHub can spin up a clean computer in a data centre, run a list of
instructions you have written, and give you back whatever those instructions produced.

The useful mental model: **a recipe card taped to a rented kitchen.** You do not own the
kitchen, you do not stock it, and you do not clean it. You hand over the recipe and
ingredients; a finished dish comes back. Every build starts in a spotless kitchen, so
nothing can be left over from last time.

For this project the recipe is: install Node.js and Java, run the 290 checks, build the
web code, compile the Android app, hand back an `.apk` file.

---

## Why it suits your situation specifically

**You install nothing.** No Android Studio, no 8 GB of SDK, no Java. Your laptop stays as
it is.

**It cannot half-work.** The most common frustration in mobile development is "it builds on
my machine". A fresh cloud machine every time means if it builds there, it builds
anywhere — including on a machine you have not bought yet.

**It runs your test suite whether you remember to or not.** The workflow runs `npm run
verify` *before* the expensive compile step. If a phrasebook entry is missing a Bulgarian
translation, you find out in 40 seconds rather than after a five-minute build.

**It is genuinely free at your volume.** Details below.

**It is the same machinery you will use for the Play Store release.** Nothing here is
throwaway — adding signing later is about fifteen extra lines.

---

## What happens on each build

The eleven steps in `.github/workflows/android.yml`, in plain English:

| # | Step | What it does |
|---|---|---|
| 1 | Get the code | Copies your project onto the rented machine |
| 2 | Set up Node.js | Installs Node 22, and reuses the cached packages from last time |
| 3 | Install dependencies | `npm ci` — installs *exactly* what `package-lock.json` says, so yesterday's working build cannot break because a dependency published an update overnight |
| 4 | Run the checks | Your 290 checks. Fails the build if any fail |
| 5 | Bundle and sync | Builds `www/app.js` and copies it into the Android project |
| 6 | Set up Java | JDK 21, which Gradle needs |
| 7 | Set up the Android SDK | Installs Android 36 explicitly, so the build does not start failing the month GitHub changes its default image |
| 8 | Build the APK | Gradle compiles everything, including ML Kit |
| 9 | Name the file | `travel-translator-debug-7.apk`, so you can tell builds apart |
| 10 | Upload | Attaches the file to the run so you can download it |
| 11 | Summary | Writes the file name, size and commit at the top of the page |

**Step 5 is the one worth understanding.** `www/app.js` and the copy of your web code
inside the Android project are both *build output* — they are deliberately not stored in
version control, because storing generated files there causes confusing conflicts. So they
do not exist on a fresh checkout and must be regenerated. Leave that step out and you get
an app that installs, opens, and shows a white screen.

---

## Setting it up

About 30 minutes, most of it creating an account.

### Step 1 — Create a GitHub account

<https://github.com>. Free. Use your normal email.

### Step 2 — Install GitHub Desktop

<https://desktop.github.com>. This is the friendly way to move code to GitHub without
learning Git commands. Sign in with the account from Step 1.

*Why not the command line:* you can use it, and `git` is worth learning eventually. But
for this you want the shortest path to a working build, and GitHub Desktop is a window
with a button in it.

### Step 3 — Publish the project

In GitHub Desktop: **File → Add local repository**, choose

```
C:\Users\<you>\Desktop\Mobile Translator App-EN-BG-PT-ES
```

It will say the folder is not a repository yet and offer to create one — accept.

Then press **Publish repository**, and **tick "Keep this code private"**.

*Why private matters:* a public repository is readable by anyone on the internet. That is
fine and normal for open-source projects; it is not what you want for something you intend
to sell. Private repositories still get 2,000 free build minutes a month, which is far more
than you need.

### Step 4 — Watch the first build

Go to your repository on github.com and click the **Actions** tab. A run called
**Build Android APK** will already be going. Click into it to watch each step.

**The first run takes 8–12 minutes** because Gradle downloads all the Android libraries
including ML Kit. Later runs take 3–5 minutes, because the caches are warm.

### Step 5 — Download the app

At the bottom of the finished run page there is an **Artifacts** section with
`travel-translator-debug-1.apk`. Click it to download.

GitHub always wraps artifacts in a `.zip`, so you get a zip containing the `.apk`.

---

## Getting it onto the phone

Three ways, simplest first.

**1. Straight from the phone (no cable at all).**
Open github.com in your phone's browser, sign in, go to the repository → Actions → the
latest run → Artifacts → download. Extract the zip with the Files app, tap the `.apk`.
Android asks you to allow "install unknown apps" for the app you opened it from — that is
normal for anything not from the Play Store. Allow it, and the app installs.

**2. Download on the laptop, transfer.** Email it to yourself, put it in Google Drive, or
copy it over USB. Then tap it on the phone.

**3. Automatic, later.** The workflow can be extended to attach the `.apk` to a GitHub
Release, which gives a permanent direct download link — no zip, and easy to send to a
tester. Worth doing once you have people testing; unnecessary while it is just you.

---

## What it costs

| | |
|---|---|
| GitHub account | Free |
| Private repository | Free, unlimited |
| Build minutes, Free plan | **2,000 Linux minutes per month** for private repos; unlimited for public |
| This build | ~5 minutes, so roughly **250 free builds a month** |
| Artifact storage | 500 MB free; an APK is 20–30 MB, and the workflow deletes them after 14 days |

An Android build runs on Linux, which is the cheapest machine type. (Windows costs double
and macOS ten times as much — that multiplier is why the iPhone version is the one where
build minutes become a real consideration.)

Realistically: **this will cost you nothing.**

---

## What it does not do

Being clear about the limits, because a cloud build is not a substitute for everything.

**It does not test the app.** It confirms the code compiles and your 290 checks pass. It
cannot tell you whether Bulgarian translation is good enough to sell, whether the
microphone picks you up in a windy street, or whether the layout works in your hand. Only a
phone does that.

**It is a slower loop than Android Studio.** Change a line, push, wait 4 minutes, download,
install. Android Studio does the same in about 30 seconds. For *testing builds* the cloud
is fine; for *active development* the local loop is much better. That is the honest reason
to install Android Studio eventually — not because you cannot build without it.

**Debug builds only, for now.** The APK is signed with a throwaway debug key. Fine for
testing and for sharing with friends; Google Play will not accept it. See below.

**It cannot build the iPhone version on Linux.** That needs a macOS runner, which GitHub
has, but at ten times the minute cost — around 200 free iPhone builds' worth of minutes a
month rather than 250, and it needs Apple signing certificates. Codemagic's 500 free macOS
minutes are the better route when you get there.

---

## Later: signing it for Google Play

When you are ready to publish, the same workflow builds a release. The additions:

1. Create the signing keystore (steps in [ANDROID-BUILD.md](ANDROID-BUILD.md)).
2. In your repository: **Settings → Secrets and variables → Actions**, add four secrets —
   `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
3. Add these steps to the workflow:

```yaml
      - name: Restore the signing keystore
        # Secrets are text, so the keystore travels base64-encoded and is
        # decoded here. It exists only for the life of this one build.
        run: echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/release.jks

      - name: Build a signed App Bundle
        working-directory: android
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: ./gradlew bundleRelease --no-daemon
```

Play wants an `.aab` (Android App Bundle) rather than an `.apk`, which is why the task is
`bundleRelease`.

**One warning that matters more than the rest.** The keystore is the only thing that proves
a new version comes from the same author as the old one. Lose it and you can never update
the app — you would publish a new listing and lose every review and install. Keep a copy
somewhere that is not this laptop and not only GitHub.

---

## When something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| Red X on step 4 | Your own checks failed | Read the log — it names the failing check |
| `npm ci` fails: lock file out of sync | `package.json` changed without `package-lock.json` | Run `npm install` locally, commit the updated lock file |
| Gradle: `SDK location not found` | The Android SDK step did not run or failed | Check step 7's log; it is usually a transient network error, so re-run |
| Build succeeds, app is a white screen | Step 5 was removed or failed | Confirm `npm run cap:sync` ran and produced `assets/public` |
| "Artifact not found" | The build failed before step 10 | Scroll up to the first red step |
| Out of minutes | Over 2,000 in a month | Unlikely at 5 minutes a build; if it happens, make the repo public or wait for the monthly reset |

Any run can be re-run from the top with **Re-run all jobs** on the run page. Transient
network failures during dependency downloads are the most common cause of a red build, and
a re-run fixes them.

---

## The recommendation

Set this up **when you want an app on your phone** — it is the lowest-commitment route and
it costs nothing.

Install Android Studio **when you start iterating on the app daily**, because a 30-second
loop beats a 4-minute one and by then the setup will earn itself back in a week.

The two are not alternatives. Most projects end up with both: Android Studio for
development, cloud builds for anything anyone else will install.

---

## Sources

- [GitHub Actions free tier limits](https://cicdcalculator.com/github-actions-free-tier)
- [actions/upload-artifact](https://github.com/actions/upload-artifact)
- [android-actions/setup-android](https://github.com/android-actions/setup-android)
- [Comparing CI/CD platforms for Capacitor apps — Capawesome](https://capawesome.io/blog/comparing-ci-cd-platforms-for-capacitor-apps/)
