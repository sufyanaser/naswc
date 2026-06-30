function safeKey(parts) {
  const key = Array.isArray(parts) ? parts.join("/") : String(parts || "");
  if (!key || key.includes("..") || key.startsWith("/") || key.includes("\\")) {
    return null;
  }
  return key;
}

export async function onRequestGet(context) {
  const { env, params } = context;

  if (!env.NASCW_UPLOADS) {
    return new Response("R2 binding missing", { status: 500 });
  }

  const key = safeKey(params.path);
  if (!key) {
    return new Response("Bad upload path", { status: 400 });
  }

  const object = await env.NASCW_UPLOADS.get(key);

  if (!object) {
    return new Response("Not found", {
      status: 404,
      headers: { "cache-control": "no-store" }
    });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
