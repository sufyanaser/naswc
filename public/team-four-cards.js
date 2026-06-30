(() => {
  const additions = [
    {
      name: 'عضو الفريق',
      role: 'تحليل سير العمل',
      bio: 'فهم دورة العمل، ترتيب المتطلبات، وتجهيز مخطط التنفيذ',
      mark: '▦'
    }
  ];

  function makeCard(member, index) {
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

  function apply() {
    const grid = document.querySelector('#team .team-grid');
    if (!grid || grid.dataset.nasFourCards === 'true') return Boolean(grid);

    const cards = Array.from(grid.querySelectorAll('.tm'));
    cards.forEach(card => {
      card.style.order = '';
    });

    let count = cards.length;
    additions.forEach(member => {
      if (count < 4) {
        count += 1;
        grid.appendChild(makeCard(member, count));
      }
    });

    grid.dataset.nasFourCards = 'true';
    return true;
  }

  let tries = 0;
  function wait() {
    if (apply()) return;
    tries += 1;
    if (tries < 120) requestAnimationFrame(wait);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wait, { once: true });
  } else {
    wait();
  }
})();
