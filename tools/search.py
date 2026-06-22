#!/usr/bin/env python3
"""Zero-dependency keyword search over the HackTricks knowledge base.

Usage:
    python3 tools/search.py "kerberoasting"
    python3 tools/search.py --limit 5 "sql injection waf bypass"
    python3 tools/search.py --text "active directory privilege escalation"
    python3 tools/search.py --show knowledge/pentesting-web/sql-injection/README.md

Default output is JSON (designed to be parsed by an AI/agent). Pass --text for
a human-readable list. --show prints a single file's contents.

Results are ranked by weighted term matches in title > headings > path >
description > body. Each result includes a snippet and the file path to open.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "manifest.json"


def load_manifest():
    if not MANIFEST.exists():
        sys.exit("manifest.json not found — run from the repo root.")
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


def tokenize(s):
    return [t for t in re.split(r"[^a-z0-9]+", s.lower()) if len(t) > 1]


def score_doc(entry, body_lower, terms, phrase):
    title = entry["title"].lower()
    path = entry["path"].lower()
    heads = " ".join(entry.get("headings", [])).lower()
    desc = entry.get("description", "").lower()
    score = 0
    hits = 0
    for t in terms:
        c_title = title.count(t)
        c_head = heads.count(t)
        c_path = path.count(t)
        c_desc = desc.count(t)
        c_body = body_lower.count(t)
        if c_title or c_head or c_path or c_desc or c_body:
            hits += 1
        score += c_title * 10 + c_head * 4 + c_path * 3 + c_desc * 2 + min(c_body, 25)
    if hits == len(terms) and terms:          # all terms present somewhere
        score += 20
    if phrase and phrase in body_lower:        # exact phrase bonus
        score += 30
    if phrase and phrase in title:
        score += 40
    return score


def snippet(body, terms, width=220):
    low = body.lower()
    pos = -1
    for t in terms:
        p = low.find(t)
        if p != -1 and (pos == -1 or p < pos):
            pos = p
    if pos == -1:
        return ""
    start = max(0, pos - 60)
    seg = body[start:start + width].replace("\n", " ")
    seg = re.sub(r"\s+", " ", seg).strip()
    return ("…" if start else "") + seg + "…"


def main():
    ap = argparse.ArgumentParser(description="Search the HackTricks knowledge base.")
    ap.add_argument("query", nargs="*", help="search terms")
    ap.add_argument("--limit", "-n", type=int, default=8)
    ap.add_argument("--text", action="store_true", help="human-readable output")
    ap.add_argument("--show", metavar="PATH", help="print one file and exit")
    args = ap.parse_args()

    if args.show:
        f = (ROOT / args.show).resolve()
        if ROOT not in f.parents or not f.exists():
            sys.exit(f"not found: {args.show}")
        sys.stdout.write(f.read_text(encoding="utf-8"))
        return

    query = " ".join(args.query).strip()
    if not query:
        sys.exit("provide a query, e.g.  search.py \"kerberoasting\"")
    phrase = query.lower()
    terms = tokenize(query)

    results = []
    for entry in load_manifest():
        f = ROOT / entry["path"]
        try:
            body = f.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        s = score_doc(entry, body.lower(), terms, phrase)
        if s > 0:
            results.append((s, entry, body))
    results.sort(key=lambda x: x[0], reverse=True)
    results = results[: args.limit]

    if args.text:
        if not results:
            print("no matches.")
            return
        for s, e, body in results:
            print(f"[{s:>4}] {e['title']}  —  {e['path']}")
            sn = snippet(body, terms)
            if sn:
                print(f"        {sn}")
        return

    out = [{
        "title": e["title"],
        "path": e["path"],
        "category": e.get("category", ""),
        "score": s,
        "snippet": snippet(body, terms),
    } for s, e, body in results]
    print(json.dumps({"query": query, "count": len(out), "results": out},
                     indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
