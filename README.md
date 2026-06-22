# HackTricks MCP

**A fast, self-hostable [MCP](https://modelcontextprotocol.io) server that gives AI agents instant, token-authenticated access to the entire [HackTricks](https://github.com/HackTricks-wiki/hacktricks) security wiki.**

HackTricks is one of the best offensive-security references on the internet — but it's a website: HTML pages, a 78 MB client-side search blob, banners, and ~140 MB of screenshots. That's slow and token-expensive for an AI agent to consume. This project strips it down to clean markdown, indexes it for full-text search, and serves it from a single Cloudflare Worker so any agent can `search` and `read` it in milliseconds.

> ⚖️ **For authorized security work only** — pentests within scope, CTFs, research, and defensive hardening. See [Disclaimer](#disclaimer).

---

## Features

- 🔎 **Full-text search** over **981 docs** with BM25 ranking + porter stemming (`kerberoasting` matches `kerberoast`).
- ⚡ **Fast** — search is one indexed query in Cloudflare D1 (sub-20 ms); the Worker bundle is ~7 KiB so cold starts are negligible.
- 🔌 **Standard MCP** over Streamable HTTP — works with Claude Code, Claude.ai, and any MCP client.
- 🔐 **Bearer-token auth** — your endpoint is private by default.
- 📦 **Self-hostable in one command** — `./setup.sh` on a free Cloudflare account.
- 🧹 **Clean markdown corpus** — no HTML, banners, or images; usable on its own (grep / `tools/search.py`) without deploying anything.

## Tools the server exposes

| Tool | Arguments | Returns |
|------|-----------|---------|
| `search` | `query` (string), `limit` (int ≤ 25) | Ranked matches: `title`, `path`, `category`, `snippet` |
| `get_page` | `path` (string) | Full clean markdown of one page |
| `list_section` | `section` (string, e.g. `pentesting-web`) | Every page in a top-level section |

Typical agent flow: **`search`** for a technique → **`get_page`** on the best path → use the commands/payloads.

## Repository layout

```
knowledge/         981 cleaned markdown docs; the folder tree is the topic taxonomy
INDEX.md           human-readable topic map (title → path + one-line description)
manifest.json      machine-readable index (title, path, category, headings, description)
AGENTS.md          how an AI agent should use the raw corpus
build_kb.py        rebuilds knowledge/ + INDEX + manifest from upstream HackTricks src/
tools/search.py    zero-dependency local keyword search (no deploy needed)
mcp-worker/        the Cloudflare Worker MCP server (D1 + FTS5)
```

---

## Deploy your own MCP server

### Prerequisites
- A **Cloudflare account** (free tier is plenty).
- **Node.js ≥ 22** and **openssl**.

### One command

```bash
git clone https://github.com/<you>/hacktricks-mcp.git
cd hacktricks-mcp/mcp-worker
npm install
npx wrangler login          # or: export CLOUDFLARE_API_TOKEN=...
./setup.sh
```

`setup.sh` creates the D1 database, loads the 981 docs, generates a random bearer token, sets it as a secret, and deploys. It prints your endpoint URL and token at the end.

<details>
<summary>Prefer manual steps?</summary>

```bash
cd mcp-worker
npm install
cp wrangler.toml.example wrangler.toml
npx wrangler d1 create hacktricks            # paste the database_id into wrangler.toml
npm run build:sql                            # generate data.sql from ../knowledge
npx wrangler d1 execute hacktricks --remote --file=schema.sql
npx wrangler d1 execute hacktricks --remote --file=data.sql
printf '%s' "$(openssl rand -hex 32)" | npx wrangler secret put MCP_TOKEN   # save this token!
npx wrangler deploy
```
</details>

## Connect a client

Replace `<url>` with your `https://hacktricks-mcp.<subdomain>.workers.dev/mcp` and `<token>` with your bearer token.

**Claude Code**
```bash
claude mcp add --transport http hacktricks <url> --header "Authorization: Bearer <token>"
```

**Claude.ai / Claude Desktop** — add a Custom Connector with the URL, and set the `Authorization: Bearer <token>` header.

**Generic MCP client config**
```json
{
  "mcpServers": {
    "hacktricks": {
      "type": "http",
      "url": "<url>",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

**Smoke test with curl**
```bash
curl -s <url> \
  -H "Authorization: Bearer <token>" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search","arguments":{"query":"kerberoasting"}}}'
```

---

## Use it locally (no deployment)

The corpus is plain markdown — you don't need Cloudflare to use it:

```bash
python3 tools/search.py "sql injection waf bypass"      # ranked results as JSON
python3 tools/search.py --show knowledge/pentesting-web/sql-injection/README.md
grep -ril "golden ticket" knowledge/
```

## Architecture & why it's fast

- **Storage:** Cloudflare **D1** (SQLite at the edge) with an **FTS5** full-text index. Search is a single BM25 query; `get_page` is a primary-key lookup.
- **Worker:** stateless **Streamable HTTP** MCP (hand-rolled JSON-RPC, zero runtime deps). No Durable Objects, no bundled data → tiny and quick to cold-start.
- **Auth:** constant-time bearer-token check; only runs when the `MCP_TOKEN` secret is set.

## Authentication

The Worker requires `Authorization: Bearer <MCP_TOKEN>` on every request whenever the `MCP_TOKEN` secret is configured (it is, after `setup.sh`). Rotate any time:
```bash
printf '%s' "<new-token>" | npx wrangler secret put MCP_TOKEN
```
If you deploy **without** setting `MCP_TOKEN`, the endpoint is open — set the secret to lock it down.

## Updating content from upstream

```bash
python3 build_kb.py                          # re-clean knowledge/ from a fresh HackTricks src/
cd mcp-worker && npm run build:sql
npx wrangler d1 execute hacktricks --remote --file=schema.sql
npx wrangler d1 execute hacktricks --remote --file=data.sql
npx wrangler deploy
```

---

## Attribution & license

All knowledge content is from **[HackTricks](https://github.com/HackTricks-wiki/hacktricks)** by **Carlos Polop** and contributors, licensed under **[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)** (Attribution–NonCommercial). See [`LICENSE.md`](LICENSE.md).

This repository is an unofficial, reformatted **non-commercial** mirror for AI-assisted research. It is **not affiliated with or endorsed by** HackTricks. The wrapper tooling (`mcp-worker/`, `tools/`, `build_kb.py`) is provided under the MIT license, but the repository as a whole inherits the **NonCommercial** restriction of the underlying content — **do not use it commercially.**

## Disclaimer

This material is for **authorized** security testing and education only — engagements you have explicit permission to perform, CTFs, and defensive work. You are responsible for complying with all applicable laws. The authors accept no liability for misuse.

## Credits

- Content: [HackTricks](https://book.hacktricks.wiki) — Carlos Polop & contributors.
- Built on [Cloudflare Workers](https://workers.cloudflare.com/) + [D1](https://developers.cloudflare.com/d1/) and the [Model Context Protocol](https://modelcontextprotocol.io).
