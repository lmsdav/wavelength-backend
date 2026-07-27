# Setting up the two Google Forms

Roughly fifteen minutes. Both forms live in your Google account.
Claude cannot create them — they need your login — but everything on the app
side is already built and waiting.

---

# FORM 1 — In-app feedback

This is the one wired into the app. It must exist before anyone else sees the
site: right now the form collects what people type and throws it away.

## 1. Create it
forms.google.com → Blank form
Title: **Classical Wavelength — feedback**

## 2. Add these six questions, in this order and these types

| # | Question text | Type | Required |
|---|---|---|---|
| 1 | What did you search for? | Short answer | No |
| 2 | Was the recommendation helpful? | Short answer | No |
| 3 | Which of the three did you like best? | Short answer | No |
| 4 | Anything you'd change? | Paragraph | No |
| 5 | Email, if you'd like a reply | Short answer | No |
| 6 | Device | Paragraph | No |

**All six must be Short answer or Paragraph, and none may be required.**
Multiple-choice fields need a different submission format and will silently
reject anything unexpected. Question 6 is filled automatically by the app.

**Do not tick "Collect email addresses"** in the settings. Question 5 is
optional by design — some testers are teenagers, and asking for an email you do
not need creates an obligation you do not want. (DEC-19, UK Children's Code.)

## 3. Find the field IDs
1. Click the three dots, top right → **Get pre-filled link**
2. Type a recognisable word into every one of the six boxes — "AAA", "BBB",
   "CCC", "DDD", "EEE", "FFF" — then click **Get link** → **Copy link**
3. Paste the link into a note. It will look like:

       https://docs.google.com/forms/d/e/1FAIpQL.../viewform?usp=pp_url
         &entry.1234567=AAA&entry.7654321=BBB&entry.1112223=CCC ...

Each `entry.NUMBER` is the ID of the box you typed that word into. Match them
up by which word you used.

## 4. Build the two settings

**FEEDBACK_FORM_URL** — take the link above, cut everything from `?` onwards,
and change `viewform` to `formResponse`:

    https://docs.google.com/forms/d/e/1FAIpQL.../formResponse

**FEEDBACK_FIELD_MAP** — one line of JSON pairing each app field to its entry
number:

    {"query":"entry.1234567","helpful":"entry.7654321","best":"entry.1112223","note":"entry.4445556","email":"entry.7778889","device":"entry.9990001"}

Use your own numbers. Keep the quotes and commas exactly as shown.

## 5. Add both to Railway
Railway → your service → **Variables** → New Variable, twice.
It redeploys itself.

## 6. Check it worked
Open `<your URL>/health`. It should now say `"feedback":"configured"`.
Then send a test message through the app and confirm it appears in the form's
**Responses** tab.

If it says `"not configured"`, one of the two variables is missing or the JSON
has a typo.

---

# FORM 2 — Tester questionnaire

Separate form, not wired into the app. You send the link to testers after they
have used it. Eight questions, approved 27 July (DEC-33).

Title: **Classical Wavelength — tell us what you thought**
Description: *Eight questions, about three minutes. Please be blunt — a polite
yes is no use to anyone.*

| # | Question | Type | Options |
|---|---|---|---|
| 1 | What device did you use? | Multiple choice | iPhone · iPad · Android phone · Android tablet · Mac · Windows PC · Other |
| 2 | Which browser? | Multiple choice | Safari · Chrome · Firefox · Edge · Samsung Internet · Not sure |
| 3 | Did anything look broken, cut off, or hard to read? If yes, what? | Paragraph | — |
| 4 | How many different things did you search for? | Multiple choice | 1 · 2–3 · 4–10 · More than 10 |
| 5 | Before today, when did you last go looking for classical music you had not heard before — and how did you go about it? | Paragraph | — |
| 6 | Did any recommendation make you want to go and listen to it? Which one, and why? | Paragraph | — |
| 7 | May we email you in two weeks to ask whether you have used it again? | Multiple choice | Yes — my email is below · No thanks |
| 7b | Your email (only if you said yes) | Short answer | — |
| 8 | If this disappeared tomorrow, would you miss it? | Multiple choice | Very much · A little · Not really |
| 8b | Anything else you want to say? | Paragraph | — |

Leave every question optional. A half-finished response is better than none.

**Question 7 is the one that matters most.** Agreeing costs the tester
something, so the answer means something — and the follow-up two weeks later
measures what they actually did rather than what they said they would do.

## Success thresholds — agreed 27 July, before any data arrives

| Measure | Threshold |
|---|---|
| Searched 4+ times (Q4) | at least half |
| Named a piece they wanted to hear (Q6) | at least half |
| Would miss it "very much" (Q8) | at least 30% |
| Agreed to follow-up AND had returned (Q7) | at least a quarter |

Meeting these justifies investing further. Not meeting them does not oblige you
to delete anything — parking it as a running webapp is an equally valid outcome
(DEC-36).
