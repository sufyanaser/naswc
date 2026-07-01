(() => {
  "use strict";

  const STATE = {
    timer: null,
    installed: false
  };

  function canSave() {
    return typeof window.save === "function";
  }

  function scheduleSave(reason, delay = 180) {
    clearTimeout(STATE.timer);
    STATE.timer = setTimeout(() => {
      if (!canSave()) return;
      try {
        window.save(true);
        console.info("[NASCW Admin] Autosaved image change:", reason || "image-change");
      } catch (error) {
        console.warn("[NASCW Admin] Autosave failed:", error);
      }
    }, delay);
  }

  function wrapUploader() {
    const fn = window.fileToCompressedDataURL;
    if (typeof fn !== "function" || fn.__nascwAutosaveWrapped) return;

    async function wrappedFileToCompressedDataURL(...args) {
      const result = await fn.apply(this, args);
      scheduleSave("upload-complete", 0);
      return result;
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

      if (
        target.closest(".img-cell button") ||
        target.closest(".url-row button") ||
        target.closest(".mini.del")
      ) {
        scheduleSave("image-ui-click", 250);
      }
    }, true);

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type === "file" && target.accept && target.accept.includes("image")) {
        scheduleSave("image-file-input", 2500);
      }
    }, true);
  }

  function boot() {
    wrapUploader();
    installUiListeners();
    console.info("[NASCW Admin] Image autosave helper active.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
