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
