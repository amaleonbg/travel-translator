# Running it on your laptop

The quickest possible look at the app. No installing, no accounts, no phone.

---

## Step 1 — Check you have Node.js

Open a terminal and type:

```
node -v
```

You want `v20` or higher. If you get "not recognised", install it from
<https://nodejs.org> — take the **LTS** (Long Term Support) version and accept every
default.

*Why:* Node.js is the thing that runs JavaScript outside a browser. It is what serves the
app to your browser. You almost certainly already have it, because the previous
translator project used it.

---

## Step 2 — Open a terminal in the project folder

In **File Explorer**, go to:

```
C:\Users\<you>\Desktop\Mobile Translator App-EN-BG-PT-ES
```

Click in the address bar at the top, type `cmd`, press Enter.

*Why:* this opens a command prompt already pointing at the right folder, so you do not
have to type the path. (In VS Code you can instead use **Terminal → New Terminal**, which
does the same thing.)

---

## Step 3 — Start it

```
node scripts/dev.mjs
```

You should see:

```
  Travel Translator — browser preview
  http://localhost:5173
```

*Why no `npm install` first:* the app is shipped already built, in `www/app.js`. This
command starts a small web server that hands those files to your browser. Nothing is
downloaded and nothing is installed.

**Leave this window open.** The server runs for as long as it does. Press **Ctrl+C** to
stop it.

---

## Step 4 — Open it

Go to <http://localhost:5173> in Chrome or Edge.

You will see the app, with two labels in the header:

- **Works offline** — green. The app's promise.
- **Browser preview** — amber. This is the honest one: you are on a laptop, and Google's
  ML Kit translation engine only exists on a phone. Here the built-in phrasebook stands in
  for it. Everything else — the flow, the log, the phrasebook, the layout, the settings —
  is exactly what runs on the phone.

---

## Step 5 — See it at phone size

Press **F12**, then click the small phone/tablet icon at the top-left of the panel that
opens. Choose a device from the **Dimensions** dropdown.

*Why:* the layout changes below 480 pixels wide — the language pickers stack, the tab bar
sits at the bottom. This is the layout that matters, and a desktop window does not show it.

---

## Step 6 — Try these three, in order

**1. The phrasebook (simplest — no engine at all)**

Tap **Phrases** at the bottom. Tap **"Water, please"**. It loads into the message box and
translates straight away. Around sixty sentences are built in, in all four languages, and
they need no translation engine — which is why they always work.

**2. Type and check (the normal path)**

Tap **Translate**. Set **Active user** to *Text (types)*, languages **English → Bulgarian**.
Type `I am allergic to nuts` and press **Continue**, then **Translate & check**.

Look at the two panes. The top one is what the other person sees. The bottom one is that
Bulgarian translated *back* into English. **This is the most important thing in the app** —
you cannot judge Bulgarian, but you can absolutely judge whether the English it turns back
into still says what you meant.

Press **Show it to them**, then **Show full screen** — that is the view you would hold up
to a pharmacist.

**3. The full round trip (everything at once)**

Rate the result 1–5. Tap **Log** — your message is there, with who did what
("Types → Reads"), both languages, and the rating. Tick it and press **Export CSV**; it
opens correctly in Excel including the Cyrillic.

Then tap **Settings** and read the **"What works without internet"** table. On the phone
this is filled in by asking the actual device what it can do, per language. It is where the
Bulgarian speech limitation is stated plainly rather than discovered at a bad moment.

---

## Step 7 — Optional: turn on live editing

If you want to change the code and see it update:

```
npm install
```

Then `node scripts/dev.mjs` again. Now edits to anything in `src/` rebuild automatically —
just refresh the browser.

*Why it is optional:* `npm install` downloads the Capacitor and esbuild packages, which
takes a few minutes and about 200 MB. You need it before building the Android app, but not
to look at the app.

You can also now run:

```
npm run verify
```

277 checks on the data, the wiring and the packaging. Run it after any change; if it
fails, do not build.

---

## Step 8 — Tidy up

There is a folder called `_to_delete` containing the zip the project arrived in. Delete
that folder — nothing needs it.

---

## What is not real in the browser

Only these, and only because a laptop is not a phone:

| | In the browser | On the phone |
|---|---|---|
| Translation | Built-in phrasebook | Google ML Kit, offline, any sentence |
| Speaking into it | Your browser's speech recognition, if it has one | The phone's own recogniser |
| Reading aloud | Your computer's voices | The phone's voices |
| Language packs | Shown as present | Really downloaded and managed |

Everything else — the compose → check → show flow, the message log, the phrasebook, the
CSV export, the ratings, the layout, dark mode — is the same code that ships.

When you are ready for the real thing on a phone, see
**[ANDROID-BUILD.md](ANDROID-BUILD.md)**.
