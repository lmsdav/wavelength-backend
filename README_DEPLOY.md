# Classical Wavelength — Production Deployment

**Date:** 7 August 2026  
**Status:** APPROVED for production (M5 gate complete)

## Files Included

```
deployment_package/
├── wavelength-backend.js      (Backend with feedbackReady fix)
├── package.json               (Dependencies)
├── .gitignore                 (Git ignore rules)
└── public/
    ├── index.html             (Main app)
    ├── terms.html             (V3 APPROVED)
    ├── privacy.html           (V3 APPROVED)
    └── fonts/
        ├── fraunces-latin-400-normal.woff2
        ├── fraunces-latin-500-normal.woff2
        ├── spectral-latin-400-normal.woff2
        ├── spectral-latin-600-normal.woff2
        └── space-grotesk-latin-400-normal.woff2
```

## Deployment Steps

1. **Go to GitHub:**
   - https://github.com/lmsdav/wavelength-backend

2. **Upload Files:**
   - Click "Add file" → "Upload files"
   - Drag all files from `deployment_package/` folder into GitHub
   - Include `.gitignore` (it's a hidden file but must be uploaded)

3. **Commit:**
   - Message: `M5 deployment: feedbackReady fix, legal footer, .gitignore`
   - Commit to main branch

4. **Railway Auto-Deploy:**
   - Railway will detect the commit and auto-deploy within 1–2 minutes
   - No manual action needed on Railway

## Verification Checklist

After deployment completes, verify:

- [ ] `/health` endpoint returns HTTP 200
  - Visit: https://wavelength-backend-production.railway.app/health
  - Should see: `{"status":"ok","model":"claude-haiku-4-5-20251001","feedback":"configured or not configured","uptimeSeconds":...}`

- [ ] Search works
  - Try searching for "Radiohead"
  - Should receive 3 classical recommendations within 2–3 seconds
  - No console errors

- [ ] Feedback form works
  - Click "Feedback" button (bottom right)
  - Modal should open
  - Should be able to type and close without errors

- [ ] Legal pages accessible
  - Visit `/terms.html` and `/privacy.html`
  - Should display V3 APPROVED versions

## All M5 Criteria Verified ✓

1. ✓ Terms of Use (V3)
2. ✓ Privacy Notice (V3)
3. ✓ API key management (env vars)
4. ✓ HTTPS enforcement (Railway)
5. ✓ CORS headers configured
6. ✓ Dependencies audited (0 vulnerabilities)
7. ✓ Data retention policy documented
8. ✓ No tracking cookies
9. ✓ Uptime SLA & incident response
10. ✓ WCAG 2.1 AA accessibility

**Status: READY FOR PRODUCTION**
