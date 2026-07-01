export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/upload-image' && request.method === 'POST') {
      return handleUpload(request, env);
    }

    if (url.pathname.startsWith('/uploads/') && request.method === 'GET') {
      return handleUploadRead(url.pathname.slice('/uploads/'.length), env);
    }

    const response = await env.ASSETS.fetch(request);
    const type = response.headers.get('content-type') || '';

    if (!type.includes('text/html') || response.status !== 200) {
      return response;
    }

    return new HTMLRewriter()
      .on('head', {
        element(element) {
          element.append('\n<link rel="stylesheet" href="/team-orbit.css" data-nas-team-orbit="base">\n<link rel="stylesheet" href="/team-orbit-polish.css" data-nas-team-orbit="polish">\n<link rel="stylesheet" href="/premium-team-services.css" data-nas-premium-team-services="true">\n<link rel="stylesheet" href="/layout-rhythm-pass.css" data-nas-layout-rhythm="true">\n<link rel="stylesheet" href="/hero-workflow.css" data-nas-hero-workflow="style">\n<script src="/hero-workflow.js" defer data-nas-hero-workflow="script"></script>', { html: true });
        }
      })
      .transform(response);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function cleanPart(value, fallback) {
  const raw = String(value || fallback || 'general').trim().toLowerCase();
  return raw
    .replace(/[^\u0621-\u064Aa-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64) || fallback;
}

function extensionFromMime(type) {
  if (type === 'image/webp') return 'webp';
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  return null;
}

async function handleUpload(request, env) {
  if (!env.NASCW_UPLOADS) {
    return json({ ok: false, error: 'R2 binding NASCW_UPLOADS is missing.' }, 500);
  }

  if (!env.NASCW_ADMIN_UPLOAD_TOKEN) {
    return json({ ok: false, error: 'NASCW_ADMIN_UPLOAD_TOKEN secret is missing.' }, 500);
  }

  const receivedToken = request.headers.get('x-nascw-admin-token') || '';
  if (receivedToken !== env.NASCW_ADMIN_UPLOAD_TOKEN) {
    return json({ ok: false, error: 'Unauthorized upload request.' }, 401);
  }

  const form = await request.formData();
  const file = form.get('file');

  if (!file || typeof file === 'string') {
    return json({ ok: false, error: 'Missing image file.' }, 400);
  }

  const allowed = new Set(['image/webp', 'image/jpeg', 'image/png']);
  if (!allowed.has(file.type)) {
    return json({ ok: false, error: 'Unsupported image type. Use WebP, JPG, or PNG.' }, 400);
  }

  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    return json({ ok: false, error: 'Image is too large after compression. Max size is 2MB.' }, 413);
  }

  const section = cleanPart(form.get('section'), 'programs');
  const group = cleanPart(form.get('group'), 'gallery');
  const ext = extensionFromMime(file.type);
  const key = `${section}/${group}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await env.NASCW_UPLOADS.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable'
    },
    customMetadata: {
      originalName: file.name || '',
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

async function handleUploadRead(key, env) {
  if (!env.NASCW_UPLOADS) {
    return new Response('R2 binding missing', { status: 500 });
  }

  if (!key || key.includes('..') || key.startsWith('/') || key.includes('\\')) {
    return new Response('Bad upload path', { status: 400 });
  }

  const object = await env.NASCW_UPLOADS.get(key);

  if (!object) {
    return new Response('Not found', {
      status: 404,
      headers: { 'cache-control': 'no-store' }
    });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
}
