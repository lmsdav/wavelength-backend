# Classical Wavelength

Type in a piece, a composer, an artist or a pop song. Get three classical works
that lead your ear outward from there — a comfortable next step, a stretch, and
a reach — each with the musical bridge explained.

## Layout

    wavelength-backend.js   Server. No HTML in here.
    public/index.html       THE ENTIRE USER INTERFACE — edit this freely
    public/fonts/           Self-hosted fonts. Leave alone.
    test/                   Test harness
    DEPLOY.md               How to put it on Railway

## Changing the look

Everything visual is in `public/index.html`. Colours are CSS variables at the
top. Change them, save, redeploy. You cannot break the server from that file.

Two things in there are load-bearing and marked with comments:

- **`renderBridge()`** — stops model output injecting code into the page.
  Do not replace it with `innerHTML`.
- **The sponsor label slot** — removed because the links are unpaid. If a
  sponsor is ever paid, the comment explains how to put the label back.

## Running locally

    npm install
    ANTHROPIC_API_KEY=sk-ant-... npm start
    open http://localhost:3000

## Testing

    BASE_URL=http://localhost:3000 npm run test:searches

Generates 52 fresh random inputs each run — never the same set twice — across
classical works, composers, non-classical artists, songs, film scores and
deliberate edge cases. Writes a JSON and CSV log to `test/results/`.
