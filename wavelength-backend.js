import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classical Wavelength</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --primary: #4F46E5; --primary-hover: #4338CA; --surface-1: #FFFFFF; --surface-2: #F5F6FB; --text-primary: #1F2937; --text-secondary: #6B7280; --text-muted: #9CA3AF; --border: #E5E7EB; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif; background: var(--surface-2); color: var(--text-primary); line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 1.5rem; }
        .header { margin-bottom: 2rem; }
        .header h1 { font-size: 28px; font-weight: 600; margin-bottom: 8px; background: linear-gradient(135deg, var(--primary), #7C3AED); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .header p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .search-box { display: flex; gap: 10px; margin-bottom: 1.5rem; }
        input { flex: 1; padding: 12px; font-size: 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-1); color: var(--text-primary); }
        input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        button { padding: 12px 24px; font-size: 16px; font-weight: 600; border: none; border-radius: 8px; background: var(--primary); color: white; cursor: pointer; }
        button:hover:not(:disabled) { background: var(--primary-hover); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .examples { font-size: 13px; color: var(--text-secondary); margin-bottom: 1.5rem; }
        .example-item { display: inline-block; margin-right: 8px; margin-bottom: 6px; }
        .example-item button { padding: 6px 12px; font-size: 12px; background: var(--surface-1); color: var(--primary); border: 1px solid var(--border); }
        .status { display: none; align-items: center; gap: 8px; font-size: 14px; color: var(--primary); margin-bottom: 1rem; }
        .status.show { display: flex; }
        .spinner { width: 16px; height: 16px; border: 2px solid var(--primary); border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .error { padding: 12px; border-radius: 8px; background: #FEE2E2; border: 1px solid #FECACA; color: #991B1B; font-size: 14px; margin-bottom: 1rem; display: none; }
        .error.show { display: block; }
        .result { display: none; }
        .result.show { display: block; }
        .anchor { background: var(--surface-1); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .anchor-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); margin-bottom: 8px; }
        .anchor-title { font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
        .anchor-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .recs { display: flex; flex-direction: column; gap: 12px; }
        .rec { background: var(--surface-1); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
        .rec-label { display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 4px; margin-bottom: 10px; }
        .rec.step1 .rec-label { background: #DCFCE7; color: #166534; }
        .rec.step2 .rec-label { background: #FEF3C7; color: #92400E; }
        .rec.step3 .rec-label { background: #FEE2E2; color: #991B1B; }
        .rec-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
        .rec-composer { font-size: 13px; color: var(--text-secondary); margin-bottom: 10px; }
        .rec-reason { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px; }
        .rec-reason b { color: var(--primary); font-weight: 600; }
        .rec-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-size: 12px; font-weight: 600; text-decoration: none; border-radius: 6px; background: var(--surface-2); color: var(--primary); border: 1px solid var(--border); }
        .rec-link:hover { background: var(--primary); color: white; border-color: var(--primary); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Classical Wavelength</h1>
            <p>A piece, a composer, an artist, even a pop song — type it in, get three classical works that develop your ear from there.</p>
        </div>
        <div class="search-box">
            <input type="text" id="input" placeholder="e.g. Elgar Cello Concerto, Radiohead, or Billie Eilish">
            <button id="btn">Find</button>
        </div>
        <div class="examples" id="examples"></div>
        <div class="status" id="status">
            <div class="spinner"></div>
            Thinking it through…
        </div>
        <div class="error" id="error"></div>
        <div class="result" id="result">
            <div class="anchor">
                <div class="anchor-label">Your starting point</div>
                <div class="anchor-title" id="anchor-title"></div>
                <div class="anchor-desc" id="anchor-desc"></div>
            </div>
            <div class="recs" id="recs"></div>
        </div>
    </div>
    <script>
        const BACKEND_URL = window.location.origin;
        const input = document.getElementById('input');
        const btn = document.getElementById('btn');
        const status = document.getElementById('status');
        const error = document.getElementById('error');
        const result = document.getElementById('result');
        const examplesEl = document.getElementById('examples');
        const EXAMPLES = ["Elgar Cello Concerto", "Beethoven Moonlight Sonata", "Holst The Planets", "Tchaikovsky", "Radiohead", "Kendrick Lamar", "Billie Eilish — bury a friend", "Hans Zimmer film score", "Kancheli", "Pink Martini"];
        function shuffledExamples() {
            return [...EXAMPLES].sort(() => Math.random() - 0.5).slice(0, 4);
        }
        function renderExamples() {
            examplesEl.innerHTML = '<strong>Try:</strong> ' + shuffledExamples().map(e => \`<span class="example-item"><button type="button" data-ex="\${e}">\${e}</button></span>\`).join('');
            examplesEl.querySelectorAll('button').forEach(el => {
                el.addEventListener('click', () => { input.value = el.dataset.ex; search(); });
            });
        }
        renderExamples();
        btn.addEventListener('click', search);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
        async function search() {
            const val = input.value.trim();
            if (!val) return;
            btn.disabled = true;
            status.classList.add('show');
            error.classList.remove('show');
            result.classList.remove('show');
            try {
                const response = await fetch(\`\${BACKEND_URL}/api/recommend\`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ input: val })
                });
                if (!response.ok) throw new Error(\`Server error: \${response.status}\`);
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                render(data);
            } catch (err) {
                error.textContent = err.message || "Something went wrong. Try again.";
                error.classList.add('show');
            } finally {
                btn.disabled = false;
                status.classList.remove('show');
            }
        }
        function render(data) {
            document.getElementById('anchor-title').textContent = data.title;
            document.getElementById('anchor-desc').textContent = data.desc;
            const recsEl = document.getElementById('recs');
            recsEl.innerHTML = '';
            const labels = { 1: "Comfortable next step", 2: "A stretch", 3: "A reach" };
            data.recs.forEach(r => {
                const ytQuery = encodeURIComponent(r.composer + ' ' + r.title.replace(/^.*—\\s*/, ''));
                const ytUrl = 'https://www.youtube.com/results?search_query=' + ytQuery;
                const div = document.createElement('div');
                div.className = 'rec step' + r.step;
                div.innerHTML = \`<div class="rec-label">\${labels[r.step]}</div><div class="rec-title">\${r.title}</div><div class="rec-composer">\${r.composer}</div><div class="rec-reason">\${r.reason}</div><a class="rec-link" href="\${ytUrl}" target="_blank" rel="noopener">▶ Listen on YouTube</a>\`;
                recsEl.appendChild(div);
            });
            result.classList.add('show');
        }
    </script>
</body>
</html>`;

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(HTML);
});

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PROMPT_TEMPLATE = (val) => `You are a knowledgeable, non-snobby classical music guide. The user has told you what they like: "${val}".

First, work out what type of thing this is, then follow the matching approach:

- If it's a SPECIFIC CLASSICAL PIECE: identify it precisely (correct spelling/attribution if needed), then recommend 3 other classical works that develop the listener's appreciation from it.
- If it's a CLASSICAL COMPOSER (not one specific piece): briefly characterise their style/era for someone who loves their famous works but hasn't explored widely, then recommend 3 things to explore next — could be a lesser-known work of theirs, a close contemporary, or a composer connected by lineage/influence.
- If it's a NON-CLASSICAL ARTIST (pop/rock/hip-hop/electronic/whatever): briefly characterise what's distinctive about their sound in plain language, then recommend 3 classical works connected to it — direct sonic/emotional connections, or pieces the artist has cited/sampled/echoed if you know of one.
- If it's a NON-CLASSICAL SONG: describe its specific mood/energy/production style in plain, relatable language (no jargon), then recommend 3 classical pieces that bridge from it. Be warm and completely free of condescension or "eat your vegetables" energy about classical music — film/TV/game-score connections are great easy bridges here.

Whichever type it is, describe the identified starting point in exactly ONE short plain-language sentence, then recommend exactly 3 classical works at increasing distance:
- step 1 ("Comfortable next step"): the closest, most direct connection
- step 2 ("A stretch"): a genuine new direction, still clearly connected
- step 3 ("A reach"): further removed, with a real, explainable bridge back to the original

Each reason must name ONE specific musical connection (form, era, technique, emotional register, instrumentation, or direct influence) in ONE short sentence, maximum 25 words — never vague "if you like this you'll like that." Be concise everywhere; brevity matters more than completeness.

Respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "title": "Composer — Work title (or artist/composer name where there's no single work)",
  "desc": "One short sentence.",
  "recs": [
    { "title": "Composer — Work title", "composer": "Composer name", "step": 1, "reason": "One short sentence, may use <b></b> to bold the key phrase." },
    { "title": "Composer — Work title", "composer": "Composer name", "step": 2, "reason": "..." },
    { "title": "Composer — Work title", "composer": "Composer name", "step": 3, "reason": "..." }
  ]
}`;

app.post("/api/recommend", async (req, res) => {
  const { input } = req.body;
  if (!input || !input.trim()) {
    return res.status(400).json({ error: "Input is required" });
  }
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: PROMPT_TEMPLATE(input.trim()) }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      return res.status(500).json({ error: "No response text from model" });
    }
    let clean = textBlock.text.replace(/```json|```/g, "").trim();
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace === -1) {
      return res.status(500).json({ error: "Response wasn't JSON" });
    }
    clean = clean.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
