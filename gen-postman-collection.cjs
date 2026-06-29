/* Genera la colección Postman oficial de OrigoID desde el OpenAPI canónico.
 * Correr tras cualquier cambio de openapi.json (mantiene la colección en sync).
 *   node documentaciones/scripts/gen-postman-collection.cjs
 * Escribe: documentaciones/OrigoID.postman_collection.json (canónico)
 *        + mintlify-poc/OrigoID.postman_collection.json (publicable en docs)
 * Un request por cada `examples` nombrado (endpoints multi-opción) + craft para
 * los oneOf sin examples (voter-list, cfdi). Auth x-api-key a nivel colección.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const oa = require(path.join(ROOT, "documentaciones", "openapi.json"));

// Placeholders uniformes para campos binarios (en inglés, sin jerga "data URI").
const IMG_PH = "<base64 — JPG or PNG>";
const DOC_PH = "<base64 — PDF, JPG or PNG>";
const BIN = { face: IMG_PH, front: IMG_PH, back: IMG_PH, selfie: IMG_PH, documentImage: IMG_PH, image: IMG_PH, file: DOC_PH, document: DOC_PH };
// endpoints cuyo ejemplo del openapi viene incompleto → forzar estos campos.
const ENSURE = { "/mex/id/v1/voter-id-extractions": ["front", "back"] };

const CRAFTED = {
  "/mex/id/v1/voter-list-validations": [
    { name: "Option 1 — CIC + voter key", body: { cic: "123456789", citizenIdentifier: "987654321" } },
    { name: "Option 2 — CIC + OCR", body: { cic: "123456789", ocr: "0123456789012" } },
  ],
  "/mex/fiscal/v1/cfdi-validations": [
    { name: "Option 1 — by data (UUID + RFCs + total)", body: { uuid: "7C8BD4EA-AE86-4CB5-88B8-C6E61E988A8B", rfcIssuer: "PEZJ900514H2A", rfcReceiver: "EMP210908DT4", total: "18750.00" } },
    { name: "Option 2 — by document (base64, with SAT QR)", body: { document: "<base64 — XML, PDF, JPG or PNG (with SAT QR)>" },
      responses: [{ name: "DOCUMENT_NOT_TRUSTED — QR points to an unofficial host", body: { status: "OK", type: "DOCUMENT_NOT_TRUSTED", message: "Document QR points to an unofficial host", data: null, transactionId: "9a4c1e77-2b3d-4f8a-bc1e-6d5f0a2b3c4d", processedAt: "2026-06-26T16:34:30-06:00", billable: true } }] },
  ],
};

function curlBody(op) {
  const c = (op["x-codeSamples"] || []).find((s) => /curl/i.test(s.lang || s.label || ""));
  if (!c) return null;
  const m = c.source.match(/-d\s+'([\s\S]*?)'/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
function scrubBinary(body) {
  if (!body || typeof body !== "object") return body;
  for (const k of Object.keys(body)) if (k in BIN && typeof body[k] === "string") body[k] = BIN[k];
  return body;
}
function ensureFields(p, body) {
  if (ENSURE[p] && body && typeof body === "object") for (const f of ENSURE[p]) if (!(f in body)) body[f] = BIN[f];
  return body;
}
function requestsFor(p, op) {
  const json = op.requestBody?.content?.["application/json"] || {};
  if (json.examples && Object.keys(json.examples).length) {
    return Object.entries(json.examples).map(([k, ex]) => ({ name: ex.summary || k, body: ensureFields(p, scrubBinary(JSON.parse(JSON.stringify(ex.value ?? {})))) }));
  }
  if (CRAFTED[p]) return CRAFTED[p].map((o) => ({ name: o.name, body: o.body, responses: o.responses }));
  return [{ name: null, body: ensureFields(p, scrubBinary(curlBody(op) || json.example || {})) }];
}
function urlObj(p) { return { raw: "https://api.origoid.com" + p, protocol: "https", host: ["api", "origoid", "com"], path: p.replace(/^\//, "").split("/") }; }
function firstLine(op) { return (op.summary || op.description || "").replace(/\\n/g, "\n").split("\n")[0].replace(/\*\*/g, "").slice(0, 300); }

const folders = new Map();
for (const [p, methods] of Object.entries(oa.paths)) {
  for (const [m, op] of Object.entries(methods)) {
    if (!op.operationId || m.toLowerCase() !== "post" || op["x-hidden"]) continue;
    const tag = (op.tags || ["Otros"])[0];
    if (!folders.has(tag)) folders.set(tag, []);
    for (const r of requestsFor(p, op)) {
      const item = {
        name: r.name ? `${op.operationId} — ${r.name}` : op.operationId,
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: { mode: "raw", raw: JSON.stringify(r.body ?? {}, null, 2), options: { raw: { language: "json" } } },
          url: urlObj(p),
          description: firstLine(op),
        },
      };
      if (r.responses) item.response = r.responses.map((rp) => ({
        name: rp.name,
        originalRequest: item.request,
        status: "OK", code: 200,
        _postman_previewlanguage: "json",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: JSON.stringify(rp.body, null, 2),
      }));
      folders.get(tag).push(item);
    }
  }
}

const collection = {
  info: {
    _postman_id: "0r1g01d-0000-4a11-b0ss-c0ffee000001",
    name: "OrigoID API — Official collection",
    description: "Collection generated from OrigoID's canonical OpenAPI. The base URL is https://api.origoid.com (literal in every request, so you can see it and take it straight to your code). It does NOT include your API key: add it yourself in Postman as an `x-api-key: <your-api-key>` header (under each request's Headers tab, or once at the collection level via Authorization → type API Key → add to Header). Includes one request per invocation form for multi-option endpoints (PEPs, OFAC, voter list, CFDI, etc.).",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: [...folders.entries()].map(([tag, items]) => ({ name: tag, item: items })),
};

const json = JSON.stringify(collection, null, 2);
const out = path.join(ROOT, "postman", "OrigoID.postman_collection.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, json);
console.log("Escrito:", out);
const reqs = [...folders.values()].reduce((n, i) => n + i.length, 0);
console.log(`Folders: ${folders.size} | Requests: ${reqs}`);
