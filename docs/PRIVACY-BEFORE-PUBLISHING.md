# Privacy check before you publish

Everything here takes about five minutes and is **far easier before your first push than
after**. Once a commit is on GitHub, its contents are public and permanent — deleting a
file later does not remove it from the history.

---

## Done already

**Your name and folder layout are out of the documentation.** Every example path now reads
`C:\Users\<you>\Desktop\Mobile Translator App-EN-BG-PT-ES`. The intermediate folder is
gone too.

**The project files carry nothing sensitive.** Scanned for API keys, passwords, tokens,
keystores, `.env` files and email addresses — none present. The online translator was
deliberately chosen because it needs no key, so there is nothing to leak.

**Your planning document is excluded.** `Mobile Translator App Development.docx` is in
`.gitignore`, so it stays on your laptop.

---

## The one thing left: your commit author details

This is the part most people miss, and it is the most exposing.

**Every Git commit records an author name and email address.** Yours currently say:

```
Name:  amaleonbg
Email: amaleonbg@gmail.com
```

On a public repository, anyone can see that — on the commit page, and by running one
command. Address-harvesting bots scrape GitHub commits specifically for this. The name is
your choice; **the email is the part worth changing**, because you cannot un-publish it
later.

GitHub provides a permanent forwarding address exactly for this purpose. It looks like:

```
12345678+amaleonbg@users.noreply.github.com
```

Mail sent to it still reaches you. Your real address never appears anywhere.

### Step 1 — Turn on email privacy on GitHub

1. Go to <https://github.com/settings/emails>
2. Tick **Keep my email addresses private**
3. Tick **Block command line pushes that expose my email**

*What the second one does:* it makes GitHub **refuse** any push that would publish your
real address. A safety net, so this cannot happen by accident later.

On that same page, under "Keep my email addresses private", GitHub shows your no-reply
address. **Copy it** — you need it in the next step.

### Step 2 — Tell GitHub Desktop to use it

In GitHub Desktop: **File → Options → Git**.

- **Name:** whatever you want shown publicly. `amaleonbg` is fine; so is `Amaleon`.
- **Email:** paste the no-reply address from Step 1.

Click **Save**.

### Step 3 — Fix the commit you have already made

Your existing "Initial commit" still carries the old address. It has not been pushed, so
this is easy — but it must be done before you publish.

**In GitHub Desktop**, at the bottom left of the Changes tab, click **Undo** next to
"Committed just now — Initial commit".

That un-commits it. Your files are untouched; they simply return to the Changes list.

Then commit again:

- **Summary:** `Travel Translator: offline four-language app, web and Android builds`
- Click **Commit to main**

The new commit uses your new details. Check it worked: the **History** tab shows the
commit — hover over the author avatar and the new address should be there.

### Step 4 — Now publish

**Publish repository** → name it `travel-translator` → untick **Keep this code private** →
**Publish repository**.

---

## What is still public, deliberately

Being clear about what this does not hide, so there are no surprises.

| | Public? | Why |
|---|---|---|
| Your GitHub username `amaleonbg` | **Yes** | It is in the web address itself — unavoidable, and not a secret |
| Your real email | No, after the steps above | |
| Your real name | No | It never appears in the repository |
| Your folder layout | No | Removed from the documentation |
| The app's source code | **Yes** | This is what makes free hosting possible |
| The published app | **Yes** | Anyone with the link can use it. That is the point |
| Your app's ID `com.amaleon.traveltranslator` | **Yes** | Android requires one; it reveals nothing |
| Messages people translate | **No, never** | They stay on each person's phone. There is no server |

---

## If you ever do commit something sensitive

Do not simply delete the file and commit again — **the old version stays in the history**
and remains retrievable.

Tell me instead. The fix exists, but it involves rewriting history, and it is dramatically
simpler the sooner it is done. If something has already been pushed and it was a real
credential, treat it as compromised and change it at the source as well.

---

## Worth doing later, not now

**Add a licence.** With no licence file, the default is "all rights reserved" — others can
read your code but have no right to reuse it. That is probably what you want, so doing
nothing is a reasonable choice. If you ever want to allow reuse, add a licence then.

**Consider making the repository private** if you decide to sell the app. The code moves to
private in two clicks (Settings → General → Change visibility), but you would then need
Cloudflare Pages instead of GitHub Pages for the free hosting. Details in
[ROUTE-A-WEB-APP.md](ROUTE-A-WEB-APP.md).
