#!/usr/bin/env node
// Generate data.sql (D1 inserts) from ../manifest.json + ../knowledge/*.md
// Run schema.sql first, then load this file.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", ".."); // hacktricks-ai/
const out = join(here, "..", "data.sql");

const manifest = JSON.parse(readFileSync(join(repo, "manifest.json"), "utf8"));
const esc = (s) => (s == null ? "" : String(s).replace(/'/g, "''"));

// D1 caps a single SQL statement at ~100 KB. Keep each statement well under
// that by appending the body in chunks (split on code points, never inside a
// surrogate pair). Most docs fit in one INSERT; big ones get UPDATE appends.
const CHUNK = 45000;
function chunkBody(body) {
  const cps = Array.from(body);
  const out = [];
  for (let i = 0; i < cps.length; i += CHUNK) out.push(cps.slice(i, i + CHUNK).join(""));
  return out.length ? out : [""];
}

const SKIP = new Set(["knowledge/SUMMARY.md"]); // redundant nav (INDEX.md covers it)

// No explicit BEGIN/COMMIT: `wrangler d1 execute --remote` auto-batches and
// rejects nested transactions. Statement order is preserved by wrangler.
const lines = [];

let id = 0;
for (const e of manifest) {
  if (SKIP.has(e.path)) continue;
  let body;
  try {
    body = readFileSync(join(repo, e.path), "utf8");
  } catch {
    continue;
  }
  id++;
  const headings = Array.isArray(e.headings) ? e.headings.join(" • ") : "";
  const chunks = chunkBody(body);
  lines.push(
    `INSERT INTO docs(id,path,title,category,section_path,headings,body) VALUES (` +
      `${id},'${esc(e.path)}','${esc(e.title)}','${esc(e.category)}',` +
      `'${esc(e.section_path)}','${esc(headings)}','${esc(chunks[0])}');`
  );
  for (let c = 1; c < chunks.length; c++) {
    lines.push(`UPDATE docs SET body = body || '${esc(chunks[c])}' WHERE id=${id};`);
  }
}

// populate the FTS index from the freshly inserted rows
lines.push(
  "INSERT INTO docs_fts(rowid,title,headings,body,path) " +
    "SELECT id,title,headings,body,path FROM docs;"
);
writeFileSync(out, lines.join("\n") + "\n");
console.error(`wrote ${out} — ${id} docs`);
