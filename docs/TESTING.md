# Testing before you charge money for it

You said you want it "reliable and robust enough" before selling it. This is how to
establish that with evidence rather than a hopeful feeling. The good news is that Google's
mandatory 14-day, 12-tester closed period gives you exactly the window to do it in.

---

## The automated checks

```bash
npm run verify
```

277 checks, no dependencies beyond Node, runs in under a second. It covers the mistakes
that are silent until a user finds them:

- every phrasebook entry has all four languages, and no duplicates
- every language record has a valid speech, translation and voice code
- **every element id `main.js` reaches for actually exists in `index.html`** — the single
  most common way this kind of app breaks after an edit
- the eight removed stat tiles have not crept back in
- every icon the manifest names exists on disk
- the Capacitor app id and `webDir` are sane

Run it after every change. If it fails, do not build.

```bash
node scripts/e2e.mjs      # needs: npx playwright install chromium
```

Drives a real browser through compose → check → show → rate → log, and fails on any
console error. Slower, needs Playwright, worth running before any release.

---

## The manual test that matters most

**Aeroplane mode.** Everything else is secondary.

1. Fresh install on a real phone.
2. Download all four language packs on Wi-Fi.
3. **Turn on aeroplane mode.**
4. Now do a full day of normal use without turning it off.

If anything at all fails in that state, it is a release blocker — that is the entire
product promise.

---

## Accuracy: the part worth being systematic about

Machine translation quality is not uniform, and the failures are not random. Test where it
is weakest rather than where it is comfortable.

### How to judge a translation without a second language

Use the app's own back-translation, then confirm with a native speaker for a sample. The
**Meaning match** percentage on the result screen is the round-trip word overlap — treat
it as a smoke alarm, not a verdict. Below about 35% is worth reading carefully; a low
score often just means the language legitimately reshaped the sentence.

Rate each test 1–5 using the buttons on the result screen, and add a label describing the
conditions. Export the log to CSV at the end and read it as a whole.

### What to test, in rough order of how likely it is to embarrass you

| Priority | Case | Why |
|---|---|---|
| 1 | **English ↔ Bulgarian** | The hardest pair by far. Cyrillic, a small training corpus, and grammar unlike the other three. If the app is good enough here, it is good everywhere. |
| 2 | **Bulgarian ↔ Portuguese / Spanish** | These pivot through English, so errors compound. Two chances to go wrong. |
| 3 | **Long sentences** | ML Kit's on-device models degrade faster than cloud models on complex clauses. Find where the cliff is so you can advise users. |
| 4 | **Proper nouns** | Place names, street names, "Nessebar", "Sunny Beach", hotel names. This is where transcription and translation both reliably fail. |
| 5 | **Numbers, times, prices** | A mistranslated price is a real-world problem, not a cosmetic one. |
| 6 | **Speech in noise** | Street, restaurant, wind. A coastal resort is a hostile audio environment. |
| 7 | **Accented speech** | Get someone who is not you to speak into it. |
| 8 | **Very short utterances** | "Yes", "here", "how much" — recognisers do badly with almost no context. |

**Aim for at least 20 translations per direction** — that is 240 across all pairs. It sounds
like a lot; at a minute each it is an afternoon, and it is the difference between knowing
and hoping.

### The sentences to use

Do not invent clever test sentences. Use the ones a traveller will actually type. The
phrasebook is a good starting list; supplement with:

- "My flight was cancelled and I need to get to the airport tomorrow morning."
- "I am allergic to penicillin. Is there anything in this that contains it?"
- "The heating in the apartment has stopped working and it is very cold."
- "How much would it cost to get to Sunny Beach and back?"
- "I think I have left my passport in the taxi."

---

## Robustness: try to break it

| Test | What should happen |
|---|---|
| Tap Record and say nothing | A clear "nothing was heard" message, not a hang |
| Tap Record twice quickly | No duplicate listener, no stuck state |
| Rotate the phone mid-translation | Layout adapts, nothing is lost |
| Kill the app mid-translation and reopen | Opens cleanly; no half-written log row |
| Delete the Bulgarian pack, then translate into Bulgarian | Named, actionable error pointing at Settings |
| Fill the log with 200 messages | Log screen still opens quickly |
| Set both languages to the same one | Refused, with an explanation |
| Type 2000 characters | Handled or clearly capped |
| Deny microphone permission, then tap Record | Clear message, and typing still offered |
| Turn the phone volume to zero, passive user on Audio | The written translation is still shown |

---

## Battery and heat

Not a formality for this app: ML Kit inference and speech recognition both use the neural
accelerator, and a traveller's phone is often already low. Translate thirty messages in a
row and watch the battery percentage and whether the phone gets warm. If it does, that is
worth knowing before a reviewer discovers it.

---

## Before you press publish

- [ ] `npm run verify` passes
- [ ] `node scripts/e2e.mjs` passes
- [ ] A full day of aeroplane-mode use with no failures
- [ ] At least 20 rated translations per direction, exported to CSV and reviewed
- [ ] A native Bulgarian speaker has checked a sample of the Bulgarian output
- [ ] Tested on at least two physical Android phones, one of them old and cheap
- [ ] Fresh install tested — including the first-run pack download flow
- [ ] Uninstall and reinstall leaves no data behind
- [ ] Privacy policy published and linked
- [ ] Play Data Safety form completed as "collects nothing"
