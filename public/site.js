(() => {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const topbar = document.getElementById('topbar');

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

  const setBar = () => topbar?.classList.toggle('scrolled', window.scrollY > 24);
  setBar();
  window.addEventListener('scroll', setBar, { passive: true });

  const currencyButtons = document.querySelectorAll('[data-currency]');
  const priceCards = document.querySelectorAll('.price-card[data-iqd][data-usd]');
  currencyButtons.forEach((button) => button.addEventListener('click', () => {
    const currency = button.dataset.currency;
    currencyButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
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
      }, 150);
    });
  }));

  const capabilityRows = [...document.querySelectorAll('.capability-row')];
  const capabilityScene = document.querySelector('.capability-scene');
  const capabilityCode = document.getElementById('capabilityCode');
  const capabilityTitle = document.getElementById('capabilityTitle');
  const capabilityBody = document.getElementById('capabilityBody');
  const capabilityTags = document.getElementById('capabilityTags');
  const selectCapability = (row) => {
    if (!row || row.classList.contains('active')) return;
    capabilityRows.forEach((item) => {
      const active = item === row;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    const applyContent = () => {
      capabilityCode.textContent = row.dataset.code;
      capabilityTitle.textContent = row.dataset.title;
      capabilityBody.textContent = row.dataset.body;
      capabilityTags.replaceChildren(...row.dataset.tags.split('|').map((tag) => {
        const item = document.createElement('b');
        item.textContent = tag;
        return item;
      }));
    };
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to([capabilityCode, capabilityTitle, capabilityBody, capabilityTags], {
        y: 10, opacity: 0, duration: .16, ease: 'power2.in',
        onComplete: () => {
          applyContent();
          gsap.fromTo([capabilityCode, capabilityTitle, capabilityBody, capabilityTags], { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .35, stagger: .035, ease: 'power3.out' });
          gsap.fromTo('.scene-orbit', { rotation: -12, scale: .92 }, { rotation: 0, scale: 1, duration: .65, ease: 'power3.out' });
        }
      });
    } else applyContent();
    capabilityScene?.setAttribute('data-active', row.dataset.code);
  };
  capabilityRows.forEach((row) => {
    row.addEventListener('click', () => selectCapability(row));
    row.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') selectCapability(row);
    });
  });

  const dockLinks = [...document.querySelectorAll('.mobile-app-dock a[href^="#"]')];
  const dockSections = dockLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && dockSections.length) {
    const dockObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        dockLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-30% 0px -60%', threshold: 0 });
    dockSections.forEach((section) => dockObserver.observe(section));
  }

  const partnersSection = document.getElementById('partners');
  const partnersKicker = partnersSection?.querySelector('[data-partners-kicker]');
  const partnersTitle = partnersSection?.querySelector('[data-partners-title]');
  const partnersDescription = partnersSection?.querySelector('[data-partners-description]');
  const partnersList = partnersSection?.querySelector('[data-partners-list]');

  const partnerInitials = (name) => String(name || 'Partner')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase() || 'P';

  const safeUrl = (value, { sameOriginOnly = false } = {}) => {
    if (!value) return null;
    try {
      const url = new URL(String(value), window.location.origin);
      if (!['http:', 'https:'].includes(url.protocol)) return null;
      if (sameOriginOnly && url.origin !== window.location.origin) return null;
      return url.href;
    } catch {
      return null;
    }
  };

  const createPartnerCard = (partner) => {
    const href = safeUrl(partner.url);
    const card = document.createElement(href ? 'a' : 'article');
    card.className = 'partner-card';
    if (href) {
      card.href = href;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

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
      image.addEventListener('error', () => {
        image.remove();
        fallback.hidden = false;
      }, { once: true });
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
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      card.append(logo, body, arrow);
      card.setAttribute('aria-label', `${partner.name} — ${partner.role || 'Strategic Partner'}`);
    } else {
      card.append(logo, body);
    }
    return card;
  };

  const renderPartners = (content) => {
    if (!partnersSection || !partnersKicker || !partnersTitle || !partnersDescription || !partnersList) return;
    const faqSection = document.getElementById('faq');
    if (faqSection && partnersSection.nextElementSibling !== faqSection) {
      faqSection.before(partnersSection);
    }
    const partners = content?.partners;
    const items = Array.isArray(partners?.items)
      ? partners.items.filter((item) => item && String(item.name || '').trim())
      : [];
    const visible = partners?.enabled !== false && items.length > 0;
    partnersSection.hidden = !visible;
    if (!visible) {
      partnersList.replaceChildren();
      return;
    }

    partnersKicker.textContent = partners.kicker || 'Strategic Partners';
    partnersTitle.textContent = partners.title || 'Strategic Partners';
    partnersDescription.textContent = partners.sub || '';
    partnersDescription.hidden = !partnersDescription.textContent;
    partnersList.replaceChildren(...items.map(createPartnerCard));

    if (new URLSearchParams(window.location.search).get('preview') === 'partners') {
      window.requestAnimationFrame(() => partnersSection.scrollIntoView({ block: 'start' }));
    }
  };

  const loadPartners = async () => {
    try {
      const response = await fetch('/content.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      renderPartners(await response.json());
    } catch (error) {
      console.warn('Strategic Partners could not be loaded.', error);
      renderPartners(null);
    }
  };

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === 'nascw-preview-content' && event.data.content) {
      renderPartners(event.data.content);
    }
  });
  loadPartners();

  window.addEventListener('load', () => {
    if (!window.gsap || !window.ScrollTrigger || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    intro
      .from('.topbar .nav-wrap', { y: -34, opacity: 0, duration: .8 })
      .from('.hero .eyebrow', { y: 18, opacity: 0, duration: .55 }, '-=.35')
      .from('.hero h1 span', { y: 52, opacity: 0, duration: .9, stagger: .1 }, '-=.28')
      .from('.hero-lead', { y: 26, opacity: 0, duration: .7 }, '-=.52')
      .from('.hero-actions', { y: 18, opacity: 0, duration: .55 }, '-=.4')
      .from('.hero-meta', { y: 24, opacity: 0, duration: .65 }, '-=.35')
      .from('.hero-rotors', { scale: .84, opacity: 0, duration: 1.25 }, '-=1.05')
      .from('.hero-rays i', { scaleY: .18, opacity: 0, duration: 1.15, stagger: .045 }, '-=1.05');

    gsap.utils.toArray('.reveal').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.from(el, {
        y: 46,
        opacity: 0,
        duration: .95,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    gsap.to('.hero-rays', {
      yPercent: -18,
      scale: 1.06,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
    });

    gsap.to('.hero-rotors', {
      yPercent: -10,
      scale: 1.08,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.35 }
    });

    gsap.to('.hero-copy', {
      y: -48,
      opacity: .15,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '55% center', end: 'bottom top', scrub: 1 }
    });

    gsap.from('.capability-row', {
      y: 90,
      opacity: 0,
      duration: 1,
      stagger: .09,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.capability-index', start: 'top 86%', once: true }
    });

    gsap.from('.price-card', {
      y: 70,
      opacity: 0,
      duration: .9,
      stagger: .08,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.pricing-grid', start: 'top 88%', once: true }
    });

    gsap.from('.process-line article', {
      y: 55,
      opacity: 0,
      duration: .8,
      stagger: .09,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.process-line', start: 'top 88%', once: true }
    });

    gsap.from('.tech-cloud > span', {
      scale: .92,
      opacity: 0,
      duration: .55,
      stagger: .035,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.tech-cloud', start: 'top 88%', once: true }
    });
  });
})();
