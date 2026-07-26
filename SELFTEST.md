# Self-test route — TEMPORARY

## What it is
A hidden address that runs the test suite inside the app and returns the
results, so Claude can run M1 testing without needing access to your accounts.

## Switching it on
In Railway → Variables → New Variable:

    Name:  SELFTEST_TOKEN
    Value: mvfEYhtUavdF171KiEPDBnoofExFtxgU

## Switching it OFF (instant, no redeploy)
Delete the SELFTEST_TOKEN variable in Railway. The route stops existing.

## REMOVING IT COMPLETELY — required before production (M5). RAID I-17.
Three deletions:
  1. delete the file `selftest.js`
  2. delete the four lines in `wavelength-backend.js` marked `<<< REMOVE`
  3. delete the SELFTEST_TOKEN variable in Railway

## Safety
- Without the correct token the address returns "Not found", exactly like any
  other unknown page. It does not advertise its existence.
- It cannot change anything. It only reads recommendations and reports on them.
- It costs API credit each run: roughly 30p for 52 searches, 90p for the
  model comparison. Your $10 caps still apply.
