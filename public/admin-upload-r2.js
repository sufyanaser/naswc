(() => {
  "use strict";

  const STORE_KEY = "nascw_content_v1";
  const TOKEN_KEY = "nascwAdminUploadToken";
  const STATE = { timer: null, installed: false, saveWrapped: false };

  function show(msg, error) {
    const toast = document.querySelector('#toast');
    const text = document.querySelector('#toast-msg');
    if (toast && text) {
      text.textContent = msg;
      toast.style.borderColor = error ? 'var(--red)' : 'var(--green)';
      const svg = toast.querySelector('svg');
      if (svg) svg.style.color = error ? 'var(--red)' : 'var(--green)';
      toast.classList.add('show');
      clearTimeout(show.t);
      show.t = setTimeout(() => toast.classList.remove('show'), 3200);
    }
  }

  function token() {
    let value = localStorage.getItem(TOKEN_KEY) || '';
    if (!value) {
      value = (prompt('أدخل رمز رفع الصور والنشر:') || '').trim();
      if (value) localStorage.setItem(TOKEN_KEY, value);
    }
    return value;
  }

  async function publishContent(silent) {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const t = token();
    if (!t) throw new Error('رمز النشر مفقود.');
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8', 'x-nascw-admin-token': t },
      body: raw
    });
    if (response.status === 401) localStorage.removeItem(TOKEN_KEY);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || ('فشل النشر: ' + response.status));
    if (!silent) show('تم الحفظ والنشر ✓');
  }

  function canSave() { return typeof window.save === "function"; }

  function wrapSave() {
    if (STATE.saveWrapped || !canSave()) return;
    const original = window.save;
    window.save = function wrappedSave(silent) {
      const ok = original.apply(this, arguments);
      if (ok) publishContent(silent).catch(error => show(error.message, true));
      return ok;
    };
    STATE.saveWrapped = true;
  }

  function scheduleSave(reason, delay = 180) {
    clearTimeout(STATE.timer);
    STATE.timer = setTimeout(() => {
      wrapSave();
      if (!canSave()) return;
      try { window.save(true); }
      catch (error) { show('فشل الحفظ المحلي: ' + error.message, true); }
    }, delay);
  }

  function wrapUploader() {
    const fn = window.fileToCompressedDataURL;
    if (typeof fn !== "function" || fn.__nascwAutosaveWrapped) return;
    async function wrappedFileToCompressedDataURL(...args) {
      try {
        const result = await fn.apply(this, args);
        if (!String(result || '').startsWith('/uploads/')) show('تحذير: الصورة لم ترجع كرابط /uploads', true);
        scheduleSave("upload-complete", 0);
        return result;
      } catch (error) {
        show(error.message || 'فشل رفع الصورة', true);
        throw error;
      }
    }
    wrappedFileToCompressedDataURL.__nascwAutosaveWrapped = true;
    window.fileToCompressedDataURL = wrappedFileToCompressedDataURL;
  }

  function installUiListeners() {
    if (STATE.installed) return;
    STATE.installed = true;
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".img-cell button") || target.closest(".url-row button") || target.closest(".mini.del")) scheduleSave("image-ui-click", 250);
    }, true);
  }

  function loadPartnersEditor() {
    if (window.__nascwPartnersEditorRequested) return;
    window.__nascwPartnersEditorRequested = true;
    import('/admin-partners-force.js?v=r2pf2').catch(error => console.error(error));
  }

  function boot() {
    wrapSave();
    wrapUploader();
    installUiListeners();
    loadPartnersEditor();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  let tries = 0;
  const timer = setInterval(() => {
    wrapSave();
    wrapUploader();
    loadPartnersEditor();
    tries += 1;
    if (tries > 20 || (STATE.saveWrapped && window.fileToCompressedDataURL && window.fileToCompressedDataURL.__nascwAutosaveWrapped)) clearInterval(timer);
  }, 250);
})();
