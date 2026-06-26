# OrigoID — Postman collection

Carpeta independiente de la colección Postman oficial de OrigoID. Vive aparte
(NO dentro de mintlify) para que sea fácil de mantener y no se pierda.

## Archivos
- `OrigoID.postman_collection.json` — colección generada (NO editar a mano).
- `gen-postman-collection.cjs` — generador. Lee `../documentaciones/openapi.json`.

## Regenerar
Tras cualquier cambio del OpenAPI:

```
node gen-postman-collection.cjs
```

## Qué produce
- 1 request por cada forma de invocación de los endpoints multi-opción
  (examples nombrados del openapi: PEPs, OFAC, etc.) + craft para los oneOf
  sin examples (voter-list, cfdi).
- URL base literal `https://api.origoid.com` en cada request.
- SIN API key embebida (el usuario agrega su `x-api-key` en Postman).
- Endpoints `x-hidden` (ej. checkLiveness) se excluyen.
- Campos binarios con placeholder uniforme `<base64 — ...>`.

## Publicación / descarga en docs
Pendiente decidir el host público del archivo para el link de descarga de
docs.origoid.com (repo propio público vs S3/CloudFront). Ver hilo.
