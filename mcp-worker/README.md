# mcp-worker — HackTricks MCP server (Cloudflare Worker + D1)

The deployable MCP server. For full deploy/connect instructions see the
[root README](../README.md). This file documents the worker internals.

## Files

| File | Purpose |
|------|---------|
| `src/index.js` | The Worker: stateless Streamable-HTTP MCP (JSON-RPC), bearer auth, D1 queries |
| `schema.sql` | D1 schema: `docs` table + `docs_fts` (FTS5, porter stemming) |
| `scripts/build-sql.mjs` | Generates `data.sql` from `../manifest.json` + `../knowledge/` |
| `wrangler.toml.example` | Config template — copy to `wrangler.toml` and add your `database_id` |
| `setup.sh` | One-shot deploy (create D1 → load data → set token → deploy) |

`wrangler.toml`, `data.sql`, and `node_modules/` are git-ignored (local/derived).

## Deploy

```bash
npm install
npx wrangler login
./setup.sh
```

## Tools

- `search(query, limit=5, include_content=true)` — BM25 full-text search → ranked results; by default each includes the page's full markdown in `content` (set `include_content=false` for `snippet` only). Bodies over 45 KB are truncated with a pointer to `get_page`.
- `get_page(path)` — full markdown for one page.
- `list_section(section)` — all pages under a top-level folder (e.g. `windows-hardening`).

## Auth

Set the `MCP_TOKEN` secret to require `Authorization: Bearer <token>`:
```bash
printf '%s' "$(openssl rand -hex 32)" | npx wrangler secret put MCP_TOKEN
```
The check is constant-time and only active when the secret is set. Without it, the endpoint is open.

## Notes

- D1 caps a single SQL statement at ~100 KB, so `build-sql.mjs` chunks large doc
  bodies across an INSERT + appending UPDATEs, and emits **no** `BEGIN/COMMIT`
  (which conflicts with `wrangler d1 execute --remote` auto-batching).
- The Worker is stateless (no Durable Objects) and carries no bundled data — all
  content lives in D1 — which keeps the bundle ~7 KiB and cold starts fast.

## Local dev

```bash
npm run build:sql
npx wrangler d1 execute hacktricks --local --file=schema.sql
npx wrangler d1 execute hacktricks --local --file=data.sql
npx wrangler dev          # http://localhost:8787/mcp  (no token unless MCP_TOKEN set)
```
