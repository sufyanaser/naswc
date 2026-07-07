(() => {
  "use strict";

  const STORE_KEY = "nascw_content_v1";
  const STATE = { content: null, i: 0, imgs: [], title: "", tag: "", touchX: 0, touchY: 0 };

  const esc = value => String(value == null ? "" : value).replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));

  const css = `
    .nas-premium-lightbox{position:fixed;inset:0;z-index:2200;display:none;opacity:0;transition:opacity .24s ease;background:radial-gradient(900px 620px at 50% 12%,rgba(0,212,255,.11),transparent 62%),radial-gradient(800px 540px at 8% 92%,rgba(124,58,237,.12),transparent 60%),rgba(3,7,14,.92);backdrop-filter:blur(22px)}
    .nas-premium-lightbox.open{display:block}.nas-premium-lightbox.show{opacity:1}
    .nas-lb-grid{height:100%;display:grid;grid-template-rows:auto 1fr auto;gap:12px;padding:18px clamp(14px,2vw,26px) 18px}
    .nas-lb-top{display:flex;align-items:center;justify-content:space-between;gap:16px;direction:rtl}
    .nas-lb-title{min-width:0}.nas-lb-title b{display:block;font-size:17px;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nas-lb-title span{display:block;margin-top:3px;font-size:12px;font-weight:700;letter-spacing:.8px;color:var(--cyan)}
    .nas-lb-actions{display:flex;align-items:center;gap:10px;flex:none}.nas-lb-count{font-size:12.5px;color:var(--fg-2);border:1px solid var(--line);background:rgba(15,26,46,.76);border-radius:999px;padding:7px 13px;font-weight:700;font-variant-numeric:tabular-nums}.nas-lb-close{width:42px;height:42px;border:1px solid var(--line);border-radius:13px;background:rgba(15,26,46,.76);color:var(--fg);cursor:pointer;display:grid;place-items:center;transition:.2s}.nas-lb-close:hover{background:var(--red);border-color:var(--red);transform:rotate(90deg)}
    .nas-lb-main{position:relative;min-height:0;border:1px solid rgba(30,51,84,.72);border-radius:24px;overflow:hidden;background:linear-gradient(145deg,rgba(15,26,46,.72),rgba(8,12,20,.92));box-shadow:0 35px 90px -40px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.04)}
    .nas-lb-main::before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(30,51,84,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(30,51,84,.35) 1px,transparent 1px);background-size:42px 42px;opacity:.22;mask-image:radial-gradient(circle at 50% 50%,#000 0%,transparent 78%)}
    .nas-lb-track{position:relative;z-index:1;height:100%;display:flex;align-items:center;transition:transform .52s cubic-bezier(.22,.61,.36,1);will-change:transform}.nas-lb-slide{flex:0 0 100%;height:100%;display:grid;place-items:center;padding:clamp(10px,2.3vw,28px)}.nas-lb-slide img{max-width:100%;max-height:100%;object-fit:contain;border-radius:16px;box-shadow:0 34px 90px -34px rgba(0,0,0,.95);background:#06101d;user-select:none;-webkit-user-drag:none}.nas-lb-slide img.zoomed{transform:scale(1.8);cursor:zoom-out}.nas-lb-slide img:not(.zoomed){cursor:zoom-in}
    .nas-lb-nav{position:absolute;z-index:3;top:50%;transform:translateY(-50%);width:52px;height:52px;border-radius:16px;border:1px solid var(--line);background:rgba(15,26,46,.76);color:var(--fg);cursor:pointer;display:grid;place-items:center;transition:.2s;backdrop-filter:blur(10px)}.nas-lb-nav:hover{background:var(--cyan);border-color:var(--cyan);color:#041019}.nas-lb-nav.disabled{opacity:.24;pointer-events:none}.nas-lb-prev{right:18px}.nas-lb-next{left:18px}
    .nas-lb-bottom{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;direction:rtl}.nas-lb-thumbs{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:none}.nas-lb-thumbs::-webkit-scrollbar{display:none}.nas-lb-thumb{flex:none;width:84px;height:54px;border-radius:12px;overflow:hidden;border:2px solid transparent;background:var(--panel);opacity:.54;cursor:pointer;transition:.2s}.nas-lb-thumb img{width:100%;height:100%;object-fit:cover}.nas-lb-thumb.active{opacity:1;border-color:var(--cyan);transform:translateY(-2px);box-shadow:0 10px 24px -16px var(--cyan)}.nas-lb-progress{display:flex;gap:6px;align-items:center}.nas-lb-progress i{display:block;width:8px;height:8px;border-radius:999px;background:var(--line);transition:.25s}.nas-lb-progress i.active{width:30px;background:var(--cyan)}
    @media(max-width:760px){.nas-lb-grid{padding:10px;gap:8px}.nas-lb-main{border-radius:18px}.nas-lb-prev{right:8px}.nas-lb-next{left:8px}.nas-lb-nav{width:42px;height:42px}.nas-lb-bottom{grid-template-columns:1fr}.nas-lb-thumbs{display:none}.nas-lb-progress{justify-content:center}.nas-lb-slide{padding:8px}.nas-lb-title b{font-size:14px}}
    @media(prefers-reduced-motion:reduce){.nas-premium-lightbox,.nas-lb-track,.nas-lb-thumb,.nas-lb-nav,.nas-lb-close{transition:none!important}}
  `;

  function inject() {
    if (document.getElementById("nas-slideshow-polish-style")) return;
    const style = document.createElement("style");
    style.id = "nas-slideshow-polish-style";
    style.textContent = css;
    document.head.appendChild(style);
    const el = document.createElement("div");
    el.id = "nas-premium-lightbox";
    el.className = "nas-premium-lightbox";
    el.innerHTML = `
      <div class="nas-lb-grid" role="dialog" aria-modal="true">
        <div class="nas-lb-top">
          <div class="nas-lb-title"><b></b><span></span></div>
          <div class="nas-lb-actions"><span class="nas-lb-count"></span><button class="nas-lb-close" aria-label="إغلاق">✕</button></div>
        </div>
        <div class="nas-lb-main">
          <button class="nas-lb-nav nas-lb-prev" aria-label="السابق">›</button>
          <div class="nas-lb-track"></div>
          <button class="nas-lb-nav nas-lb-next" aria-label="التالي">‹</button>
        </div>
        <div class="nas-lb-bottom"><div class="nas-lb-thumbs"></div><div class="nas-lb-progress"></div></div>
      </div>`;
    document.body.appendChild(el);
    el.querySelector(".nas-lb-close").addEventListener("click", close);
    el.querySelector(".nas-lb-prev").addEventListener("click", () => go(STATE.i - 1));
    el.querySelector(".nas-lb-next").addEventListener("click", () => go(STATE.i + 1));
    el.addEventListener("click", e => { if (e.target === el) close(); });
    const main = el.querySelector(".nas-lb-main");
    main.addEventListener("touchstart", e => { STATE.touchX = e.touches[0].clientX; STATE.touchY = e.touches[0].clientY; }, { passive: true });
    main.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - STATE.touchX;
      const dy = e.changedTouches[0].clientY - STATE.touchY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? STATE.i + 1 : STATE.i - 1);
    }, { passive: true });
    document.addEventListener("keydown", e => {
      if (!el.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(STATE.i + 1);
      if (e.key === "ArrowRight") go(STATE.i - 1);
    });
  }

  async function getContent() {
    if (STATE.content) return STATE.content;
    try {
      const r = await fetch("/content.json", { cache: "no-store" });
      if (r.ok) return (STATE.content = await r.json());
    } catch (_) {}
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return (STATE.content = JSON.parse(raw));
    } catch (_) {}
    return (STATE.content = window.__DEFAULT_CONTENT__ || {});
  }

  function preload(i) {
    [i - 1, i + 1].forEach(n => {
      if (STATE.imgs[n]) {
        const im = new Image();
        im.src = STATE.imgs[n];
      }
    });
  }

  function render() {
    const root = document.getElementById("nas-premium-lightbox");
    const track = root.querySelector(".nas-lb-track");
    root.querySelector(".nas-lb-title b").textContent = STATE.title || "معرض الصور";
    root.querySelector(".nas-lb-title span").textContent = STATE.tag || "NAS CodeWorks";
    track.innerHTML = STATE.imgs.map(src => `<div class="nas-lb-slide"><img src="${esc(src)}" alt="" draggable="false"></div>`).join("");
    track.querySelectorAll("img").forEach(img => img.addEventListener("click", e => { e.stopPropagation(); img.classList.toggle("zoomed"); }));
    root.querySelector(".nas-lb-thumbs").innerHTML = STATE.imgs.map((src, i) => `<button class="nas-lb-thumb" data-i="${i}"><img src="${esc(src)}" alt=""></button>`).join("");
    root.querySelectorAll(".nas-lb-thumb").forEach(btn => btn.addEventListener("click", () => go(+btn.dataset.i)));
    root.querySelector(".nas-lb-progress").innerHTML = STATE.imgs.map((_, i) => `<i data-i="${i}"></i>`).join("");
    root.querySelectorAll(".nas-lb-progress i").forEach(dot => dot.addEventListener("click", () => go(+dot.dataset.i)));
    update();
  }

  function open(project, start) {
    inject();
    STATE.imgs = (project.images || []).filter(Boolean);
    if (!STATE.imgs.length) return;
    STATE.i = Math.max(0, Math.min(start || 0, STATE.imgs.length - 1));
    STATE.title = project.title || "معرض الصور";
    STATE.tag = project.tag || "";
    render();
    const root = document.getElementById("nas-premium-lightbox");
    root.classList.add("open");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => root.classList.add("show"));
  }

  function go(n) {
    if (n < 0 || n >= STATE.imgs.length) return;
    STATE.i = n;
    document.querySelectorAll(".nas-lb-slide img.zoomed").forEach(img => img.classList.remove("zoomed"));
    update();
  }

  function update() {
    const root = document.getElementById("nas-premium-lightbox");
    if (!root) return;
    root.querySelector(".nas-lb-track").style.transform = `translateX(${STATE.i * 100}%)`;
    root.querySelector(".nas-lb-count").textContent = `${STATE.i + 1} / ${STATE.imgs.length}`;
    root.querySelector(".nas-lb-prev").classList.toggle("disabled", STATE.i === 0);
    root.querySelector(".nas-lb-next").classList.toggle("disabled", STATE.i === STATE.imgs.length - 1);
    root.querySelectorAll(".nas-lb-thumb").forEach((el, i) => el.classList.toggle("active", i === STATE.i));
    root.querySelectorAll(".nas-lb-progress i").forEach((el, i) => el.classList.toggle("active", i === STATE.i));
    const active = root.querySelector(".nas-lb-thumb.active");
    if (active) active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    preload(STATE.i);
  }

  function close() {
    const root = document.getElementById("nas-premium-lightbox");
    if (!root) return;
    root.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(() => root.classList.remove("open"), 240);
  }

  document.addEventListener("click", async event => {
    const shot = event.target.closest && event.target.closest(".proof-shot.has-img");
    if (!shot) return;
    const idx = Number(shot.dataset.proj);
    const c = await getContent();
    const project = c && c.proof && Array.isArray(c.proof.items) ? c.proof.items[idx] : null;
    if (!project || !project.images || !project.images.length) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    open(project, 0);
  }, true);
})();
