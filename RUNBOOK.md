# Incident runbook — Classical Wavelength

One page. Written for a moment when you are stressed and cannot remember
where anything is.

**Your URL:** wavelength-backend-production-02b3.up.railway.app
**Is it alive?** open `<URL>/health` — should return `"status":"ok"`

---

## 1. STOP EVERYTHING — 30 seconds

If you need it off, now, for any reason:

**Railway → your project → wavelength-backend → Settings → scroll down → Remove**
(or **Pause** if offered — reversible, and preferred)

The site goes down. Nothing is lost. The code is still on GitHub.

**Faster and gentler:** delete the `ANTHROPIC_API_KEY` variable. The service
refuses to start without it, so it stops within a minute. Put it back to
restart.

---

## 2. "The bill is running away"

It cannot, but if you are worried:

| Check | Where | What you should see |
|---|---|---|
| Credit left | platform.claude.com → Billing | Auto-reload OFF. When it hits zero the API stops |
| Monthly limit | platform.claude.com → Limits | $10 |
| Railway spend | Railway → Usage | $10 compute cap, $0 agent |

**Your true ceiling is your credit balance, because auto-reload is off.** The
worst case is the app stops, not a bill.

**If you still want it stopped:** delete the API key variable in Railway (above).

---

## 3. "I think the key has leaked"

1. **platform.claude.com → API keys → delete `wavelength-prod`**
   That kills it immediately. The app stops working.
2. **Create key** → copy it
3. **Railway → Variables → ANTHROPIC_API_KEY → paste the new one**
4. Redeploys itself. Check `/health`.

Total time: about two minutes. Do step 1 first and worry about the rest after.

---

## 4. "It's being hammered"

Signs: Railway usage climbing fast, credit dropping, or the site is slow.

1. **Check it is real** — Railway → Deploy Logs. Lots of `event: recommend`
   from one source is abuse; a spread is popularity.
2. **The rate limit is already working** — 30 per IP per hour, returns 429.
3. **If it is genuinely bad:** delete the API key variable. Everything stops.
4. **Then decide** whether to put Cloudflare in front before restarting
   (RAID D-07 — deferred, not rejected).

---

## 5. "It's broken but I don't know why"

**Railway → Deployments → the Active one → Deploy Logs.** Look for:

| You see | It means |
|---|---|
| `FATAL: ANTHROPIC_API_KEY is not set` | The key variable is missing |
| `event: recommend_error ... status: 401` | Key is wrong or expired |
| `event: recommend_failed` | Model returned something unusable, twice |
| `event: feedback_failed` | Google Form rejected it — check it is still published |
| Nothing at all since deploy | The process is not running |

**Roll back:** Railway → Deployments → find the last one that worked → the
three dots → **Redeploy**. Takes about a minute.

---

## 6. Key dates

| When | What |
|---|---|
| **19 October 2026** | Renew the API key. It expires 24 October |
| Monthly | Glance at the credit balance |

---

## 7. If someone complains about their data

They can ask for their feedback to be deleted. Open the Google Form's
Responses tab, find their row, delete it. Tell them it is done.
That is the whole process — nothing else is stored.

---

## 8. Who can help

You are the only administrator. There is no on-call and no support contract.
That is a deliberate consequence of this being a personal project, not an
oversight.

If you cannot fix it, the safe move is always **stop it** (section 1) and come
back to it later. Nothing degrades by being switched off.
