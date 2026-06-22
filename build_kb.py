#!/usr/bin/env python3
"""Build an AI-friendly knowledge base from the HackTricks mdBook source.

Reads SRC (the hacktricks/src tree), copies every .md into DST/knowledge/
with mdBook directives converted to plain markdown, then emits INDEX.md and
manifest.json for navigation/search.
"""
import json
import re
import shutil
from pathlib import Path

SRC = Path("/home/ubuntu/hacktricks/src")
DST = Path("/home/ubuntu/hacktricks-ai")
KN = DST / "knowledge"

IMG_EXT = r"png|jpg|jpeg|gif|svg|webp|PNG|bmp|ico"

# ---------------------------------------------------------------- cleaning ---

def clean(text: str) -> str:
    M = re.M
    S = re.S

    # 1. drop any line carrying a banner include (may be prefixed by # or >)
    text = re.sub(r"(?m)^.*\{\{#include[^\n]*\}\}.*$\n?", "", text)

    # 2. {{#file}} <name> {{#endfile}} (block) -> note (binary not carried over)
    text = re.sub(
        r"[ \t>]*\{\{#file\}\}[ \t]*\n[ \t>]*(.+?)[ \t]*\n[ \t>]*\{\{#endfile\}\}",
        r"> Attached file (not included in this KB): `\1`",
        text, flags=S)

    # 3. {{#ref}} <target> {{#endref}} standalone block -> "Related" link
    text = re.sub(
        r"(?m)^[ \t>]*\{\{#ref\}\}[ \t]*\n[ \t>]*(\S+?)[ \t]*\n[ \t>]*\{\{#endref\}\}[ \t]*$",
        r"> Related: [\1](\1)", text)
    # 3b. inline {{#ref}}target{{#endref}} -> bare target (works inside links/prose)
    text = re.sub(r"\{\{#ref\}\}\s*(.*?)\s*\{\{#endref\}\}", r"\1", text, flags=S)

    # 4. tabs
    text = re.sub(r'(?m)^[ \t>]*\{\{#tab name="([^"]*)"\}\}[ \t]*$', r"\n**\1**\n", text)
    text = re.sub(r"(?m)^[ \t>]*\{\{#(?:tabs|endtabs|endtab)\}\}[ \t]*$\n?", "", text)

    # 5. any remaining {{#...}} / {{/...}} handlebars tags -> drop the tag, keep content
    text = re.sub(r"\{\{[#/][^}]*\}\}", "", text)

    # 6. images & figure chrome (binaries are not carried over)
    text = re.sub(rf"!\[[^\]]*\]\([^)]*\.(?:{IMG_EXT})\)", "", text)
    text = re.sub(r"<img\b[^>]*?/?>", "", text, flags=re.I)
    text = re.sub(r"</?figure>", "", text, flags=re.I)
    text = re.sub(r"<figcaption>\s*</figcaption>", "", text, flags=re.I)
    text = re.sub(r"</?figcaption>", "", text, flags=re.I)

    # 7. collapse blank-line runs
    text = re.sub(r"[ \t]+$", "", text, flags=M)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def first_desc(text: str) -> str:
    for line in text.split("\n"):
        s = line.strip()
        if not s or s.startswith(("#", ">", "{", "!", "|", "-", "*", "```", "<", "}")):
            continue
        s = re.sub(r"[*_`\[\]]", "", s)          # strip md emphasis/links chrome
        s = re.sub(r"\(https?://[^)]+\)", "", s)
        s = s.strip()
        if len(s) > 30:
            return (s[:200] + "…") if len(s) > 200 else s
    return ""


def headings(text: str):
    hs = []
    for line in text.split("\n"):
        m = re.match(r"^##\s+(.*)", line.strip())
        if m:
            h = re.sub(r"[*_`]", "", m.group(1)).strip()
            if h:
                hs.append(h)
    return hs[:15]

# ---------------------------------------------------------------- build ------

def main():
    if KN.exists():
        shutil.rmtree(KN)
    KN.mkdir(parents=True)

    md_files = sorted(SRC.rglob("*.md"))
    meta = {}  # relpath -> {desc, headings}
    for f in md_files:
        rel = f.relative_to(SRC)
        cleaned = clean(f.read_text(encoding="utf-8", errors="replace"))
        dest = KN / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(cleaned, encoding="utf-8")
        meta[str(rel)] = {"desc": first_desc(cleaned), "headings": headings(cleaned)}

    print(f"copied+cleaned {len(md_files)} markdown files")

    # ---- parse SUMMARY.md to build ordered navigation ----
    summary = (SRC / "SUMMARY.md").read_text(encoding="utf-8").split("\n")
    index_lines = ["# HackTricks Knowledge Base — Index",
                   "",
                   "Topic map. Each entry links to a file under `knowledge/`.",
                   ""]
    manifest = []
    seen = set()
    link_re = re.compile(r"^(\s*)-\s+\[([^\]]+)\]\(([^)]+)\)")
    head_re = re.compile(r"^(#+)\s+(.*)")
    current_section = ""
    for line in summary:
        hm = head_re.match(line.strip())
        if hm and not line.strip().startswith("- "):
            title = re.sub(r"[*_`]", "", hm.group(2)).strip()
            if title and title.upper() != "SUMMARY.MD":
                current_section = title
                index_lines += ["", f"## {title}", ""]
            continue
        lm = link_re.match(line)
        if not lm:
            continue
        indent, title, path = lm.group(1), lm.group(2).strip(), lm.group(3).strip()
        if path.startswith("http") or not path.endswith(".md"):
            continue
        depth = len(indent) // 2
        info = meta.get(path, {"desc": "", "headings": []})
        desc = info["desc"]
        bullet = "  " * depth + f"- [{title}](knowledge/{path})"
        if desc:
            bullet += f" — {desc}"
        index_lines.append(bullet)
        if path not in seen:
            seen.add(path)
            manifest.append({
                "title": title,
                "path": f"knowledge/{path}",
                "category": current_section or path.split("/")[0],
                "section_path": path.split("/")[0],
                "description": desc,
                "headings": info["headings"],
            })

    # include orphan files (present on disk, absent from SUMMARY) so nothing is lost
    orphans = 0
    for rel, info in sorted(meta.items()):
        if rel in seen:
            continue
        orphans += 1
        manifest.append({
            "title": Path(rel).stem.replace("-", " ").title(),
            "path": f"knowledge/{rel}",
            "category": "(unlisted)",
            "section_path": rel.split("/")[0],
            "description": info["desc"],
            "headings": info["headings"],
        })
    if orphans:
        index_lines += ["", "## (Unlisted / orphan pages)", ""]
        for rel, info in sorted(meta.items()):
            if rel in seen:
                continue
            d = f" — {info['desc']}" if info["desc"] else ""
            index_lines.append(f"- [{rel}](knowledge/{rel}){d}")

    (DST / "INDEX.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")
    (DST / "manifest.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"index entries: {len(manifest)} (orphans: {orphans})")

    # carry license for attribution
    lic = SRC / "LICENSE.md"
    if lic.exists():
        shutil.copy(lic, DST / "LICENSE.md")
    print("done")


if __name__ == "__main__":
    main()
