# GitHub Desktop — from the welcome screen to a published app

You are on the **"Let's get started!"** screen, signed in as `amaleonbg`. This picks up
exactly there.

---

## What I fixed before you press anything

Your project folder had four things in it that would have caused trouble, and one of them
would have stopped you cold:

| What | Why it mattered |
|---|---|
| `GitHubDesktopSetup-x64.exe` — **294 MB** | GitHub **rejects any single file over 100 MB**. Your very first push would have failed, with an error that does not obviously point at the installer as the cause. |
| `mt-full.tar.gz` ×2 | The transfer archives I sent you. 3.6 MB of duplicate code. |
| `_to_delete/` | 3.5 MB of old archives. |
| `~WRL0277.tmp`, `~$…docx` | Word's temporary lock files, created while your .docx is open. Committing one produces a file nobody can open. |

I moved the installer and archives into `_to_delete/` and extended `.gitignore` so none of
this category can ever creep back in.

**Why this matters more than it looks:** anything committed once stays in the repository's
history *forever*, even after you delete the file. A 294 MB installer in your history would
make every future clone of the project download it. Keeping it out in the first place is
the only cheap fix.

**Your repository will now be 118 files and about 2 MB.** That is a healthy size.

I also left your `Mobile Translator App Development.docx` out of the repository — it is
your planning document, and the repository is about to be public. If you would rather it
were included, delete that one line from `.gitignore`.

---

## Step 1 — Add the folder

On the welcome screen, click the fourth option:

> **Add an Existing Repository from your local drive…**

*Not* "Create a New Repository" — that would make an empty folder somewhere else. Your code
already exists; you are pointing GitHub Desktop at it.

Browse to, or paste:

```
C:\Users\<you>\Desktop\Mobile Translator App-EN-BG-PT-ES
```

## Step 2 — Let it create the repository

GitHub Desktop will say something like:

> This directory does not appear to be a Git repository. Would you like to **create a
> repository** here instead?

Click the **create a repository** link in that message.

*What is happening:* a folder of files becomes a *repository* when Git starts keeping a
history of it. Until now your folder was just files. This adds a hidden `.git` folder that
records every version from here on.

On the "Create a repository" screen, leave everything as it is and click
**Create repository**. Do not tick "Initialize this repository with a README" — you already
have one. Do not add a `.gitignore` or licence from the dropdowns — yours is already
written and is better suited to this project.

## Step 3 — Look at what it found, before you publish

You will now see the main window with a **Changes** tab on the left listing every file.

**Take thirty seconds on this. It is the single best habit in the whole workflow.**

You should see roughly **118 files**, and among them: `src/`, `www/`, `docs/`, `android/`,
`scripts/`, `package.json`, `README.md`.

You should **not** see: `node_modules`, anything ending `.exe`, `_to_delete`, or your
`.docx`. If you do, stop and tell me — something is not being ignored.

*Why look:* this list is exactly what becomes public. Once you understand that a glance
here prevents the most common mistakes, you have learned most of what matters about Git.

## Step 4 — Make the first commit

At the bottom left there is a **Summary** box.

Type:

```
Travel Translator: offline four-language app, web and Android builds
```

Then click **Commit to main**.

*What a commit is:* a saved snapshot with a note attached. You can return to any commit
later. Nothing has left your laptop yet — this is purely local.

## Step 5 — Publish

Click **Publish repository** at the top. In the dialog:

**Name** — change it to:

```
travel-translator
```

*Why:* this becomes part of your web address. You will get

```
https://amaleonbg.github.io/travel-translator/
```

Leaving the default folder name gives you
`https://amaleonbg.github.io/Mobile-Translator-App-EN-BG-PT-ES/`, which is miserable to
read out over the phone or type on a small keyboard.

**Description** — optional, but useful later:

```
Offline travel translator: English, Bulgarian, Portuguese, Spanish
```

**Keep this code private** — **untick it.**

*Why:* GitHub's free plan only publishes websites from public repositories. I have scanned
the whole project — no passwords, no keys, no keystores — so public is safe here. (Your
commit author email is a separate matter: see `PRIVACY-BEFORE-PUBLISHING.md`.) Public means other people can *read* your source; it does not give them any
control over it, and it does not give away ownership.

Click **Publish repository**. It takes a few seconds.

---

## Step 6 — Turn on the website

On <https://github.com/amaleonbg/travel-translator>:

**Settings** (the repository's own Settings tab, along the top — not your account
settings) → **Pages** in the left sidebar → under **Source**, change the dropdown from
*Deploy from a branch* to **GitHub Actions**.

That is the only setting. Nothing to save.

## Step 7 — Watch it build

Click the **Actions** tab.

Two workflows will run. This is expected and correct:

- **Publish web app** — 2–4 minutes. This is the one you want now.
- **Build Android APK** — 8–12 minutes. Ignore it for now; it is producing the Android file
  you will use later. It costs you nothing.

When "Publish web app" finishes green, click into it. The summary box at the top shows your
link.

**If it fails:** the workflow runs your 336 checks *before* publishing, so a failure means
nothing broken went live. Open the run and read the first red step — it names the problem.

Then go to **[ROUTE-A-WEB-APP.md](ROUTE-A-WEB-APP.md)** Step 6 onwards to test it and
install it on your phone.

---

# Best practice, for this project specifically

Not general Git advice — the handful of habits that will actually matter to you.

### 1. Look at the Changes list before every commit

Already said, worth repeating. It takes five seconds and it is how you catch a stray
installer, a file you did not mean to edit, or an accidental deletion. Everything else in
this list is downstream of this one habit.

### 2. Write commit messages for your future self

You will read these in six months trying to work out when something broke.

Good:
```
Fix Bulgarian speech note wrongly claiming offline pack is required
Add online translation tier with no API key
Remove the eight stat tiles from the message log
```

Not useful:
```
update
fixes
changes
asdf
```

The test: could you tell, from the message alone, whether this is the commit that broke
something?

### 3. Commit small and often

One change, one commit. "Fixed the Bulgarian note" and "added the phrasebook search" should
be two commits, not one. When something breaks, you want to find the single small change
that caused it, not sift through forty files.

You do not have to push every commit immediately — commit locally as you work, push when
you have something worth publishing.

### 4. Run the checks before you push

```
npm run verify
```

336 checks in about a second. The workflow runs them anyway, so a broken push simply fails
to publish rather than breaking your live app — but finding out on your own machine is
faster than waiting three minutes for a red X.

### 5. Never commit these four things

- **Anything over 100 MB** — GitHub refuses it, and by then it is awkward to remove
- **`node_modules`** — thousands of files that `npm install` recreates in a minute
- **Your Android signing keystore** (`.jks`) — the single most consequential file in the
  project when you get there. `.gitignore` already blocks it
- **Passwords, keys, tokens** of any kind

All four are already covered by `.gitignore`. This is the list for when you are tempted to
override it.

### 6. Remember that history is permanent

Deleting a file in a later commit does **not** remove it from the repository's history.
Anyone can still retrieve it. This is why the 294 MB installer mattered, and it is why you
check the Changes list rather than fixing things afterwards.

If you ever do commit something sensitive by accident, tell me — the fix exists but it is
fiddly, and the sooner it is done the better.

### 7. Ignore branches for now

Branches let several people work without colliding. You are one person. Commit to `main`,
push, done. Adding branches now would be ceremony without benefit.

### 8. Your two workflows are already free — do not worry about the cost

Every push runs both builds. On the free plan that is 2,000 Linux minutes a month; your
two builds together use about 15. You would need 130 pushes a month to notice.

If you want to stop the Android build running on every push while you focus on the web app,
say so and I will make it manual-only.

---

## Your identity in the repository

The documentation no longer contains your name or your folder layout — every example path
now reads `C:\Users\<you>\…`.

One thing the documentation cannot cover: **every commit records an author name and email
address**, taken from GitHub Desktop's settings, and on a public repository those are
visible to anyone. Set them to GitHub's no-reply address before you push — see
`docs/PRIVACY-BEFORE-PUBLISHING.md`.

---

## If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| "This directory does not appear to be a Git repository" | Expected on first add | Click the **create a repository** link in that message |
| Changes list shows thousands of files | `node_modules` is being included | Stop, and tell me — `.gitignore` is not being read |
| Push fails: "file exceeds GitHub's file size limit" | Something over 100 MB got committed | Tell me; do not just delete it, it stays in history |
| Push fails: authentication | The sign-in expired | **File → Options → Accounts → Sign out**, then sign in again |
| No **Pages** option under Settings | The repository is private | Make it public: Settings → General → scroll to the bottom → Change visibility |
| Actions tab is empty | The `.github` folder did not get committed | Check the Changes list for `.github/workflows/` |
