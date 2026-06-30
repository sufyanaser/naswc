(() => {
  "use strict";

  const CONFIG = {
    endpoint: "/api/upload-image",
    tokenKey: "nascwAdminUploadToken",
    defaultSection: "admin",
    defaultGroup: "images",
    defaultMaxSide: 1600,
    defaultQuality: 0.82
  };

  function isImage(file) {
    return file && typeof file.type === "string" && file.type.startsWith("image/");
  }

  function safeName(name) {
    return String(name || "image")
      .replace(/\.[^.]+$/, "")
      .replace(/[^\u0621-\u064Aa-z0-9-_]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "image";
  }

  function getToken() {
    let token = localStorage.getItem(CONFIG.tokenKey);
    if (!token) {
      token = prompt("أدخل رمز رفع الصور للوحة التحكم:");
      if (token) localStorage.setItem(CONFIG.tokenKey, token.trim());
    }
    return token || "";
  }

  function showUploadError(error) {
    const message = error && error.message ? error.message : String(error || "Upload failed");
    console.error("[NASCW Upload]", error);
    alert("فشل رفع الصورة:\n" + message);
  }

  async function bitmapFromFile(file) {
    if (window.createImageBitmap) return await createImageBitmap(file);

    return await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("تعذر قراءة الصورة."));
      };
      img.src = url;
    });
  }

  async function compressToWebP(file, maxSide, quality) {
    if (!isImage(file)) throw new Error("الملف ليس صورة.");
    if (file.type === "image/gif" || file.type === "image/svg+xml") {
      throw new Error("هذا النوع غير مدعوم للرفع السحابي المباشر. استخدم JPG أو PNG أو WebP.");
    }

    const bitmap = await bitmapFromFile(file);
    const sourceW = bitmap.width || bitmap.naturalWidth;
    const sourceH = bitmap.height || bitmap.naturalHeight;
    const scale = Math.min(1, maxSide / Math.max(sourceW, sourceH));
    const width = Math.max(1, Math.round(sourceW * scale));
    const height = Math.max(1, Math.round(sourceH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob) throw new Error("تعذر ضغط الصورة قبل الرفع.");

    return new File([blob], `${safeName(file.name)}.webp`, {
      type: "image/webp",
      lastModified: Date.now()
    });
  }

  async function uploadImage(file, options = {}) {
    const token = getToken();
    if (!token) throw new Error("لم يتم إدخال رمز الرفع.");

    const maxSide = Number(options.maxSide || CONFIG.defaultMaxSide);
    const quality = Number(options.quality || CONFIG.defaultQuality);
    const compressed = await compressToWebP(file, maxSide, quality);

    const form = new FormData();
    form.append("file", compressed);
    form.append("section", options.section || CONFIG.defaultSection);
    form.append("group", options.group || CONFIG.defaultGroup);

    const res = await fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "x-nascw-admin-token": token },
      body: form
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.ok) {
      if (res.status === 401) localStorage.removeItem(CONFIG.tokenKey);
      throw new Error((data && data.error) || `Upload failed with status ${res.status}`);
    }

    return data.url;
  }

  async function cloudImageValue(file, maxSide = CONFIG.defaultMaxSide, quality = CONFIG.defaultQuality) {
    try {
      return await uploadImage(file, { maxSide, quality });
    } catch (error) {
      showUploadError(error);
      throw error;
    }
  }

  window.NASCWUpload = {
    uploadImage,
    clearToken() { localStorage.removeItem(CONFIG.tokenKey); },
    config: CONFIG
  };

  window.fileToCompressedDataURL = cloudImageValue;

  console.info("[NASCW Upload] Cloud image upload override active. Raster images are stored as R2 URLs, not Base64.");
})();
