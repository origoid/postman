# OrigoID — Postman collection

Official Postman collection for the OrigoID API — identity verification for Mexico: CURP (RENAPO), INE voter list and OCR, RFC / CSF / CFDI (SAT), NSS (IMSS), ISSSTE, OFAC / PEPs / SAT 69-B screening, proof of address, email validation and face match. 22 endpoints, 35 requests (one per input form), generated from the OpenAPI specification.

**Import:** in Postman → *Import* → paste `https://raw.githubusercontent.com/origoid/postman/main/OrigoID.postman_collection.json`. Add your API key as the `x-api-key` header (collection → Authorization → API Key). Guide: https://docs.origoid.com/es/sdks/postman (English: https://docs.origoid.com/en/sdks/postman).

**En español** — Colección oficial de Postman de la API de OrigoID (verificación de identidad en México: CURP, INE, RFC/SAT, IMSS, OFAC/PEPs, comparación facial). Importa la URL anterior en Postman y agrega tu API key en el header `x-api-key`.

- Documentation: https://docs.origoid.com · Status: https://status.origoid.com · Support: support@origoid.com
- `OrigoID.postman_collection.json` is generated — do not edit by hand; regenerate with `node gen-postman-collection.cjs` from the canonical OpenAPI.
