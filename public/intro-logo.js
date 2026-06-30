(() => {
  const path = location.pathname.replace(/\/+$/, '');
  if (path === '/admin' || path === '/admin.html' || path.startsWith('/admin/')) return;

  const force = /(?:\?|&)intro=1(?:&|$)/.test(location.search);
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced && !force) return;
  if (!force && sessionStorage.getItem('nascw_intro_seen') === '1') return;

  sessionStorage.setItem('nascw_intro_seen', '1');

  const intro = document.createElement('div');
  intro.className = 'nas-intro';
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML = `
    <div class="intro-stage">
      <div class="intro-orbit">
        <span class="intro-cube cube-1"></span>
        <span class="intro-cube cube-2"></span>
        <span class="intro-cube cube-3"></span>
        <span class="intro-cube cube-4"></span>
      </div>
      <div class="intro-ring"></div>
      <span class="intro-signal"></span>
      <img class="intro-logo" src="/brand/nascw-mark.svg" alt="">
    </div>
  `;

  document.documentElement.classList.add('nas-intro-lock');
  document.body.classList.add('nas-intro-running');
  document.body.prepend(intro);

  window.setTimeout(() => {
    document.body.classList.add('nas-intro-reveal');
  }, 2550);

  window.setTimeout(() => {
    intro.classList.add('is-exiting');
    document.documentElement.classList.remove('nas-intro-lock');
  }, 3180);

  window.setTimeout(() => {
    intro.remove();
    document.body.classList.remove('nas-intro-running');
    document.body.classList.remove('nas-intro-reveal');
    document.body.classList.add('nas-intro-done');
  }, 3950);
})();
