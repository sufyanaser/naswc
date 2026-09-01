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

    gsap.from('.hero-copy > *', {
      y: 28,
      opacity: 0,
      duration: .9,
      stagger: .08,
      ease: 'power3.out'
    });

    gsap.from('.hero-console', {
      x: -40,
      opacity: 0,
      duration: 1,
      delay: .18,
      ease: 'power3.out'
    });

    gsap.utils.toArray('.reveal').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.from(el, {
        y: 34,
        opacity: 0,
        duration: .85,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    gsap.to('.hero-console', {
      y: -26,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 }
    });
  });
})();
