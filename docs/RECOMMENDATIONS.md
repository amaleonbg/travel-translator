# Recommendations

You asked for suggestions to make this efficient, reliable and simple for a traveller.
These are ordered by value for effort, and separated into what is already built and what
is worth considering next.

---

## Already built in, and why

These were design decisions rather than features, so they are worth naming — each one
solves a problem that would otherwise show up as a bad review.

**The back-translation check.** The app translates your message, then translates the
result back into your own language and shows you both. This is the whole reliability
story. You cannot evaluate Bulgarian; you can absolutely evaluate the English it turns
back into. No competitor makes this the default step, and it costs one tap.

**The Meaning match score.** With no cloud service there is no confidence number to
display — so rather than invent one, the app measures the word overlap between what you
wrote and the round trip, and shows that. It is an honest, computed signal instead of a
reassuring fiction. When it is low, the app says so rather than hiding it.

**Typing as a first-class path, not a fallback.** Speech is the fragile part: it needs
permission, quiet, a supported language and a working recogniser. Typing needs none of
those and is perfectly accurate. Making Text a peer of Audio in the same dropdown — rather
than a hidden alternative — means the reliable path is always one tap away.

**The phrasebook as the second tab.** For a large share of real use — greeting, ordering,
asking directions, pharmacy — no engine is needed at all. A stored sentence is faster,
more accurate, and uses no battery. Getting people to the fixed phrases first is a
feature.

**"Show full screen".** Handing someone your phone with 14px text on a cluttered screen is
a bad experience for both of you. The full-screen view is large type on a plain
background, with a Read aloud button. This is the moment the app is actually judged.

**Honest capability reporting.** The Settings screen asks the phone in the user's hand
what it can do, per language, and says so. Every other offline translator implies it does
everything; discovering the limit at a pharmacy counter is how you get a one-star review.

**Nothing leaves the device.** No server, no account, no analytics. This is both the
strongest privacy position available and, in a market where every competitor uploads your
voice, a genuine selling point.

---

## Worth adding next, in order

### 1. Favourites (highest value, smallest effort)

A star on any result that pins it to the top of the phrasebook. Travellers reuse the same
five sentences relentlessly — the hotel address, the dietary restriction, the "I do not
speak Bulgarian, please write it down". Roughly an afternoon: the log already stores
everything needed, it wants a boolean and a filter.

### 2. Conversation mode

A single screen with two tap-to-talk buttons, one per language, that alternate — instead
of swapping direction manually each turn. This is what people mean when they say
"translator app", and it removes the most tedious interaction in the current flow. Half a
day, built on the pieces already in `main.js`.

### 3. Pre-download prompt at install time

The single biggest real-world failure is a user who installs at the gate and never opens
Settings. The banner covers it, but a full-screen first-run step — "Download 4 language
packs, 120 MB, needs Wi-Fi once" with a big button — converts far better than a
dismissible banner. An hour of work, and it prevents the review that says "doesn't work
offline".

### 4. Text from the camera

Point the phone at a menu, a road sign, a prescription label. ML Kit's text recognition
runs entirely on-device and there is a maintained Capacitor plugin for it, so it fits the
no-server architecture exactly. This is the feature travellers actually want most after
basic translation, and it is the natural version 2 headline. A few days.

### 5. Emergency card

One screen, pre-translated, that says: my name, my blood type, my allergies, my emergency
contact, I do not speak your language. Held up, not typed. It costs almost nothing to
build and it is the feature someone tells their friends about.

### 6. Larger phrasebook, organised by situation

Sixty phrases is a good start. Two hundred, grouped by *where you are* — airport, taxi,
hotel, restaurant, pharmacy, police — makes the app useful before the engine is even
involved. This is content work, not engineering.

---

## Efficiency notes

**Battery.** ML Kit inference is cheap but not free, and it is invoked twice per message
because of the back-translation. That is the right trade. Do not add automatic re-translation
on every keystroke — the temptation is real and it would triple the cost of typing a
sentence.

**Storage.** Four packs is about 120 MB, plus the app. On a 32 GB phone that is
noticeable. The Settings screen lets a user remove a language they are not using, which is
the right escape valve.

**Cold start.** ML Kit loads its model on the first translation, so the first one after
opening the app is slower than the rest. If this proves annoying in testing, a
one-character warm-up translation during boot would hide it — but measure before adding
it, because it also costs battery on every launch.

**Do not add streaming translation.** Translating as the user types demos well and is the
wrong fit: it multiplies inference cost, drains battery, and produces distracting
half-translations of half-sentences.

---

## Reliability notes

**Test on an old, cheap Android phone.** ML Kit performance varies enormously with the
neural accelerator. A £120 phone is what a lot of your users have and what the app has
never been tried on.

**The permission dance is the most fragile part.** Microphone permission, speech
recogniser availability, offline pack presence, and voice availability are four
independent things that can each be missing. They are all handled, but they are also where
regressions will appear — check them after every dependency upgrade.

**Pin the plugin versions.** ML Kit's Android library has broken behaviour across minor
versions before. `package.json` uses caret ranges for convenience during development;
before release, change them to exact versions and commit `package-lock.json`.

**Keep the signing key somewhere other than the laptop.** Losing it means you can never
update the app — you would publish a new listing and lose every review and install. This is
the single most consequential file in the project.

---

## On selling it

**Price it low and up front.** £2–3 rather than a subscription. A traveller buys a
translator once, before a trip, and a subscription for something used for two weeks a year
is a hard sell. Note that Google Play does not allow a free app to become paid later — only
the reverse — so decide before the first public release.

**Lead with offline in every piece of copy.** It is the differentiator, it is what the
architecture buys you, and it is what people search for. "Offline translator Bulgarian" is
a query with intent behind it.

**Say "no internet, no account, nothing uploaded" in the first two lines** of the store
description. The Data Safety form will back it up, which very few competitors' can.

**Be honest about Bulgarian speech in the listing.** A sentence saying spoken Bulgarian
input needs the Android offline pack, and is unavailable on iPhone, will cost you a few
downloads and save you a lot of one-star reviews from people who found out the hard way.

---

## What not to build

**Do not add a server "just for the better translations".** It would reintroduce running
costs, an API key to protect, a privacy policy with substance to it, and a dependency on
your own uptime — in exchange for marginally better output. The whole value of this
architecture is that it has none of those.

**Do not add more languages yet.** ML Kit supports fifty, and adding them is nearly free
in code. It is not free in testing: every pair is a thing that can be wrong, and you
cannot evaluate output in a language you do not have a speaker for. Four languages you can
actually verify beats fifty you cannot.

**Do not bundle Whisper for offline Bulgarian speech until someone asks.** It is a 450 MB
addition to solve a problem that typing already solves. See [OFFLINE.md](OFFLINE.md).
