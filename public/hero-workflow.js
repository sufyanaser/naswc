(() => {
  const cardsLeft = [
    ['XLS', 'Excel'],
    ['WA', 'واتساب'],
    ['INV', 'فواتير'],
    ['REP', 'تقارير'],
    ['ACC', 'حسابات']
  ];
  const cardsRight = [
    ['✓', 'مخزن مرتب'],
    ['✓', 'فواتير مصنفة'],
    ['✓', 'تقارير جاهزة'],
    ['✓', 'حسابات واضحة'],
    ['✓', 'أرشيف منظم']
  ];
  const packets = ['XLS', 'WA', 'PDF', 'INV'];

  function cardMarkup(items, side) {
    return `<div class="wf-side wf-${side}">${items.map(([icon, label]) =>
      `<div class="wf-card"><i>${icon}</i><span>${label}</span></div>`
    ).join('')}</div>`;
  }

  function build() {
    const hero = document.querySelector('.hero');
    if (!hero || hero.querySelector('.nas-hero-workflow')) return Boolean(hero);

    const layer = document.createElement('div');
    layer.className = 'nas-hero-workflow';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = `
      ${cardMarkup(cardsLeft, 'left')}
      <div class="wf-lanes"><span class="wf-lane"></span><span class="wf-lane"></span><span class="wf-lane"></span><span class="wf-lane"></span></div>
      <div class="wf-packets">${packets.map(p => `<span class="wf-packet">${p}</span>`).join('')}</div>
      <span class="wf-signal"></span>
      ${cardMarkup(cardsRight, 'right')}
    `;
    hero.insertBefore(layer, hero.firstChild);
    return true;
  }

  let tries = 0;
  function waitForHero() {
    if (build()) return;
    tries += 1;
    if (tries < 120) requestAnimationFrame(waitForHero);
  }

  function bindScroll() {
    let ticking = false;
    const update = () => {
      ticking = false;
      const hero = document.querySelector('.hero');
      const layer = document.querySelector('.nas-hero-workflow');
      if (!hero || !layer) return;
      const rect = hero.getBoundingClientRect();
      const h = Math.max(rect.height, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / h));
      layer.style.setProperty('--hero-scroll', progress.toFixed(3));
      layer.style.opacity = String(Math.max(.34, .78 - progress * .32));
    };
    const request = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    request();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { waitForHero(); bindScroll(); }, { once: true });
  } else {
    waitForHero();
    bindScroll();
  }
})();
