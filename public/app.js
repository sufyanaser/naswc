(() => {
  const root = document.documentElement;
  const languageButtons = [...document.querySelectorAll('[data-lang-set]')];
  const menuButton = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const themeButton = document.getElementById('themeToggle');
  const topbar = document.getElementById('topbar');

  // ---------------------------------------------------------------------------
  // Core UI: Theme, Language, Mobile Navigation & Asset Readiness
  // ---------------------------------------------------------------------------
  function applyTheme(theme) {
    const active = theme === 'dark' ? 'dark' : 'light';
    root.dataset.theme = active;
    themeButton?.setAttribute('aria-pressed', String(active === 'dark'));
    themeButton?.setAttribute('aria-label', active === 'dark'
      ? (root.lang === 'ar' ? 'تفعيل الوضع النهاري' : 'Switch to light mode')
      : (root.lang === 'ar' ? 'تفعيل الوضع الليلي' : 'Switch to dark mode'));
    try { localStorage.setItem('nascw-theme', active); } catch {}
  }

  let savedTheme;
  try { savedTheme = localStorage.getItem('nascw-theme'); } catch {}
  applyTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeButton?.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  function applyLang(lang) {
    const active = lang === 'en' ? 'en' : 'ar';
    root.lang = active;
    root.dir = active === 'ar' ? 'rtl' : 'ltr';
    languageButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.langSet === active)));
    menuButton?.setAttribute('aria-label', active === 'ar' ? 'فتح القائمة' : 'Open menu');
    applyTheme(root.dataset.theme);
    document.title = active === 'ar' ? 'NAS CodeWorks — هندسة برمجيات وذكاء اصطناعي' : 'NAS CodeWorks — Software Engineering & AI';
    try { localStorage.setItem('nascw-language', active); } catch {}
    if (window.ScrollTrigger) {
      window.requestAnimationFrame(() => window.ScrollTrigger.refresh());
    }
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
  window.addEventListener('resize', () => { if (window.innerWidth > 1000) closeMenu(); }, { passive: true });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Preload/decode lazy mascot in idle time so #contact mascot is ready before scroll
  const preloadMascots = () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      img.loading = 'eager';
      if (typeof img.decode === 'function') img.decode().catch(() => {});
    });
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(preloadMascots, { timeout: 1200 });
  else window.setTimeout(preloadMascots, 350);

  // ---------------------------------------------------------------------------
  // MOTION OWNERSHIP CONTRACT (Shared Motion Utilities — Agent 2 & Agent 3)
  // ---------------------------------------------------------------------------
  const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasGsap = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  if (hasScrollTrigger && !window.__NASCW_ST_REGISTERED__) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.__NASCW_ST_REGISTERED__ = true;
  }

  const motionContract = {
    owners: Object.freeze({
      AGENT_2: ['section-reveals', 'scroll-trigger', 'card-transitions', 'nav-micro-interactions', 'cta-animations', 'shared-motion-utilities'],
      AGENT_3: ['mascot-intro', 'intro-timeline', 'skip-intro', 'intro-to-hero-transition', 'mascot-entrance', 'reduced-motion-intro-fallback']
    }),
    timelines: new Set(),
    triggers: new Set(),
    introListeners: new Set(),
    introCompleted: false,
    introDetail: null,
    isReducedMotion() {
      return motionMedia.matches;
    },
    registerTimeline(tl) {
      if (tl) this.timelines.add(tl);
      return tl;
    },
    registerTrigger(st) {
      if (st) this.triggers.add(st);
      return st;
    },
    onIntroComplete(fn) {
      if (typeof fn !== 'function') return () => {};
      if (this.introCompleted) {
        fn(this.introDetail);
        return () => {};
      }
      this.introListeners.add(fn);
      return () => this.introListeners.delete(fn);
    },
    emitIntroComplete(detail) {
      if (this.introCompleted) return;
      this.introCompleted = true;
      this.introDetail = detail || { mode: 'completed', skipped: false };
      this.introListeners.forEach((fn) => {
        try { fn(this.introDetail); } catch {}
      });
      this.introListeners.clear();
      window.dispatchEvent(new CustomEvent('nascw:intro-complete', { detail: this.introDetail }));
    },
    cleanup() {
      this.timelines.forEach((tl) => {
        try { tl.kill(); } catch {}
      });
      this.timelines.clear();
      this.triggers.forEach((st) => {
        try { st.kill(); } catch {}
      });
      this.triggers.clear();
    },
    revealAllImmediately() {
      this.cleanup();
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      if (hasGsap) {
        window.gsap.killTweensOf('.reveal, .service-card, .work-card, .value-list article, .process-list li, .hero-mascot');
        window.gsap.set('.reveal, .service-card, .work-card, .value-list article, .process-list li, .hero-mascot', { clearProps: 'transform,opacity' });
      }
    }
  };
  window.__NASCW_MOTION__ = motionContract;
  window.addEventListener('pagehide', () => motionContract.cleanup(), { once: true });

  // ---------------------------------------------------------------------------
  // AGENT 3: Mascot Intro, Intro Timeline, Skip Intro, Intro-to-Hero Transition,
  //          Mascot Entrance Behavior & Reduced-Motion Intro Fallback
  // ---------------------------------------------------------------------------
  function initAgent3IntroAndHero() {
    const introEl = document.getElementById('nasIntro');
    const skipBtn = document.getElementById('skipIntroBtn');
    const progressBar = document.getElementById('introProgressBar');
    const introSteps = [...document.querySelectorAll('[data-intro-step]')];
    const heroCopy = document.querySelector('.hero .hero-copy');
    const heroVisual = document.querySelector('.hero .system-visual');
    const heroMascot = document.querySelector('.hero .hero-mascot');
    const heroPipeSteps = [...document.querySelectorAll('.hero .pipe-step')];

    const settleHeroBaseline = (enableFloat) => {
      heroCopy?.classList.add('is-visible');
      heroVisual?.classList.add('is-visible');
      if (hasGsap) {
        window.gsap.set(
          [heroCopy, heroVisual, heroMascot, '.hero .eyebrow', '.hero h1', '.hero-lead', '.hero-actions', '.value-points', ...heroPipeSteps].filter(Boolean),
          { clearProps: 'all' }
        );
      }
      if (heroMascot) {
        heroMascot.classList.toggle('is-floating', Boolean(enableFloat && !motionContract.isReducedMotion()));
      }
    };

    const closeIntroOverlay = () => {
      root.classList.remove('has-intro-active');
      if (introEl) {
        introEl.hidden = true;
        if (hasGsap) {
          window.gsap.set(['.nas-intro-backdrop', '.nas-intro-stage', '.nas-intro-mascot-wrap', '.nas-intro-copy', progressBar].filter(Boolean), { clearProps: 'all' });
        }
      }
    };

    const setActiveStep = (stepIndex) => {
      introSteps.forEach((step, idx) => {
        step.classList.toggle('is-active', idx <= stepIndex);
      });
    };

    const params = new URLSearchParams(window.location.search);
    const isCmsPreview = params.has('preview') || window.self !== window.top;
    const forceSkip = params.get('intro') === '0';
    const forceIntro = params.get('intro') === '1';

    let seenIntro = false;
    try { seenIntro = sessionStorage.getItem('nascw-intro-seen') === '1'; } catch {}

    // 1. Reduced-motion intro fallback (instantaneous accessible state)
    if (motionContract.isReducedMotion()) {
      closeIntroOverlay();
      settleHeroBaseline(false);
      motionContract.emitIntroComplete({ mode: 'reduced-motion', skipped: true, owner: 'AGENT_3' });
      return;
    }

    // 2. CMS preview or explicit skip or repeat session visit without ?intro=1
    if (isCmsPreview || forceSkip || (seenIntro && !forceIntro) || !hasGsap || !introEl) {
      closeIntroOverlay();
      settleHeroBaseline(!isCmsPreview && !forceSkip);
      motionContract.emitIntroComplete({
        mode: isCmsPreview ? 'cms-preview' : (seenIntro ? 'repeat-visit' : 'direct'),
        skipped: true,
        owner: 'AGENT_3'
      });
      return;
    }

    // 3. First-visit Mascot Intro sequence
    heroCopy?.classList.add('is-visible');
    heroVisual?.classList.add('is-visible');
    introEl.hidden = false;
    root.classList.add('has-intro-active');
    setActiveStep(0);

    let introTimeline = null;
    let heroTimeline = null;
    let finished = false;

    const runHeroTransition = (fastSkip, onDone) => {
      if (!hasGsap) {
        settleHeroBaseline(true);
        onDone();
        return;
      }
      const durScale = fastSkip ? 0.45 : 1;
      heroTimeline = motionContract.registerTimeline(window.gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          settleHeroBaseline(true);
          onDone();
        }
      }));

      heroTimeline
        .fromTo(heroCopy, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48 * durScale }, 0)
        .fromTo(heroVisual, { y: 20, scale: 0.985, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.52 * durScale }, 0.04 * durScale)
        .fromTo(heroPipeSteps, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34 * durScale, stagger: 0.05 * durScale }, 0.1 * durScale)
        .fromTo(heroMascot, { y: 22, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.38 * durScale, ease: 'back.out(1.4)' }, 0.14 * durScale);
    };

    const finishIntro = (skipped) => {
      if (finished) return;
      finished = true;
      window.removeEventListener('keydown', onKeyDown);
      try { sessionStorage.setItem('nascw-intro-seen', '1'); } catch {}

      if (skipped) {
        if (introTimeline) introTimeline.kill();
        closeIntroOverlay();
        runHeroTransition(true, () => {
          document.querySelector('.brand')?.focus({ preventScroll: true });
          motionContract.emitIntroComplete({ mode: 'skipped', skipped: true, owner: 'AGENT_3' });
        });
        return;
      }

      closeIntroOverlay();
      settleHeroBaseline(true);
      motionContract.emitIntroComplete({ mode: 'completed', skipped: false, owner: 'AGENT_3' });
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finishIntro(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    skipBtn?.addEventListener('click', () => finishIntro(true), { once: true });
    window.requestAnimationFrame(() => skipBtn?.focus({ preventScroll: true }));

    introTimeline = motionContract.registerTimeline(window.gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => finishIntro(false)
    }));

    introTimeline
      .fromTo('.nas-intro-stage', { y: 18, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.38 }, 0)
      .fromTo('.nas-intro-mascot-wrap', { scale: 0.84, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.38, ease: 'back.out(1.5)' }, 0.05)
      .fromTo(progressBar, { scaleX: 0.12 }, { scaleX: 0.42, duration: 0.38 }, 0.08)
      .call(() => setActiveStep(1), null, 0.45)
      .to('.nas-intro-mascot', { y: -6, duration: 0.28, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.45)
      .to(progressBar, { scaleX: 0.76, duration: 0.42 }, 0.45)
      .call(() => setActiveStep(2), null, 0.9)
      .to(progressBar, { scaleX: 1, duration: 0.34 }, 0.9)
      .addLabel('handoff', 1.28)
      .call(() => {
        runHeroTransition(false, () => {});
      }, null, 'handoff')
      .to('.nas-intro-stage', { y: -16, scale: 0.97, opacity: 0, duration: 0.36, ease: 'power2.inOut' }, 'handoff')
      .to('.nas-intro-backdrop', { opacity: 0, duration: 0.38, ease: 'power2.out' }, 'handoff+=0.04');
  }

  // ---------------------------------------------------------------------------
  // AGENT 2: Section Reveals, ScrollTrigger, Card Transitions,
  //          Navigation Micro-Interactions & CTA Animations
  // ---------------------------------------------------------------------------
  function initAgent2ScrollAndInteractions() {
    // 1. Header scroll state & active navigation tracking
    const syncHeaderScroll = () => {
      topbar?.classList.toggle('is-scrolled', window.scrollY > 16);
    };
    syncHeaderScroll();
    window.addEventListener('scroll', syncHeaderScroll, { passive: true });

    const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
    const trackedSections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const setActiveNav = (id) => {
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };

    if ('IntersectionObserver' in window && trackedSections.length) {
      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveNav(entry.target.id);
        });
      }, { rootMargin: '-28% 0px -55% 0px', threshold: 0 });
      trackedSections.forEach((sec) => navObserver.observe(sec));
    }

    // 2. Non-Hero Section Reveals & Card Transitions (Agent 2 never touches .hero)
    const nonHeroReveals = [...document.querySelectorAll('.reveal')].filter((el) => !el.closest('.hero'));
    const cardGroups = [
      { container: '.services-grid', items: '.service-card' },
      { container: '.work-grid', items: '.work-card' },
      { container: '.value-list', items: 'article' },
      { container: '.process-list', items: 'li' }
    ];

    if (motionContract.isReducedMotion() || !hasScrollTrigger) {
      if (motionContract.isReducedMotion() || !('IntersectionObserver' in window)) {
        nonHeroReveals.forEach((item) => item.classList.add('is-visible'));
      } else {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }), { threshold: 0.12 });
        nonHeroReveals.forEach((item) => observer.observe(item));
      }
      return;
    }

    // Keep IntersectionObserver as immediate safety net if user jumps via anchor link
    if ('IntersectionObserver' in window) {
      const safetyObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      }), { threshold: 0.08 });
      nonHeroReveals.forEach((item) => safetyObserver.observe(item));
    }

    nonHeroReveals.forEach((el) => {
      const tween = window.gsap.fromTo(
        el,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          immediateRender: false,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true
          },
          onStart: () => el.classList.add('is-visible'),
          onComplete: () => {
            el.classList.add('is-visible');
            window.gsap.set(el, { clearProps: 'transform,opacity' });
          }
        }
      );
      if (tween.scrollTrigger) motionContract.registerTrigger(tween.scrollTrigger);
    });

    cardGroups.forEach(({ container, items }) => {
      const parent = document.querySelector(container);
      if (!parent) return;
      const cards = [...parent.querySelectorAll(items)];
      if (!cards.length) return;
      const tween = window.gsap.fromTo(
        cards,
        { y: 14 },
        {
          y: 0,
          duration: 0.44,
          stagger: 0.055,
          immediateRender: false,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: parent,
            start: 'top 88%',
            once: true
          },
          onComplete: () => {
            window.gsap.set(cards, { clearProps: 'transform,opacity' });
          }
        }
      );
      if (tween.scrollTrigger) motionContract.registerTrigger(tween.scrollTrigger);
    });

    // 3. Card & CTA Micro-Interactions (transform-only, cleaned up on pointerleave)
    const interactiveCards = [...document.querySelectorAll('.service-card, .work-card')];
    interactiveCards.forEach((card) => {
      card.addEventListener('pointerenter', () => {
        if (motionContract.isReducedMotion()) return;
        window.gsap.to(card, { y: -3, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
      });
      card.addEventListener('pointerleave', () => {
        if (motionContract.isReducedMotion()) return;
        window.gsap.to(card, {
          y: 0,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: 'auto',
          onComplete: () => window.gsap.set(card, { clearProps: 'transform' })
        });
      });
    });

    const ctaButtons = [...document.querySelectorAll('.button')];
    ctaButtons.forEach((btn) => {
      btn.addEventListener('pointerdown', () => {
        if (motionContract.isReducedMotion()) return;
        window.gsap.to(btn, { scale: 0.98, duration: 0.1, ease: 'power2.out', overwrite: 'auto' });
      });
      const release = () => {
        if (motionContract.isReducedMotion()) return;
        window.gsap.to(btn, {
          scale: 1,
          duration: 0.16,
          ease: 'power2.out',
          overwrite: 'auto',
          onComplete: () => window.gsap.set(btn, { clearProps: 'transform' })
        });
      };
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointerleave', release);
    });

    window.requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  // Handle dynamic reduced-motion changes at runtime
  motionMedia.addEventListener?.('change', (event) => {
    if (event.matches) {
      motionContract.cleanup();
      const introEl = document.getElementById('nasIntro');
      if (introEl) introEl.hidden = true;
      root.classList.remove('has-intro-active');
      document.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('is-visible');
        if (hasGsap) window.gsap.set(el, { clearProps: 'all' });
      });
      document.querySelector('.hero-mascot')?.classList.remove('is-floating');
    }
  });

  // Coordinate Agent 3 -> Agent 2 via Motion Ownership Contract
  motionContract.onIntroComplete(() => {
    initAgent2ScrollAndInteractions();
  });
  initAgent3IntroAndHero();
})();
