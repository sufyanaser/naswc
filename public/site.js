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
