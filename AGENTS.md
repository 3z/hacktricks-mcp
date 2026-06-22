# Using this knowledge base (instructions for an AI agent)

This repository is a **machine-readable mirror of the HackTricks security wiki**:
982 markdown documents covering offensive/defensive security techniques (web,
network services, Active Directory, Linux/macOS/Windows privilege escalation,
binary exploitation, cloud, mobile, reversing, etc.). All website chrome,
images, banners, and mdBook directives have been stripped — every file is plain
markdown you can read directly and cheaply.

Use this as a **reference/lookup source** when you need concrete commands,
payloads, tool usage, or methodology for an authorized security task.

> If you'd rather query this remotely instead of from the filesystem, deploy the
> MCP server in [`mcp-worker/`](mcp-worker/) (see the [root README](README.md))
> — it exposes the same content as `search` / `get_page` / `list_section` tools.

## Layout

```
knowledge/        982 .md files; the directory tree IS the topic taxonomy
INDEX.md          full topic map: human title -> file path + 1-line description
manifest.json     same data, machine-readable (array of entries)
tools/search.py   zero-dependency keyword search (no install needed)
```

`manifest.json` entry shape:

```json
{
  "title":       "SQL Injection",
  "path":        "knowledge/pentesting-web/sql-injection/README.md",
  "category":    "🔓 Pentesting Web",
  "section_path":"pentesting-web",
  "description": "An SQL injection is a security flaw that ...",
  "headings":    ["What is SQL injection?", "Entry point detection", ...]
}
```

## How to find what you need (cheapest path first)

1. **Keyword search** — best default:
   ```bash
   python3 tools/search.py "kerberoasting"            # -> JSON: ranked paths + snippets
   python3 tools/search.py -n 5 "sql injection waf bypass"
   python3 tools/search.py --text "active directory privilege escalation"
   ```
   Results are ranked (title > headings > path > description > body) and each
   includes the `path` to open.

2. **Scan the map** — `INDEX.md` (or `manifest.json`) when you want to browse a
   whole area. Filter by `section_path`/`category` to list a domain's pages.

3. **Direct grep** — the corpus is plain text:
   ```bash
   grep -ril "golden ticket" knowledge/
   ```

## How to read a page

Open the file at `path` directly (it's clean markdown), or:
```bash
python3 tools/search.py --show knowledge/<...>.md
```
Cross-references between pages appear as `> Related: [target](target)` links and
as relative markdown links — follow them to drill in. The directory tree is
meaningful: a folder's `README.md` is the overview; sibling files are subtopics.

## Workflow recommendation

1. `search.py` with 2–4 specific terms → pick the best `path`(s).
2. Read those file(s) in full (they're small).
3. Follow `Related:` links if you need adjacent technique detail.
4. Extract the exact commands/payloads and adapt them to the target.

## Scope / authorized use

This is reference material for **authorized** security work — penetration tests
with scope, CTFs, security research, and defensive hardening. Apply the
techniques only against systems you are permitted to test. Content credits and
license belong to the upstream HackTricks project (see `README.md`/`LICENSE.md`).
