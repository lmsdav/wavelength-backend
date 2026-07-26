/* M1 test harness.
   Fires a fresh random set at a running instance, validates every response,
   and writes a log plus a summary.

   Usage:
     BASE_URL=http://localhost:3000 node test/run-searches.js
     BASE_URL=https://your-app.up.railway.app node test/run-searches.js
*/
import fs from "node:fs";
import path from "node:path";
import { generateSet } from "./generate-set.js";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const OUT  = path.join(process.cwd(), "test", "results");
const GAP_MS = Number(process.env.GAP_MS || 400);

const PRICE = { in: 1.00 / 1e6, out: 5.00 / 1e6 };  // Haiku 4.5, USD ex-VAT
const VAT = 1.20;

function checkShape(d){
  const problems = [];
  if (!d || typeof d !== "object") return ["not an object"];
  if (typeof d.title !== "string" || !d.title.trim()) problems.push("title missing");
  if (typeof d.desc  !== "string" || !d.desc.trim())  problems.push("desc missing");
  if (!Array.isArray(d.recs) || d.recs.length !== 3) { problems.push("recs not 3"); return problems; }
  const steps = d.recs.map(r => r.step).sort().join(",");
  if (steps !== "1,2,3") problems.push(`steps are ${steps}`);
  d.recs.forEach((r,i) => {
    ["title","composer","reason"].forEach(f => {
      if (typeof r[f] !== "string" || !r[f].trim()) problems.push(`rec${i+1} ${f} missing`);
    });
    if (typeof r.reason === "string") {
      const words = r.reason.replace(/<\/?b>/g,"").trim().split(/\s+/).length;
      if (words > 30) problems.push(`rec${i+1} reason ${words} words (limit 25, tolerance 30)`);
    }
    const bad = String(r.title||"") + String(r.composer||"") + String(r.reason||"");
    if (/<script|onerror=|onload=|javascript:/i.test(bad)) problems.push(`rec${i+1} DANGEROUS CONTENT`);
  });
  return problems;
}

async function one(item){
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: item.term })
    });
    const ms = Date.now() - started;
    let body = null;
    try { body = await res.json(); } catch { /* non-JSON */ }

    if (!res.ok) {
      return { ...item, ok:false, http:res.status, ms, problems:[`HTTP ${res.status}: ${body?.error||"no body"}`], data:null };
    }
    const problems = checkShape(body);
    return { ...item, ok: problems.length===0, http:res.status, ms, problems, data:body };
  } catch (e) {
    return { ...item, ok:false, http:0, ms:Date.now()-started, problems:[`request failed: ${e.message}`], data:null };
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g,"-");
  const set = generateSet();

  console.log(`Classical Wavelength — M1 test run`);
  console.log(`Target : ${BASE}`);
  console.log(`Set    : ${set.length} fresh random inputs`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  try {
    const h = await fetch(`${BASE}/health`);
    console.log(`Health : ${h.status} ${JSON.stringify(await h.json())}\n`);
  } catch { console.log(`Health : UNREACHABLE — is the server running?\n`); }

  const results = [];
  for (let i = 0; i < set.length; i++) {
    const r = await one(set[i]);
    results.push(r);
    const mark = r.ok ? "PASS" : "FAIL";
    console.log(`${String(i+1).padStart(2)}/${set.length} ${mark}  ${String(r.ms).padStart(5)}ms  [${r.category}] ${r.term.slice(0,50)}`);
    if (!r.ok) r.problems.forEach(p => console.log(`         ! ${p}`));
    await sleep(GAP_MS);
  }

  const pass = results.filter(r => r.ok).length;
  const byCat = {};
  results.forEach(r => {
    byCat[r.category] ??= { pass:0, total:0 };
    byCat[r.category].total++;
    if (r.ok) byCat[r.category].pass++;
  });
  const times = results.map(r => r.ms).sort((a,b)=>a-b);

  const summary = {
    runAt: new Date().toISOString(),
    target: BASE,
    total: results.length,
    passed: pass,
    failed: results.length - pass,
    passRate: `${((pass/results.length)*100).toFixed(1)}%`,
    latencyMs: { median: times[Math.floor(times.length/2)], min: times[0], max: times[times.length-1] },
    byCategory: byCat,
    note: "Token cost is read from the SERVER LOG, not from here — the API does not return usage to the client.",
    costModel: { model: "claude-haiku-4-5", usdPerMInput: 1.0, usdPerMOutput: 5.0, vatMultiplier: VAT }
  };

  fs.writeFileSync(path.join(OUT, `run-${stamp}.json`), JSON.stringify({ summary, results }, null, 2));
  fs.writeFileSync(path.join(OUT, `run-${stamp}.csv`),
    "n,category,term,pass,http,ms,problems\n" +
    results.map((r,i)=>[i+1,r.category,JSON.stringify(r.term),r.ok,r.http,r.ms,JSON.stringify(r.problems.join("; "))].join(",")).join("\n"));

  console.log(`\n${"=".repeat(60)}`);
  console.log(`PASSED ${pass}/${results.length}  (${summary.passRate})`);
  console.log(`Latency median ${summary.latencyMs.median}ms, max ${summary.latencyMs.max}ms`);
  Object.entries(byCat).forEach(([c,v]) => console.log(`  ${c.padEnd(15)} ${v.pass}/${v.total}`));
  console.log(`\nWritten to test/results/run-${stamp}.json and .csv`);
  process.exit(pass === results.length ? 0 : 1);
})();
