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

  function buildHeroWorkflow() {
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

  function makeTeamCard(member, index) {
    const card = document.createElement('div');
    card.className = 'tm rv nas-team-added';
    card.style.setProperty('--rv-delay', `${index * 60}ms`);
    card.innerHTML = `
      <div class="tm-photo"><span class="tm-ph">${member.mark || '▦'}</span></div>
      <div class="tm-body">
        <h3 class="nm">${member.name}</h3>
        <div class="rl">${member.role}</div>
        <p class="bio">${member.bio}</p>
      </div>
    `;
    return card;
  }

  function normalizeTeam() {
    const grid = document.querySelector('#team .team-grid');
    if (!grid || grid.dataset.nasFourCards === 'true') return Boolean(grid);

    Array.from(grid.querySelectorAll('.tm')).forEach(card => {
      card.style.order = '';
    });

    const additions = [
      {
        name: 'عضو الفريق',
        role: 'تحليل سير العمل',
        bio: 'فهم دورة العمل، ترتيب المتطلبات، وتجهيز مخطط التنفيذ',
        mark: '▦'
      }
    ];

    let count = grid.querySelectorAll('.tm').length;
    additions.forEach(member => {
      if (count < 4) {
        count += 1;
        grid.appendChild(makeTeamCard(member, count));
      }
    });

    grid.dataset.nasFourCards = 'true';
    return true;
  }

  let heroTries = 0;
  function waitForHero() {
    if (buildHeroWorkflow()) return;
    heroTries += 1;
    if (heroTries < 120) requestAnimationFrame(waitForHero);
  }

  let teamTries = 0;
  function waitForTeam() {
    if (normalizeTeam()) return;
    teamTries += 1;
    if (teamTries < 120) requestAnimationFrame(waitForTeam);
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
    document.addEventListener('DOMContentLoaded', () => { waitForHero(); waitForTeam(); bindScroll(); }, { once: true });
  } else {
    waitForHero();
    waitForTeam();
    bindScroll();
  }
})();
