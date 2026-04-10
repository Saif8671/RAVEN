import http from "http";
import { URL } from "url";
import { loadBackendEnv } from "./env.js";
import { buildBaseReport } from "./scanEngine.js";
import { enrichWithSupervity } from "./supervityClient.js";

loadBackendEnv();

const PORT = Number(process.env.PORT || 8787);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Request body must be valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function validatePayload(body) {
  const required = ["business_name", "website_url", "email_domain", "owner_email"];
  return required.filter((key) => !String(body?.[key] || "").trim());
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "raven-api",
      supervity_configured: Boolean(process.env.SUPERVITY_AUTHORIZATION || process.env.SUPERVITY_API_KEY),
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/scan") {
    try {
      const body = await readBody(req);
      const missing = validatePayload(body);

      if (missing.length > 0) {
        sendJson(res, 400, {
          ok: false,
          error: `Missing required fields: ${missing.join(", ")}`,
        });
        return;
      }

      const baseReport = buildBaseReport(body);
      const { report, source, error } = await enrichWithSupervity(baseReport);

      sendJson(res, 200, {
        ok: true,
        source,
        fallback_reason: source === "local" ? error || null : null,
        report,
      });
      return;
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected server error",
      });
      return;
    }
  }

  sendJson(res, 404, {
    ok: false,
    error: "Not found",
  });
});

server.listen(PORT, () => {
  console.log(`RAVEN backend listening on http://127.0.0.1:${PORT}`);
});
