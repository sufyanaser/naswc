/* UI-only orchestration. Existing controls are moved, never cloned or replaced. */
(() => {
  'use strict';
  const svg = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>`;
  const makeButton = (className, label, icon) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tbtn ${className}`;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = svg(icon) + `<span class="ux-label">${label}</span>`;
    return button;
  };

  function enhanceTopbar() {
    const actions = document.querySelector('.tb-actions');
    const importButton = document.getElementById('btn-import');
    const exportButton = document.getElementById('btn-export');
    if (!actions || !importButton || !exportButton || actions.dataset.uxReady) return;
    actions.dataset.uxReady = '1';

    const nav = makeButton('ux-nav-toggle', 'الأقسام', '<path d="M4 6h16M4 12h16M4 18h16"/>');
    nav.setAttribute('aria-expanded', 'false');
    nav.onclick = () => {
      const open = document.body.classList.toggle('ux-nav-open');
      nav.setAttribute('aria-expanded', String(open));
    };

    const settings = makeButton('ux-settings', 'الإعدادات', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h.1a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v.1a1.7 1.7 0 001.5 1h.2a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>');
    settings.onclick = () => { if (typeof switchTo === 'function') switchTo('settings'); };

    const more = document.createElement('div');
    more.className = 'ux-more';
    const moreToggle = makeButton('ux-more-toggle', 'المزيد', '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>');
    moreToggle.setAttribute('aria-expanded', 'false');
    const menu = document.createElement('div');
    menu.className = 'ux-more-menu';
    menu.setAttribute('role', 'menu');
    menu.append(importButton, exportButton);
    more.append(moreToggle, menu);
    moreToggle.onclick = event => {
      event.stopPropagation();
      const open = more.classList.toggle('open');
      moreToggle.setAttribute('aria-expanded', String(open));
    };
    document.addEventListener('click', event => {
      if (!more.contains(event.target)) { more.classList.remove('open'); moreToggle.setAttribute('aria-expanded', 'false'); }
      if (document.body.classList.contains('ux-nav-open') && !event.target.closest('.side') && !event.target.closest('.ux-nav-toggle')) {
        document.body.classList.remove('ux-nav-open'); nav.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      more.classList.remove('open'); moreToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('ux-nav-open'); nav.setAttribute('aria-expanded', 'false');
    });
    actions.prepend(nav);
    const saveButton = document.getElementById('btn-save');
    actions.insertBefore(settings, saveButton);
    actions.insertBefore(more, settings);
  }

  function enhanceSidebar() {
    const side = document.getElementById('side');
    if (!side) return;
    side.querySelectorAll('.side-group').forEach(group => {
      if (group.dataset.uxReady) return;
      group.dataset.uxReady = '1';
      const label = group.querySelector(':scope > .side-group-label');
      const summary = document.createElement('summary');
      summary.innerHTML = `<span>${label ? label.textContent : 'مجموعة'}</span><span class="side-group-count">${group.querySelectorAll(':scope > a').length}</span>`;
      group.prepend(summary);
      group.setAttribute('open', '');
      const active = group.querySelector(':scope > a.active');
      if (active) group.open = true;
      group.querySelectorAll(':scope > a').forEach(link => link.addEventListener('click', () => {
        document.body.classList.remove('ux-nav-open');
        const nav = document.querySelector('.ux-nav-toggle');
        if (nav) nav.setAttribute('aria-expanded', 'false');
      }, { once: true }));
    });
  }

  function enhanceBlockTools() {
    const tools = document.getElementById('cms-tools');
    if (!tools || tools.dataset.uxReady) return;
    tools.dataset.uxReady = '1';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ux-blocks-toggle';
    toggle.textContent = '+';
    toggle.title = 'البلوكات المتقدمة';
    toggle.setAttribute('aria-label', 'إظهار البلوكات المتقدمة');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.onclick = () => {
      const open = tools.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'إخفاء البلوكات المتقدمة' : 'إظهار البلوكات المتقدمة');
    };
    tools.prepend(toggle);
  }

  function boot() {
    enhanceTopbar(); enhanceSidebar(); enhanceBlockTools();
    const root = document.getElementById('adminroot') || document.body;
    new MutationObserver(() => { enhanceSidebar(); enhanceBlockTools(); }).observe(root, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
