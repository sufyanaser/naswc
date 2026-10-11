(() => {
  const root = document.documentElement;
  const languageButtons = [...document.querySelectorAll('[data-lang-set]')];
  const menuButton = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  function applyLang(lang) {
    const active = lang === 'en' ? 'en' : 'ar';
    root.lang = active;
    root.dir = active === 'ar' ? 'rtl' : 'ltr';
    languageButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.langSet === active)));
    menuButton?.setAttribute('aria-label', active === 'ar' ? 'فتح القائمة' : 'Open menu');
    document.title = active === 'ar' ? 'NAS CodeWorks — هندسة برمجيات وذكاء اصطناعي' : 'NAS CodeWorks — Software Engineering & AI';
    try { localStorage.setItem('nascw-language', active); } catch {}
  }

  languageButtons.forEach((button) => button.addEventListener('click', () => applyLang(button.dataset.langSet)));
  let savedLanguage = 'ar';
  try { savedLanguage = localStorage.getItem('nascw-language') || 'ar'; } catch {}
  applyLang(savedLanguage);

  function closeMenu() {
    mobileMenu?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 1000) closeMenu(); });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = [...document.querySelectorAll('.reveal')];
  if (reducedMotion || !('IntersectionObserver' in window)) reveals.forEach((item) => item.classList.add('is-visible'));
  else {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    reveals.forEach((item) => observer.observe(item));
  }
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
