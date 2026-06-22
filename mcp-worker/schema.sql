-- HackTricks MCP — D1 schema
-- Run this first (db:schema), then load data.sql (db:data).

DROP TABLE IF EXISTS docs_fts;
DROP TABLE IF EXISTS docs;

CREATE TABLE docs (
  id           INTEGER PRIMARY KEY,
  path         TEXT UNIQUE NOT NULL,   -- e.g. knowledge/pentesting-web/sql-injection/README.md
  title        TEXT NOT NULL,
  category     TEXT,
  section_path TEXT,                    -- top-level folder, e.g. pentesting-web
  headings     TEXT,                    -- H2 headings joined with ' • '
  body         TEXT NOT NULL
);

CREATE INDEX idx_docs_section ON docs(section_path);

-- Full-text index. Porter stemming so "kerberoasting" matches "kerberoast".
-- External-content table backed by docs (no body duplication).
CREATE VIRTUAL TABLE docs_fts USING fts5(
  title, headings, body, path,
  content='docs',
  content_rowid='id',
  tokenize='porter unicode61'
);
