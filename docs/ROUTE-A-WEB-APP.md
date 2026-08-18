# Route A — publishing the web app, step by step

At the end of this you will have a link. Anyone you send it to, on an iPhone or an
Android phone, can open it and add it to their home screen where it behaves like a real
app. No store, no account for them, no cost to you.

**Time:** about 30 minutes, most of it creating a GitHub account.
**Cost:** £0.
**Installed on your laptop:** nothing new beyond one small app for moving files.

---

## Before you start — what you are agreeing to

Two honest points, so nothing surprises you later.

**The published app is public.** Anyone with the link can use it. That is what makes it
shareable, and it is also why there is no password on it. Do not treat the URL as secret.

**On a phone, this version needs a connection to translate free text.** The built-in
phrases work offline; anything you type yourself does not. That is not a flaw in this app —
no phone browser has an on-device translation engine. The Android file (Route B) is the one
that translates offline. The app says which mode it is in at the top of the screen, so
neither you nor anyone you share with will be misled.

---

## Step 1 — Create a GitHub account

Go to <https://github.com> and sign up. Free, use your normal email.

*Why GitHub at all:* it is where the code will live, and it is also what will build and
host the app for you. One account covers both, which is why it is worth the ten minutes.

---

## Step 2 — Install GitHub Desktop

<https://desktop.github.com>. Install it, open it, and sign in with the account from
Step 1.

*Why:* moving files to GitHub is normally done with typed commands. GitHub Desktop is a
window with buttons that does the same thing. You never have to learn the commands.

---

## Step 3 — Publish your project

In GitHub Desktop: **File → Add local repository**, and choose

```
C:\Users\<you>\Desktop\Mobile Translator App-EN-BG-PT-ES
```

It will say this folder is not a repository yet and offer to create one — click
**create a repository**, then **Create repository** on the next screen.

Now click **Publish repository** at the top. A dialog appears. Three things to set:

**Name.** It defaults to your folder name, which becomes part of your web address. Change
it to something short:

```
travel-translator
```

*Why it matters:* your link will be `https://yourname.github.io/travel-translator/`.
Leaving the default gives you `.../Mobile-Translator-App-EN-BG-PT-ES/`, which is a
miserable thing to read out over the phone.

**Keep this code private — untick it.**

*Why:* on GitHub's free plan, the free web hosting only works from a **public** repository.
Making it private needs a paid plan. Your code contains no passwords and no keys — I
checked — so public is safe here. The only thing public means is that other people can read
the source. (If you would rather keep it private, skip to *"Keeping the code private"* at
the bottom; it is free too, just a different host.)

**Then click Publish repository.**

---

## Step 4 — Turn on hosting

On <https://github.com>, open your new `travel-translator` repository.

1. Click **Settings** (the tab along the top of the repository, not your account settings).
2. In the left sidebar, click **Pages**.
3. Under **Source**, change the dropdown from *Deploy from a branch* to **GitHub Actions**.

That is the whole configuration. There is nothing to save — it applies immediately.

*Why this step exists:* GitHub will not publish a website unless you ask it to. Choosing
"GitHub Actions" tells it to use the build instructions already in your project rather than
just dumping the raw files.

---

## Step 5 — Build and publish it

Click the **Actions** tab at the top of your repository.

You should see a workflow called **Publish web app**. It may already be running — pushing
the code triggered it. If not, click it, then **Run workflow → Run workflow**.

Watch it go. It takes **2–4 minutes** and does four things: installs the project's
packages, runs the 336 checks, builds the app, and publishes it.

**When it finishes**, click into the completed run. At the top you will see a summary
box with your address, something like:

```
https://amaleonbg.github.io/travel-translator/
```

That is your app. Write it down.

*If the checks fail,* the run stops and does not publish — which is the point of running
them. The log names exactly which check failed.

---

## Step 6 — Check it on your laptop first

Open the URL in Chrome or Edge.

Three things to confirm before you put it on a phone:

1. **The address starts with `https://`.** It will. This matters: browsers refuse
   microphone access and refuse home-screen installation on plain `http://`.
2. **The header shows "Needs internet"** in amber. That is correct and honest for the web
   version — it is telling you the truth about what it can do.
3. **Type something and translate it.** Set English → Bulgarian, choose *Text (types)*,
   type `I have lost my passport`, press **Continue**, then **Translate & check**.

Under the result it should say **"Translated over the internet"**. That label is the app
telling you which engine answered — it will say *"From the built-in phrases"* when it used
the offline phrasebook instead.

---

## Step 7 — Install it on your Android phone

Open the link in **Chrome** on the phone.

Chrome usually shows a banner offering to install it. If it does not, tap the **⋮** menu →
**Add to Home screen** → **Install**.

It now sits in your app drawer with the green А/Б icon, and opens full-screen with no
browser address bar. It genuinely looks like an app.

---

## Step 8 — Install it on an iPhone

Open the link in **Safari**. This is the one strict rule: **Add to Home Screen does not
work from Chrome on an iPhone**, only Safari. Apple's restriction, not ours.

Then: tap the **Share** button (the square with the arrow, at the bottom), scroll down the
list, tap **Add to Home Screen**, then **Add**.

The app already shows an on-screen hint explaining this the first time an iPhone opens it,
so people you share with are not left guessing.

---

## Step 9 — Test it properly

You said you want to test the web app before doing the Android one. This is the list worth
working through, in order of how likely it is to matter.

### The basics

- [ ] Opens on your Android phone
- [ ] Opens on an iPhone, if you have one to hand
- [ ] Installs to the home screen on both, with the right icon
- [ ] Opens full-screen from the home screen, no browser bars

### Translation quality — the part that decides whether it is any good

- [ ] **English → Bulgarian**, ten real sentences. This is the hard pair.
- [ ] **Bulgarian → English**, ten sentences
- [ ] English ↔ Spanish and English ↔ Portuguese, a handful each
- [ ] **Bulgarian → Portuguese** — this is the worst case, and worth knowing about
- [ ] Read the back-translation every time. Does it still say what you meant?
- [ ] Watch the **Meaning match** percentage. Anything under about 35% deserves a careful read.
- [ ] Rate each one 1–5 and add a label. Then **Log → Export CSV** and read the lot in Excel.

Use sentences you would really send, not clever test cases:

> "My flight was cancelled and I need to get to the airport tomorrow morning."
> "I am allergic to penicillin. Is there anything in this that contains it?"
> "The heating in the apartment has stopped working and it is very cold."
> "I think I have left my passport in the taxi."

### Speaking and listening

- [ ] Android Chrome: choose *Audio (speaks)*, tap the button, speak English. Does it hear you?
- [ ] Same in Bulgarian. On Android this should work with a connection.
- [ ] Set the passive user to *Audio (listens)* and check it reads the translation aloud
- [ ] iPhone Safari: try speaking. It works, but is less reliable than Android — worth knowing before someone reports it as broken.

### The offline behaviour, which is the interesting bit

- [ ] Turn on **aeroplane mode** with the app open
- [ ] Tap **Phrases** and use a stored phrase — this should still work perfectly
- [ ] Now type something free and translate it — it should fail with a **clear, useful message**, not a spinner that never stops or a silent nothing
- [ ] Close the app entirely and reopen it in aeroplane mode — **it should still open**, not show a browser error page

That last one is the service worker doing its job, and it is worth confirming.

### The awkward cases

- [ ] Translate a long paragraph — several sentences. It gets split and rejoined behind the scenes; check nothing is lost off the end.
- [ ] Try both languages set the same — the app should refuse and say why
- [ ] Set it to Bulgarian and check the Cyrillic displays properly everywhere, including in the exported CSV
- [ ] Fill the log with 20 messages, then delete a few with the tick boxes

---

## Step 10 — Share it

Send the link. That is it.

Worth including this sentence in the message, because it prevents most of the confusion:

> "If you're on an iPhone, open it in **Safari**, then tap Share → Add to Home Screen.
> On Android, Chrome will offer to install it. It needs a connection to translate."

---

## Step 11 — Updating it later

Make a change, open GitHub Desktop, type a short description in the box at the bottom left,
click **Commit to main**, then **Push origin**.

Two minutes later the site rebuilds and **everyone who opens the app gets the new version**.
Nobody reinstalls anything.

This is the web app's real advantage over the Android file, and the reason it is worth
having even after you build the Android one.

*(The app is set up to check for a new version each time it opens, while still keeping a
copy on the phone so it opens with no signal. You get both.)*

---

## When something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| No **Pages** option in Settings | Repository is private on a free plan | Make it public, or use Cloudflare below |
| Actions tab shows a red X | A check failed — the site was not published | Open the run, read the failing step |
| "There isn't a GitHub Pages site here" | The workflow has not finished, or Source is still *Deploy from a branch* | Wait, then re-check Step 4 |
| Page loads but is unstyled | The build did not run; raw files were published | Confirm Source is **GitHub Actions**, not a branch |
| Header says "Phrases only" | The internet switch is off | Settings → tick *Use the internet when it is available* |
| Translation fails on iPhone | Occasionally the daily free allowance | It resets daily; the message says so |
| No "Add to Home Screen" on iPhone | Opened in Chrome, not Safari | Reopen the link in Safari |
| Microphone does nothing | Permission was declined, or the page is not on HTTPS | Check the address bar; re-allow in site settings |
| Your change did not appear | The push has not finished building | Check the Actions tab; give it two minutes |

---

## Keeping the code private instead

If you would rather nobody could read the source — worth it if you might sell this one day —
use Cloudflare Pages instead of GitHub Pages. It is also free and works from a private
repository.

1. Tick **Keep this code private** in Step 3.
2. Sign up at <https://pages.cloudflare.com> (free).
3. **Create a project → Connect to Git**, authorise GitHub, pick your repository.
4. Set **Build command** to `npm ci && npm run build`, and **Build output directory** to
   `www`.
5. **Save and Deploy.**

You get an address like `https://travel-translator.pages.dev`. Free tier is 500 builds a
month; you will not get close. Steps 6 onwards are identical.

*Note:* the published app is still public to anyone with the link. Only the source code is
private.

---

## Before you make it public

The project files carry no passwords, keys or keystores, and the documentation no longer
contains your name or folder layout.

The one thing left is the **commit author details**, which Git records on every commit and
which are public on a public repository. See
`docs/PRIVACY-BEFORE-PUBLISHING.md` — it is a five-minute fix and it is much easier to do
before your first push than after.

---

## Then what

Once you have tested the web app and know whether the translation quality is good enough,
Route B gives you the Android file with **full offline translation in all four languages**.
It reuses everything you have just set up — same repository, same GitHub account, one extra
workflow that is already written.

See [LAUNCH.md](LAUNCH.md) for the comparison, and [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md)
for how that build works.
