(() => {
  "use strict";

  const css = `
    .nav{min-height:82px}
    .nav-in{height:82px;gap:22px;justify-content:flex-start}
    .brand{order:3;margin-inline-start:auto;min-width:max-content;transform-origin:left center}
    .brand svg{width:56px!important;height:56px!important}
    .brand .logo-img{height:56px!important;max-width:310px!important;width:auto!important}
    .brand span,.brand b{font-size:22px;letter-spacing:-.35px}
    .nav-cta{order:1;min-width:max-content}
    .nas-head-links{order:2;display:flex;align-items:center;gap:8px;margin-inline:auto;background:rgba(15,26,46,.46);border:1px solid rgba(30,51,84,.7);border-radius:16px;padding:7px;backdrop-filter:blur(12px)}
    .nas-head-links a{display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:8px 14px;border-radius:11px;color:var(--fg-2);font-size:13.5px;font-weight:700;white-space:nowrap;transition:.2s}
    .nas-head-links a:hover{background:rgba(0,212,255,.12);color:var(--cyan);box-shadow:inset 0 0 0 1px rgba(0,212,255,.18)}
    .nas-head-links a.primary{background:rgba(0,212,255,.16);color:var(--cyan);box-shadow:inset 0 0 0 1px rgba(0,212,255,.28)}
    @media(max-width:980px){.nav{min-height:70px}.nav-in{height:70px}.nas-head-links{display:none}.brand svg{width:44px!important;height:44px!important}.brand .logo-img{height:44px!important;max-width:220px!important}.brand span,.brand b{font-size:18px}}
    @media(max-width:520px){.brand .logo-img{height:38px!important;max-width:170px!important}.brand svg{width:38px!important;height:38px!important}.nav-in{gap:10px}.nav-cta{font-size:13px}}
  `;

  function injectStyle() {
    if (document.getElementById("nas-header-nav-polish-style")) return;
    const style = document.createElement("style");
    style.id = "nas-header-nav-polish-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function apply() {
    injectStyle();
    const nav = document.querySelector(".nav-in");
    if (!nav || document.getElementById("nas-head-links")) return;
    const links = document.createElement("div");
    links.id = "nas-head-links";
    links.className = "nas-head-links";
    links.innerHTML = `
      <a href="#services" class="primary">الخدمات</a>
      <a href="#proof">الأعمال</a>
      <a href="#process">طريقة العمل</a>
      <a href="#why">لماذا نحن</a>
      <a href="#start">ابدأ الآن</a>`;
    const cta = document.getElementById("nav-wa");
    if (cta) nav.insertBefore(links, cta);
    else nav.appendChild(links);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
})();
