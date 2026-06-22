#!/usr/bin/env bash
# One-shot deploy for the HackTricks MCP server (Cloudflare Worker + D1 + FTS5).
#
#   cd mcp-worker && ./setup.sh
#
# Prereqs: Node >= 22, a Cloudflare account, and you must be authenticated to
# wrangler first (run `npx wrangler login`, or export CLOUDFLARE_API_TOKEN).
set -euo pipefail
cd "$(dirname "$0")"

DB_NAME="hacktricks"
UUID_RE='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
wr() { npx wrangler "$@"; }

echo "==> Checking prerequisites"
command -v node >/dev/null || { echo "Node.js is required"; exit 1; }
command -v openssl >/dev/null || { echo "openssl is required"; exit 1; }
[ -d node_modules ] || { echo "==> Installing deps"; npm install; }

echo "==> Verifying Cloudflare auth"
wr whoami >/dev/null 2>&1 || { echo "Not authenticated. Run 'npx wrangler login' (or export CLOUDFLARE_API_TOKEN) and retry."; exit 1; }

echo "==> Creating D1 database '$DB_NAME' (reusing if it already exists)"
CREATE_OUT="$(wr d1 create "$DB_NAME" 2>&1 || true)"
DB_ID="$(printf '%s' "$CREATE_OUT" | grep -oE "$UUID_RE" | head -1 || true)"
if [ -z "$DB_ID" ]; then
  # already exists — look it up
  DB_ID="$(wr d1 info "$DB_NAME" --json 2>/dev/null | grep -oE "$UUID_RE" | head -1 || true)"
fi
[ -n "$DB_ID" ] || { echo "Could not determine D1 database id."; echo "$CREATE_OUT"; exit 1; }
echo "    database_id = $DB_ID"

echo "==> Writing wrangler.toml"
sed "s/PASTE_YOUR_D1_DATABASE_ID_HERE/$DB_ID/" wrangler.toml.example > wrangler.toml

echo "==> Building data.sql from ../manifest.json + ../knowledge"
npm run --silent build:sql

echo "==> Loading schema + data into remote D1 (this takes a minute)"
wr d1 execute "$DB_NAME" --remote --yes --file=schema.sql >/dev/null
wr d1 execute "$DB_NAME" --remote --yes --file=data.sql  >/dev/null

echo "==> Generating and setting MCP_TOKEN secret"
TOKEN="$(openssl rand -hex 32)"
printf '%s' "$TOKEN" | wr secret put MCP_TOKEN >/dev/null

echo "==> Deploying Worker"
URL="$(wr deploy 2>&1 | grep -oE 'https://[^ ]+\.workers\.dev' | head -1 || true)"

cat <<EOF

============================================================
✅ Deployed.

  MCP endpoint : ${URL:-https://<your-worker>.<subdomain>.workers.dev}/mcp
  Bearer token : $TOKEN

Keep that token safe — it's required on every request and is not shown again.
Rotate any time with:  printf '%s' "<new-token>" | npx wrangler secret put MCP_TOKEN

Add to Claude Code:
  claude mcp add --transport http hacktricks ${URL:-<url>}/mcp \\
    --header "Authorization: Bearer $TOKEN"
============================================================
EOF
