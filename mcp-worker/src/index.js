// HackTricks MCP server on Cloudflare Workers.
// Stateless Streamable-HTTP transport (JSON-RPC over POST). Backed by D1 + FTS5.

const SERVER_INFO = { name: "hacktricks-mcp", version: "1.0.0" };
const PROTOCOL = "2025-06-18";
const MAX_LIMIT = 25;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id, Mcp-Protocol-Version, Authorization",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

const TOOLS = [
  {
    name: "search",
    description:
      "Full-text search the HackTricks security knowledge base (981 docs: web, AD, " +
      "Linux/macOS/Windows privesc, network services, binary exploitation, cloud, mobile, etc.). " +
      "By DEFAULT returns the ranked matching pages WITH their full markdown content (the `content` " +
      "field), so you can read and use the techniques directly from this one call — no follow-up needed. " +
      "Set include_content=false for lightweight snippet-only discovery. Use 2-4 specific terms.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords, e.g. 'kerberoasting' or 'sql injection waf bypass'." },
        limit: {
          type: "integer",
          description: "Max results (default 5 with content, 8 without; max 25).",
        },
        include_content: {
          type: "boolean",
          description: "Include each page's full markdown in `content` (default true). Set false for snippets only.",
          default: true,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_page",
    description:
      "Return the full clean markdown of one knowledge-base page by its exact path " +
      "(the `path` field returned by search), e.g. knowledge/pentesting-web/sql-injection/README.md.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Exact page path from a search result." } },
      required: ["path"],
    },
  },
  {
    name: "list_section",
    description:
      "List every page in a top-level section (folder), e.g. 'pentesting-web', " +
      "'windows-hardening', 'linux-hardening', 'binary-exploitation'. Use to browse a domain.",
    inputSchema: {
      type: "object",
      properties: { section: { type: "string", description: "Top-level folder name (section_path)." } },
      required: ["section"],
    },
  },
];

// ---- tool implementations -------------------------------------------------

function ftsMatch(query) {
  const toks = (query.toLowerCase().match(/[a-z0-9]{2,}/g) || []).slice(0, 12);
  if (!toks.length) return null;
  // prefix-match each token, OR them; bm25 ranks docs with more/heavier hits first
  return toks.map((t) => `${t}*`).join(" OR ");
}

const BODY_CAP = 45000; // per-result body char cap when returning content

async function doSearch(env, args) {
  const includeContent = args.include_content !== false; // default: return full content
  const def = includeContent ? 5 : 8;
  const cap = includeContent ? 10 : MAX_LIMIT; // bound response size when returning bodies
  const limit = Math.min(Math.max(parseInt(args.limit ?? def, 10) || def, 1), cap);
  const match = ftsMatch(String(args.query || ""));
  if (!match) return { query: args.query, count: 0, results: [] };
  const sql =
    `SELECT d.path AS path, d.title AS title, d.category AS category, ` +
    `snippet(docs_fts, 2, '«', '»', '…', 14) AS snippet, ` +
    `bm25(docs_fts, 8.0, 4.0, 1.0, 2.0) AS rank` +
    (includeContent ? `, d.body AS body` : ``) + ` ` +
    `FROM docs_fts JOIN docs d ON d.id = docs_fts.rowid ` +
    `WHERE docs_fts MATCH ?1 ORDER BY rank LIMIT ?2`;
  const { results } = await env.DB.prepare(sql).bind(match, limit).all();
  return {
    query: args.query,
    count: results.length,
    results: results.map((r) => {
      const out = {
        title: r.title,
        path: r.path,
        category: r.category,
        snippet: (r.snippet || "").replace(/\s+/g, " ").trim(),
      };
      if (includeContent) {
        const body = r.body || "";
        if (body.length > BODY_CAP) {
          out.content = body.slice(0, BODY_CAP) +
            `\n\n…[truncated — call get_page("${r.path}") for the full page]`;
          out.truncated = true;
        } else {
          out.content = body;
        }
      }
      return out;
    }),
  };
}

async function doGetPage(env, args) {
  const path = String(args.path || "").trim();
  if (!path) throw new Error("path is required");
  const row = await env.DB.prepare("SELECT path,title,category,body FROM docs WHERE path = ?1")
    .bind(path)
    .first();
  if (!row) throw new Error(`page not found: ${path}`);
  return row;
}

async function doListSection(env, args) {
  const section = String(args.section || "").trim();
  if (!section) throw new Error("section is required");
  const { results } = await env.DB.prepare(
    "SELECT path,title,headings FROM docs WHERE section_path = ?1 ORDER BY path"
  )
    .bind(section)
    .all();
  return { section, count: results.length, pages: results };
}

async function callTool(env, name, args) {
  args = args || {};
  if (name === "search") return doSearch(env, args);
  if (name === "get_page") return doGetPage(env, args);
  if (name === "list_section") return doListSection(env, args);
  throw new Error(`unknown tool: ${name}`);
}

// ---- JSON-RPC / MCP dispatch ---------------------------------------------

const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function handleRpc(env, msg) {
  const { id, method, params } = msg;
  // notifications (no id) — acknowledge with no body
  if (id === undefined || id === null) return null;

  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: params?.protocolVersion || PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "HackTricks security knowledge base. Call search(query) to find techniques, " +
          "then get_page(path) to read the full markdown. Authorized security work only.",
      });
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const name = params?.name;
      try {
        const data = await callTool(env, name, params?.arguments);
        return rpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(data, null, 1) }],
          structuredContent: data,
          isError: false,
        });
      } catch (e) {
        return rpcResult(id, {
          content: [{ type: "text", text: `Error: ${e.message}` }],
          isError: true,
        });
      }
    }
    default:
      return rpcError(id, -32601, `method not found: ${method}`);
  }
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

// Constant-time string compare (avoids leaking the token via timing).
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    if (request.method === "GET") {
      const protectedNote = env.MCP_TOKEN ? " (Bearer token required)" : " (no auth configured)";
      return new Response(
        "HackTricks MCP server. POST JSON-RPC (MCP Streamable HTTP) to this endpoint" +
          protectedNote + ".\nTools: search, get_page, list_section.\n",
        { status: 200, headers: { "Content-Type": "text/plain", ...CORS } }
      );
    }

    // Auth gate: when MCP_TOKEN is configured, require a matching Bearer token.
    if (env.MCP_TOKEN) {
      const auth = request.headers.get("Authorization") || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (!safeEqual(token, env.MCP_TOKEN)) {
        return new Response(JSON.stringify(rpcError(null, -32001, "Unauthorized: valid Bearer token required")), {
          status: 401,
          headers: { "Content-Type": "application/json", "WWW-Authenticate": "Bearer", ...CORS },
        });
      }
    }

    if (request.method !== "POST") return json(rpcError(null, -32600, "method not allowed"), 405);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(rpcError(null, -32700, "parse error"), 400);
    }

    // batch or single
    if (Array.isArray(payload)) {
      const out = [];
      for (const m of payload) {
        const r = await handleRpc(env, m);
        if (r) out.push(r);
      }
      return out.length ? json(out) : new Response(null, { status: 202, headers: CORS });
    }

    const res = await handleRpc(env, payload);
    if (!res) return new Response(null, { status: 202, headers: CORS });
    return json(res);
  },
};
