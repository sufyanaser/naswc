function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanPart(value, fallback) {
  const raw = String(value || fallback || "general").trim().toLowerCase();
  return raw
    .replace(/[^\u0621-\u064Aa-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || fallback;
}

function extensionFromMime(type) {
  if (type === "image/webp") return "webp";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  return null;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.NASCW_UPLOADS) {
    return json({ ok: false, error: "R2 binding NASCW_UPLOADS is missing." }, 500);
  }

  const expectedToken = env.NASCW_ADMIN_UPLOAD_TOKEN;
  if (!expectedToken) {
    return json({ ok: false, error: "NASCW_ADMIN_UPLOAD_TOKEN secret is missing." }, 500);
  }

  const receivedToken = request.headers.get("x-nascw-admin-token") || "";
  if (receivedToken !== expectedToken) {
    return json({ ok: false, error: "Unauthorized upload request." }, 401);
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!file || typeof file === "string") {
    return json({ ok: false, error: "Missing image file." }, 400);
  }

  const allowed = new Set(["image/webp", "image/jpeg", "image/png"]);
  if (!allowed.has(file.type)) {
    return json({ ok: false, error: "Unsupported image type. Use WebP, JPG, or PNG." }, 400);
  }

  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    return json({ ok: false, error: "Image is too large after compression. Max size is 2MB." }, 413);
  }

  const section = cleanPart(form.get("section"), "programs");
  const group = cleanPart(form.get("group"), "gallery");
  const ext = extensionFromMime(file.type);

  const id = crypto.randomUUID();
  const key = `${section}/${group}/${Date.now()}-${id}.${ext}`;

  await env.NASCW_UPLOADS.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable"
    },
    customMetadata: {
      originalName: file.name || "",
      uploadedAt: new Date().toISOString()
    }
  });

  return json({
    ok: true,
    key,
    url: `/uploads/${key}`,
    size: file.size,
    type: file.type
  });
}

export async function onRequest(context) {
  return json({ ok: false, error: "Method not allowed." }, 405);
}
