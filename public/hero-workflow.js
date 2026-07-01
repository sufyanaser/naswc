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

  function installPngSafeUpload() {
    // Guard: do not override the R2 uploader on the admin panel
    if (document.querySelector('.admin-shell, #adminroot, #gate')) return;
    if (window.__NASCW_R2_UPLOAD_ACTIVE__) return;

    const pngSafeCompressor = function(file, maxW = 1600, quality = .82) {
      return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => {
          const img = new Image();
          img.onload = () => {
            let w = img.width;
            let h = img.height;
            if (w > maxW) {
              h = Math.round(h * maxW / w);
              w = maxW;
            }
            const cv = document.createElement('canvas');
            cv.width = w;
            cv.height = h;
            const ctx = cv.getContext('2d', { willReadFrequently: true });
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);

            let hasAlpha = file.type === 'image/png' || file.type === 'image/webp';
            try {
              const sample = ctx.getImageData(0, 0, w, h).data;
              for (let i = 3; i < sample.length; i += 4) {
                if (sample[i] < 255) { hasAlpha = true; break; }
              }
            } catch (_) {}

            if (hasAlpha) {
              res(cv.toDataURL('image/png'));
            } else {
              res(cv.toDataURL('image/jpeg', quality));
            }
          };
          img.onerror = rej;
          img.src = r.result;
        };
        r.onerror = rej;
        r.readAsDataURL(file);
      });
    };

    try {
      window.fileToCompressedDataURL = pngSafeCompressor;
      fileToCompressedDataURL = pngSafeCompressor;
      window.__NAS_PNG_SAFE_UPLOAD__ = true;
    } catch (_) {
      window.fileToCompressedDataURL = pngSafeCompressor;
    }
  }

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
    document.addEventListener('DOMContentLoaded', () => { installPngSafeUpload(); waitForHero(); waitForTeam(); bindScroll(); }, { once: true });
  } else {
    installPngSafeUpload();
    waitForHero();
    waitForTeam();
    bindScroll();
  }
})();
