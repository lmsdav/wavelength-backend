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
      messages: [
        {
          role: "user",
          content: PROMPT_TEMPLATE(input.trim()),
        },
      ],
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
