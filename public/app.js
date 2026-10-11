/* NAS CodeWorks — public site behavior (v7)
   Single file. No animation library. Progressive enhancement only. */
(() => {
  'use strict';

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------- Sticky header shadow ---------- */
  const topbar = document.getElementById('topbar');
  const setBar = () => topbar?.classList.toggle('scrolled', window.scrollY > 12);
  setBar();
  window.addEventListener('scroll', setBar, { passive: true });

  /* ---------- Language toggle (AR default / EN optional) ---------- */
  const LANG_KEY = 'nascw_lang';
  const root = document.documentElement;
  const langButtons = document.querySelectorAll('[data-lang-set]');
  const STRINGS = {
    ar: { title: document.title, menuLabel: 'فتح القائمة', navLabel: 'التنقل الرئيسي' },
    en: {
      title: 'NAS CodeWorks — Software, AI & Automation Studio',
      menuLabel: 'Open menu',
      navLabel: 'Main navigation'
    }
  };

  const applyLang = (lang) => {
    const safe = lang === 'en' ? 'en' : 'ar';
    root.setAttribute('lang', safe);
    root.setAttribute('dir', safe === 'ar' ? 'rtl' : 'ltr');
    document.title = STRINGS[safe].title;
    menuBtn?.setAttribute('aria-label', STRINGS[safe].menuLabel);
    document.querySelector('.nav-links')?.setAttribute('aria-label', STRINGS[safe].navLabel);
    langButtons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.langSet === safe)));
    try { localStorage.setItem(LANG_KEY, safe); } catch { /* storage may be unavailable */ }
  };

  langButtons.forEach((btn) => btn.addEventListener('click', () => applyLang(btn.dataset.langSet)));

  let storedLang = null;
  try { storedLang = localStorage.getItem(LANG_KEY); } catch { /* ignore */ }
  if (storedLang === 'en' || storedLang === 'ar') applyLang(storedLang);

  /* ---------- Pricing currency toggle ---------- */
  const currencyButtons = document.querySelectorAll('[data-currency]');
  const priceCards = document.querySelectorAll('.price-card[data-iqd][data-usd]');
  currencyButtons.forEach((button) => button.addEventListener('click', () => {
    const currency = button.dataset.currency;
    currencyButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    priceCards.forEach((card) => {
      const price = card.querySelector('.price');
      const value = price?.querySelector('b');
      const unit = price?.querySelector('span');
      if (!price || !value || !unit) return;
      price.classList.add('is-changing');
      window.setTimeout(() => {
        value.textContent = currency === 'USD' ? card.dataset.usd : card.dataset.iqd;
        unit.textContent = currency === 'USD' ? '$' : 'د.ع';
        price.classList.remove('is-changing');
      }, 140);
    });
  }));

  /* ---------- Reveal-on-scroll ---------- */
  const revealEls = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Strategic Partners (data-driven, unchanged contract) ----------
     Source of truth: /content.json -> { partners: { enabled, kicker, title, sub, items[] } }
     Served by the Worker from R2/KV when the admin has published content,
     falling back to the static file in public/content.json otherwise. */
  /* Note: the section heading/subtitle stay static bilingual copy in the
     markup (see index.html) rather than being overwritten from content.json
     — the CMS's kicker/title/sub fields are free-text and English-only, so
     binding them here would silently break the AR/EN toggle. Only the real
     partner records (name/role/bio/url/photo) are data-driven. */
  const partnersSection = document.getElementById('partners');
  const partnersList = partnersSection?.querySelector('[data-partners-list]');

  const partnerInitials = (name) => String(name || 'Partner')
    .trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || 'P';

  const safeUrl = (value) => {
    if (!value) return null;
    try {
      const url = new URL(String(value), window.location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  };

  const createPartnerCard = (partner) => {
    const href = safeUrl(partner.url);
    const card = document.createElement(href ? 'a' : 'article');
    card.className = 'partner-card';
    if (href) { card.href = href; card.target = '_blank'; card.rel = 'noopener noreferrer'; }

    const logo = document.createElement('span');
    logo.className = 'partner-logo';
    logo.setAttribute('aria-hidden', 'true');
    const fallback = document.createElement('span');
    fallback.className = 'partner-initials';
    fallback.textContent = partnerInitials(partner.name);
    logo.append(fallback);

    const photo = safeUrl(partner.photo);
    if (photo) {
      const image = document.createElement('img');
      image.src = photo;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      fallback.hidden = true;
      image.addEventListener('error', () => { image.remove(); fallback.hidden = false; }, { once: true });
      logo.prepend(image);
    }

    const body = document.createElement('span');
    body.className = 'partner-copy';
    if (partner.role) {
      const role = document.createElement('small');
      role.textContent = partner.role;
      body.append(role);
    }
    const name = document.createElement('strong');
    name.textContent = partner.name;
    body.append(name);
    if (partner.bio) {
      const bio = document.createElement('span');
      bio.className = 'partner-bio';
      bio.textContent = partner.bio;
      body.append(bio);
    }

    if (href) {
      const arrow = document.createElement('span');
      arrow.className = 'partner-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 12.5 12.5 3.5M12.5 3.5H6M12.5 3.5V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      card.append(logo, body, arrow);
      card.setAttribute('aria-label', `${partner.name} — ${partner.role || 'Partner'}`);
    } else {
      card.append(logo, body);
    }
    return card;
  };

  const renderPartners = (content) => {
    if (!partnersSection || !partnersList) return;
    const partners = content?.partners;
    const items = Array.isArray(partners?.items)
      ? partners.items.filter((item) => item && String(item.name || '').trim())
      : [];
    const visible = partners?.enabled !== false && items.length > 0;
    partnersSection.hidden = !visible;
    if (!visible) { partnersList.replaceChildren(); return; }
    partnersList.replaceChildren(...items.map(createPartnerCard));
  };

  (async () => {
    try {
      const response = await fetch('/content.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`content.json ${response.status}`);
      renderPartners(await response.json());
    } catch (error) {
      console.warn('Strategic Partners could not be loaded.', error);
      renderPartners(null);
    }
  })();

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === 'nascw-preview-content' && event.data.content) {
      renderPartners(event.data.content);
    }
  });
})();
