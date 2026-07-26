# Deploying to Railway — step by step

You do this part because it needs your Railway account. It takes about five minutes.

## 1. Put the code on GitHub
Replace the contents of `lmsdav/wavelength-backend` with everything in this folder.
Do NOT upload `node_modules` — `.gitignore` already excludes it.

## 2. Create the Railway service
1. railway.com → **New Project** → **Deploy from GitHub repo**
2. Choose `lmsdav/wavelength-backend`
3. Railway detects Node and runs `npm install` then `npm start` automatically

## 3. Set the API key
In the Railway project → **Variables** → **New Variable**

    Name:  ANTHROPIC_API_KEY
    Value: (paste the wavelength-prod key)

Do not set PORT. Railway provides it.
Do not set ALLOWED_ORIGIN. The frontend and API share an origin.

**The server refuses to start without the key.** That is deliberate — it fails
loudly rather than running broken.

## 4. Check it worked
Railway gives you a URL like `https://wavelength-backend-production.up.railway.app`

    <that URL>/health

should return `{"status":"ok","model":"claude-haiku-4-5-20251001",...}`

Then open the URL itself and run one search.

## 5. Send me the URL
I run the 52-search test and the Haiku-vs-Sonnet comparison against it,
and produce the M1 evidence pack.

---

## If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Deploy crashes immediately | API key not set | Add the variable, redeploy |
| `/health` works, searches 502 | Key wrong or no credit | Check the key; check the balance |
| Page loads with the wrong fonts | Fonts folder not uploaded | Confirm `public/fonts/` has six `.woff2` files |
| Everything 429s | You hit 30 searches in an hour | Wait, or raise the limit in CONFIG |

Roll back by redeploying the previous commit in Railway. Nothing here touches
your spend caps, which stay as set.
