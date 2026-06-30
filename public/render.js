/* ============================================================
   NAS CodeWorks — render engine
   طبقة التخزين: content.json (افتراضي) ← localStorage (تعديلات)
   قابلة للتحويل لـ Backend لاحقاً بتغيير loadContent() فقط.
   ============================================================ */
const STORE_KEY = 'nascw_content_v1';
const WA = n => 'https://wa.me/' + n;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const enc = encodeURIComponent;

// أيقونات الخدمات / الآلام
const ICONS = {
  box:'<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>',
  grid:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6"/>',
  dollar:'<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  file:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>',
  bell:'<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/>',
  desktop:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  archive:'<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>',
  automation:'<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>'
};
const SVG = (p, sw=2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}">${p}</svg>`;
const CHECK = SVG('<path d="M20 6L9 17l-5-5"/>');
const XICON = SVG('<path d="M18 6L6 18M6 6l12 12"/>');
const WAICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.6.2-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3zM12 2a10 10 0 00-8.5 15.3L2 22l4.8-1.5A10 10 0 1012 2z"/></svg>';

async function loadContent(){
  let local = null;
  try{ const r = localStorage.getItem(STORE_KEY); if(r) local = JSON.parse(r); }catch(e){}
  if(local) return local;
  try{
    const res = await fetch('content.json', {cache:'no-store'});
    if(res.ok) return await res.json();
  }catch(e){}
  return window.__DEFAULT_CONTENT__ || {};
}

/* ---------- LOGO ---------- */
const MARK_SVG='<svg viewBox="0 0 100 100" width="34" height="34" style="flex:none"><defs><linearGradient id="nbg" x1="0.12" y1="0.1" x2="0.9" y2="0.92"><stop offset="0" stop-color="#00D4FF"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs><path d="M 66.8 74.2 A 29.5 29.5 0 1 1 66.8 25.8" fill="none" stroke="url(#nbg)" stroke-width="9.2" stroke-linecap="round"/><rect x="44.2" y="44.2" width="11.6" height="11.6" rx="3" fill="#00D4FF"/><rect x="63.5" y="46" width="8" height="8" rx="2.1" fill="#00D4FF" opacity=".92" transform="rotate(10 67.5 50)"/><rect x="73.2" y="45.4" width="6" height="6" rx="1.6" fill="#5BBEF0" opacity=".62" transform="rotate(18 76 48)"/><rect x="81" y="44" width="4.4" height="4.4" rx="1.2" fill="#7C3AED" opacity=".38" transform="rotate(26 83 46)"/></svg>';
function brandInner(c){
  const br=c.brand||{};
  if(br.logoMode==='custom' && br.logoImage){
    return `<img class="logo-img" src="${esc(br.logoImage)}" alt="NAS CodeWorks">`;
  }
  const pre=esc(br.wordmarkPrefix||'NAS'), suf=esc(br.wordmarkSuffix||'CodeWorks');
  return `${MARK_SVG}<span>${pre}</span> <b>${suf}</b>`;
}
function applyFavicon(c){
  const br=c.brand||{}; const link=document.getElementById('favicon'); if(!link) return;
  if(br.faviconMode==='custom' && br.faviconImage){ link.href=br.faviconImage; link.type=br.faviconImage.startsWith('data:image/png')?'image/png':'image/svg+xml'; }
}

/* ---------- builders ---------- */
function heroHTML(c){
  const wa = WA(c.contact.waNumber);
  const flow = (c.hero.flowEnabled!==false) ? '<canvas id="hero-flow"></canvas>' : '';
  return `<header class="hero">${flow}<div class="wrap">
    <span class="pill rv"><span class="dot"></span>${esc(c.hero.pill)}</span>
    <h1 class="rv">${esc(c.hero.titleLine1)}<br><span class="hl">${esc(c.hero.titleHl)}</span><br>${esc(c.hero.titleLine3)}</h1>
    <p class="sub rv">${esc(c.hero.sub)}</p>
    <p class="micro rv">${esc(c.hero.micro)}</p>
    <div class="hero-cta rv">
      <a href="${wa}?text=${enc('السلام عليكم، عندي شركة وأريد أناقش برنامج لإدارة المخزن والفواتير')}" class="btn btn-wa" target="_blank" rel="noopener">${WAICON} احكِ معنا بالواتساب</a>
      <a href="#services" class="btn btn-ghost">شوف الخدمات والأسعار</a>
    </div>
    <div class="hero-trust rv">${(c.hero.trust||[]).map(t=>`<span>${CHECK}${esc(t)}</span>`).join('')}</div>
  </div></header>`;
}
function painHTML(c){
  const cards = (c.pain.items||[]).map(it=>`<div class="pain-card rv">
    <div class="ic">${SVG(ICONS[it.icon]||ICONS.box)}</div>
    <h3>${esc(it.title)}</h3><p>${esc(it.body)}</p>
    <div class="quote">${esc(it.quote)}</div></div>`).join('');
  return `<section id="pain"><div class="wrap">
    <span class="kicker rv">${esc(c.pain.kicker)}</span>
    <h2 class="sec rv">${esc(c.pain.title)}</h2>
    <p class="sec-sub rv">${esc(c.pain.sub)}</p>
    <div class="pain-grid">${cards}</div></div></section>`;
}
function baHTML(c){
  const bl = (c.ba.before||[]).map(t=>`<li>${XICON}${esc(t)}</li>`).join('');
  const al = (c.ba.after||[]).map(t=>`<li>${CHECK}${esc(t)}</li>`).join('');
  return `<section id="ba" style="background:linear-gradient(180deg,transparent,rgba(15,26,46,.4),transparent)"><div class="wrap">
    <span class="kicker rv">${esc(c.ba.kicker)}</span><h2 class="sec rv">${esc(c.ba.title)}</h2><p class="sec-sub rv">${esc(c.ba.sub)}</p>
    <div class="ba rv">
      <div class="ba-col before"><div class="ba-tag t-before"><span class="b"></span>قبل — اليوم</div><ul class="ba-list">${bl}</ul></div>
      <div class="ba-arrow">${SVG('<path d="M19 12H5M12 5l-7 7 7 7"/>')}</div>
      <div class="ba-col after"><div class="ba-tag t-after"><span class="b"></span>بعد — مع برنامجك</div><ul class="ba-list">${al}</ul></div>
    </div></div></section>`;
}
function offerHTML(c){
  if(!c.offers || !c.offers.enabled) return '';
  const wa = WA(c.contact.waNumber);
  return `<section id="offer"><div class="wrap"><div class="offer rv">
    ${c.offers.badge?`<span class="ob">${esc(c.offers.badge)}</span>`:''}
    <div class="otxt"><h3>${esc(c.offers.title)}</h3><p>${esc(c.offers.body)}</p></div>
    <a href="${wa}?text=${enc(c.offers.waText||'أريد أستفسر عن العرض')}" class="octa" target="_blank" rel="noopener">${WAICON} استفد من العرض</a>
  </div></div></section>`;
}
function servicesHTML(c){
  const wa = WA(c.contact.waNumber);
  const cards = (c.services.items||[]).map(s=>`<div class="svc${s.featured?' featured':''} rv">
    ${s.badge?`<span class="svc-badge">${esc(s.badge)}</span>`:''}
    <div class="ic">${SVG(ICONS[s.icon]||ICONS.desktop)}</div>
    <h3>${esc(s.title)}</h3><p class="desc">${esc(s.desc)}</p>
    <ul class="svc-feats">${(s.feats||[]).map(f=>`<li>${CHECK}${esc(f)}</li>`).join('')}</ul>
    <div class="svc-price"><div class="lbl">${esc(s.priceLabel)}</div>
      <div class="amt">${esc(s.priceAmount)} <b>${esc(s.priceUnit)}</b></div>
      <div class="note">${esc(s.priceNote)}</div></div>
    <a href="${wa}?text=${enc(s.waText||'')}" class="svc-go" target="_blank" rel="noopener">احجز استشارة مجانية ${SVG('<path d="M19 12H5M12 19l-7-7 7-7"/>')}</a>
  </div>`).join('');
  const notes = (c.services.notes||[]).map((n,i)=>{
    const ic = [SVG('<path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>'),SVG('<path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'),SVG('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>')][i]||CHECK;
    return `<span>${ic}${esc(n)}</span>`;}).join('');
  return `<section id="services"><div class="wrap">
    <span class="kicker rv">${esc(c.services.kicker)}</span><h2 class="sec rv">${esc(c.services.title)}</h2><p class="sec-sub rv">${esc(c.services.sub)}</p>
    <div class="svc-grid">${cards}</div>
    <div class="pricing-note rv">${notes}</div></div></section>`;
}
function proofHTML(c){
  const cards = (c.proof.items||[]).map((p,idx)=>{
    const imgs = p.images||[];
    let shot;
    if(imgs.length){
      shot = `<div class="proof-shot has-img" data-proj="${idx}">
        <img src="${esc(imgs[0])}" alt="${esc(p.title)}" loading="lazy">
        <div class="ov">
          <span class="view">${SVG('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>')} عرض المعرض</span>
          <span class="cnt">${SVG('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>')} ${imgs.length}</span>
        </div></div>`;
    } else {
      shot = `<div class="proof-shot"><div class="mock"><div class="mock-bar"><i></i><i></i><i></i></div>
        <div class="mock-body"><div class="mock-row w2"></div><div class="mock-row w1"></div>
        <div class="mock-chips"><b></b><b></b><b></b></div><div class="mock-row w3"></div><div class="mock-row w1"></div></div></div></div>`;
    }
    return `<div class="proof-card rv">${shot}<div class="proof-body"><div class="tag">${esc(p.tag)}</div><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></div></div>`;
  }).join('');
  const f = c.proof.founder||{};
  const av = f.avatar ? `<img src="${esc(f.avatar)}" alt="${esc(f.name)}">` : esc(f.initial||'س');
  const stats = (f.stats||[]).map(s=>{
    const m=String(s.n).match(/^(\d+)(\D*)$/);
    const nAttr = m ? ` data-count="${m[1]}" data-suffix="${esc(m[2])}"` : '';
    return `<div><div class="n"${nAttr}>${esc(s.n)}</div><div class="l">${esc(s.l)}</div></div>`;
  }).join('');
  return `<section id="proof" style="background:linear-gradient(180deg,transparent,rgba(15,26,46,.4),transparent)"><div class="wrap">
    <span class="kicker rv">${esc(c.proof.kicker)}</span><h2 class="sec rv">${esc(c.proof.title)}</h2><p class="sec-sub rv">${esc(c.proof.sub)}</p>
    <div class="proof-grid">${cards}</div>
    <div class="founder rv"><div class="founder-av">${av}</div>
      <div class="founder-txt"><div class="nm">${esc(f.name)}</div><div class="rl">${esc(f.role)}</div>
        <p>${esc(f.bio)}</p><div class="founder-stats">${stats}</div></div></div>
  </div></section>`;
}
function processHTML(c){
  const steps = (c.process.steps||[]).map(s=>`<div class="proc-step rv"><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p><div class="when">${esc(s.when)}</div></div>`).join('');
  return `<section id="process"><div class="wrap"><span class="kicker rv">${esc(c.process.kicker)}</span>
    <h2 class="sec rv">${esc(c.process.title)}</h2><p class="sec-sub rv">${esc(c.process.sub)}</p>
    <div class="proc">${steps}</div></div></section>`;
}
function whyHTML(c){
  const cell = o => {
    if(o.yes===true) return `<span class="vs-yes">${SVG('<path d="M20 6L9 17l-5-5"/>',2.5)}${esc(o.text)}</span>`;
    if(o.yes===false) return `<span class="vs-no">${SVG('<path d="M18 6L6 18M6 6l12 12"/>',2.5)}${esc(o.text)}</span>`;
    return `<span class="vs-no">${esc(o.text)}</span>`;
  };
  const rows = (c.why.rows||[]).map(r=>`<tr><td>${esc(r.criteria)}</td><td class="us">${cell(r.us)}</td><td>${cell(r.c2)}</td><td>${cell(r.c3)}</td></tr>`).join('');
  const cols = c.why.cols||[];
  return `<section id="why" style="background:linear-gradient(180deg,transparent,rgba(15,26,46,.4),transparent)"><div class="wrap">
    <span class="kicker rv">${esc(c.why.kicker)}</span><h2 class="sec rv">${esc(c.why.title)}</h2><p class="sec-sub rv">${esc(c.why.sub)}</p>
    <div class="vs-wrap rv"><table class="vs"><thead><tr><th>المعيار</th><th class="us">${esc(cols[0])}</th><th>${esc(cols[1])}</th><th>${esc(cols[2])}</th></tr></thead>
    <tbody>${rows}</tbody></table></div></div></section>`;
}
function startHTML(c){
  const wa = WA(c.contact.waNumber);
  const proms = (c.start.promises||[]).map((p,i)=>{
    const ic=[SVG('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),SVG('<path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'),CHECK][i]||CHECK;
    return `<div>${ic}<div><b>${esc(p.title)}</b><span>${esc(p.sub)}</span></div></div>`;}).join('');
  return `<section id="start"><div class="wrap"><div class="start rv"><div class="start-grid">
    <div class="start-left"><h2>${esc(c.start.title)}</h2><p>${esc(c.start.body)}</p>
      <div class="start-promise">${proms}</div>
      <a href="${wa}?text=${enc(c.start.waText||'')}" class="wa-big" target="_blank" rel="noopener">${WAICON} احكِ معنا مباشرة بالواتساب</a></div>
    <div class="form-card"><div class="ft">أو اترك بياناتك ونتصل بيك</div><div class="fs">نرسل لك ردنا على الواتساب خلال 24 ساعة</div>
      <div class="field"><label>اسمك</label><input type="text" id="f-name" placeholder="مثال: أبو محمد"></div>
      <div class="field"><label>اسم الشركة (اختياري)</label><input type="text" id="f-co" placeholder="شركة التوزيع..."></div>
      <div class="field"><label>نوع شغلك</label><select id="f-type">
        <option value="توزيع">شركة توزيع</option><option value="مخازن">مخازن / تجارة جملة</option>
        <option value="أرشفة">أرشفة وإدارة وثائق</option><option value="أتمتة">أتمتة وتقارير</option><option value="غير ذلك">غير ذلك</option></select></div>
      <div class="field"><label>شنو أكبر مشكلة عندك؟</label><textarea id="f-msg" placeholder="مثال: ما أعرف منو أخذ البضاعة من المخزن، والحسابات ما تطابق..."></textarea></div>
      <button class="form-submit" id="f-send">${WAICON} أرسل عبر الواتساب</button>
      <div class="form-alt">يفتح محادثة واتساب جاهزة — تراجعها قبل الإرسال</div>
    </div></div></div></div></section>`;
}
function faqHTML(c){
  const items = (c.faq.items||[]).map(it=>`<details class="faq rv"><summary>${esc(it.q)}<svg class="ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></summary><div class="ans">${esc(it.a)}</div></details>`).join('');
  return `<section id="faq"><div class="wrap"><span class="kicker rv" style="margin:0 auto;display:flex;justify-content:center">${esc(c.faq.kicker)}</span>
    <h2 class="sec rv" style="text-align:center">${esc(c.faq.title)}</h2>
    <div class="faq-list" style="margin-top:34px">${items}</div></div></section>`;
}
function teamHTML(c){
  const tm=c.team; if(!tm || !tm.enabled) return '';
  const cards=(tm.members||[]).map(m=>{
    const photo = m.photo
      ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">`
      : `<div class="tm-ph">${esc((m.name||'؟').trim().charAt(0))}</div>`;
    return `<div class="tm rv"><div class="tm-photo">${photo}</div>
      <div class="tm-body"><div class="nm">${esc(m.name)}</div><div class="rl">${esc(m.role)}</div>
      ${m.bio?`<div class="bio">${esc(m.bio)}</div>`:''}</div></div>`;
  }).join('');
  return `<section id="team"><div class="wrap">
    <span class="kicker rv">${esc(tm.kicker)}</span><h2 class="sec rv">${esc(tm.title)}</h2><p class="sec-sub rv">${esc(tm.sub)}</p>
    <div class="team-grid">${cards}</div></div></section>`;
}
function footerHTML(c){
  const wa = WA(c.contact.waNumber);
  return `<footer><div class="wrap"><div class="foot-grid">
    <div class="foot-brand"><a href="#top" class="brand">${brandInner(c)}</a>
      <p>${esc(c.footer.tagline)}</p></div>
    <div class="foot-contact">
      <a href="${wa}" target="_blank" rel="noopener">${WAICON} ${esc(c.contact.phone)}</a>
      <a href="mailto:${esc(c.contact.email)}">${SVG('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>')} ${esc(c.contact.email)}</a>
      <a href="#start">${SVG('<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>')} ${esc(c.contact.location)}</a>
    </div></div>
    <div class="foot-bottom"><span>${esc(c.footer.bottomLeft)}</span><span>${esc(c.footer.bottomRight)}</span></div>
  </div></footer>`;
}

/* ---------- LIGHTBOX (premium) ---------- */
const LB = {
  el:null, track:null, foot:null, dots:null, title:null, tag:null, counter:null, prev:null, next:null,
  imgs:[], i:0, touchX:0, touchY:0, swiping:false,
  init(){
    this.el=document.getElementById('lb'); this.track=document.getElementById('lb-track');
    this.foot=document.getElementById('lb-foot'); this.dots=document.getElementById('lb-dots');
    this.title=document.getElementById('lb-title'); this.tag=document.getElementById('lb-tag');
    this.counter=document.getElementById('lb-counter');
    this.prev=document.getElementById('lb-prev'); this.next=document.getElementById('lb-next');
    document.getElementById('lb-close').onclick=()=>this.close();
    this.prev.onclick=()=>this.go(this.i-1); this.next.onclick=()=>this.go(this.i+1);
    this.el.addEventListener('click',e=>{ if(e.target===this.el||e.target.classList.contains('lb-main')) this.close(); });
    document.addEventListener('keydown',e=>{
      if(!this.el.classList.contains('open')) return;
      if(e.key==='Escape') this.close();
      else if(e.key==='ArrowLeft') this.go(this.i+1);   // RTL: يسار = التالي
      else if(e.key==='ArrowRight') this.go(this.i-1);
    });
    const main=document.getElementById('lb-main');
    main.addEventListener('touchstart',e=>{this.touchX=e.touches[0].clientX;this.touchY=e.touches[0].clientY;this.swiping=true;},{passive:true});
    main.addEventListener('touchend',e=>{
      if(!this.swiping) return; this.swiping=false;
      const dx=e.changedTouches[0].clientX-this.touchX, dy=e.changedTouches[0].clientY-this.touchY;
      if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)){ this.go(dx<0?this.i+1:this.i-1); } // RTL سحب يسار=التالي
    },{passive:true});
  },
  open(title,tag,imgs,start=0){
    this.imgs=imgs; this.i=start; this.title.textContent=title; this.tag.textContent=tag;
    this.track.innerHTML=imgs.map(src=>`<div class="lb-slide"><img src="${esc(src)}" alt="" draggable="false"></div>`).join('');
    this.track.querySelectorAll('img').forEach(img=>img.onclick=ev=>{ev.stopPropagation();img.classList.toggle('zoomed');});
    this.foot.innerHTML=imgs.map((src,k)=>`<div class="lb-thumb${k===start?' active':''}" data-k="${k}"><img src="${esc(src)}" alt=""></div>`).join('');
    this.foot.querySelectorAll('.lb-thumb').forEach(t=>t.onclick=()=>this.go(+t.dataset.k));
    this.dots.innerHTML=imgs.map((_,k)=>`<i class="${k===start?'active':''}" data-k="${k}"></i>`).join('');
    this.dots.querySelectorAll('i').forEach(d=>d.onclick=()=>this.go(+d.dataset.k));
    this.update();
    this.el.classList.add('open'); document.body.style.overflow='hidden';
    requestAnimationFrame(()=>this.el.classList.add('show'));
  },
  go(n){
    if(n<0||n>=this.imgs.length) return;
    this.i=n;
    this.track.querySelectorAll('img.zoomed').forEach(im=>im.classList.remove('zoomed'));
    this.update();
  },
  update(){
    this.track.style.transform=`translateX(${this.i*100}%)`; // RTL
    this.counter.textContent=`${this.i+1} / ${this.imgs.length}`;
    this.prev.classList.toggle('disabled',this.i===0);
    this.next.classList.toggle('disabled',this.i===this.imgs.length-1);
    this.foot.querySelectorAll('.lb-thumb').forEach((t,k)=>t.classList.toggle('active',k===this.i));
    this.dots.querySelectorAll('i').forEach((d,k)=>d.classList.toggle('active',k===this.i));
    const at=this.foot.querySelector('.lb-thumb.active'); if(at&&at.scrollIntoView){try{at.scrollIntoView({inline:'center',behavior:'smooth',block:'nearest'});}catch(e){}}
  },
  close(){
    this.el.classList.remove('show'); document.body.style.overflow='';
    setTimeout(()=>this.el.classList.remove('open'),300);
  }
};

/* ---------- HERO FLOW ENGINE ---------- */
function initHeroFlow(){
  const cv=document.getElementById('hero-flow'); if(!cv) return;
  const ctx=cv.getContext('2d');
  const DPR=Math.min(window.devicePixelRatio||1,2);
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W,H;
  const TYPES=['xlsx','pdf','invoice','wa','report','db'];
  const COL={xlsx:'#22C98A',pdf:'#EF4D4D',invoice:'#F5A524',wa:'#22C98A',report:'#00D4FF',db:'#7C3AED'};
  const PROC_A=0.36,PROC_B=0.64,ORDER_X=1.0;
  function resize(){ W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0); }
  window.addEventListener('resize',resize);
  const LANES=5;
  function spawn(initial){
    const lane=Math.floor(Math.random()*LANES);
    return {type:TYPES[Math.floor(Math.random()*TYPES.length)],
      x:initial?(Math.random()*PROC_A):-0.06,
      lane, yBase:0.16+lane*0.16+(Math.random()*0.04-0.02),
      jitter:0.03+Math.random()*0.04, ph:Math.random()*Math.PI*2,
      size:12+Math.random()*7, speed:0.015+Math.random()*0.011,
      rot:(Math.random()*0.6-0.3), pulse:0, prog:0};
  }
  const N=reduce?12:24;
  const parts=[]; for(let i=0;i<N;i++) parts.push(spawn(true));
  let scrollFactor=1;
  window.addEventListener('scroll',()=>{ scrollFactor=Math.max(0,1-(window.scrollY|0)/720); },{passive:true});
  function drawFile(p,x,y,alpha,ordered){
    const s=p.size,w=s,h=s*1.25,r=3,col=COL[p.type];
    ctx.save(); ctx.translate(x,y);
    if(!ordered) ctx.rotate(p.rot*(1-p.prog));
    ctx.globalAlpha=alpha;
    ctx.beginPath();
    ctx.moveTo(-w/2+r,-h/2); ctx.lineTo(w/2-4,-h/2); ctx.lineTo(w/2,-h/2+4);
    ctx.lineTo(w/2,h/2-r); ctx.arcTo(w/2,h/2,w/2-r,h/2,r);
    ctx.lineTo(-w/2+r,h/2); ctx.arcTo(-w/2,h/2,-w/2,h/2-r,r);
    ctx.lineTo(-w/2,-h/2+r); ctx.arcTo(-w/2,-h/2,-w/2+r,-h/2,r); ctx.closePath();
    ctx.fillStyle='rgba(15,26,46,.82)'; ctx.fill();
    ctx.lineWidth=1.3; ctx.strokeStyle=col; ctx.globalAlpha=alpha*(ordered?.95:.6); ctx.stroke();
    ctx.globalAlpha=alpha*.45; ctx.lineWidth=1;
    for(let i=0;i<3;i++){const yy=-h/2+6+i*5;ctx.beginPath();ctx.moveTo(-w/2+4,yy);ctx.lineTo(w/2-4-(i===2?4:0),yy);ctx.stroke();}
    if(p.pulse>0){ctx.globalAlpha=alpha*p.pulse*.85;ctx.shadowBlur=13;ctx.shadowColor=col;ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.stroke();ctx.shadowBlur=0;}
    ctx.restore();
  }
  let t=0,raf;
  function frame(){
    t+=0.016; ctx.clearRect(0,0,W,H);
    const procX=(PROC_A+PROC_B)/2*W;
    const g=ctx.createLinearGradient(procX-70,0,procX+70,0);
    g.addColorStop(0,'rgba(0,212,255,0)');g.addColorStop(.5,'rgba(0,212,255,'+(0.045*scrollFactor)+')');g.addColorStop(1,'rgba(124,58,237,0)');
    ctx.fillStyle=g; ctx.fillRect(procX-70,0,140,H);
    parts.forEach(p=>{
      p.x+=p.speed*scrollFactor;
      p.prog=Math.min(1,Math.max(0,(p.x-PROC_A)/(PROC_B-PROC_A)));
      if(p.x>PROC_A&&p.x<PROC_B) p.pulse=Math.min(1,p.pulse+0.08); else p.pulse=Math.max(0,p.pulse-0.045);
      const chaosY=(p.yBase+p.jitter*Math.sin(t*1.1+p.ph))*H;
      const orderY=(0.2+p.lane*0.15)*H;
      const y=chaosY*(1-p.prog)+orderY*p.prog;
      const x=p.x*W;
      const alpha=(0.2+0.32*p.prog)*scrollFactor;
      if(x>-24&&x<W+24) drawFile(p,x,y,alpha,p.prog>0.92);
      if(p.x>ORDER_X+0.06) Object.assign(p,spawn(false));
    });
    raf=requestAnimationFrame(frame);
  }
  resize();
  if(reduce){ parts.forEach((p,i)=>{p.x=0.15+ (i/parts.length)*0.7;p.prog=Math.min(1,Math.max(0,(p.x-PROC_A)/(PROC_B-PROC_A)));const y=(0.2+p.lane*0.15)*H;drawFile(p,p.x*W,p.x<PROC_A?(p.yBase*H):y,0.28,p.prog>0.9);}); }
  else frame();
}

/* ---------- mount ---------- */
let CONTENT=null;
function bindGlobalCTAs(c){
  const wa=WA(c.contact.waNumber);
  const brand=document.getElementById('nav-brand'); if(brand) brand.innerHTML=brandInner(c);
  document.getElementById('nav-wa').innerHTML=`${WAICON}<span>واتساب</span>`;
  document.getElementById('nav-wa').href=`${wa}?text=${enc('السلام عليكم، أريد أستفسر عن برنامج لشركتي')}`;
  document.getElementById('sticky-wa-link').href=`${wa}?text=${enc('السلام عليكم، أريد استشارة مجانية عن برنامج لشركتي')}`;
  applyFavicon(c);
}
function bindForm(c){
  const btn=document.getElementById('f-send'); if(!btn) return;
  btn.onclick=()=>{
    const g=id=>(document.getElementById(id)||{}).value||'';
    const n=g('f-name').trim(),co=g('f-co').trim(),tp=g('f-type'),m=g('f-msg').trim();
    let txt='السلام عليكم، أريد استشارة مجانية.\n';
    if(n)txt+='الاسم: '+n+'\n'; if(co)txt+='الشركة: '+co+'\n';
    txt+='نوع الشغل: '+tp+'\n'; if(m)txt+='المشكلة: '+m;
    window.open(WA(c.contact.waNumber)+'?text='+enc(txt),'_blank');
  };
}
function bindProofGalleries(c){
  document.querySelectorAll('.proof-shot.has-img').forEach(el=>{
    el.onclick=()=>{
      const p=c.proof.items[+el.dataset.proj];
      if(p && p.images && p.images.length) LB.open(p.title,p.tag,p.images,0);
    };
  });
}
/* ---------- MOTION (GSAP cinematic, graceful fallback) ---------- */
function reveal(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = window.gsap && window.ScrollTrigger;

  // Fallback: لا GSAP أو حركة مخفّضة → CSS reveal البسيط
  if(!hasGSAP || reduce){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.rv').forEach((el,i)=>{el.style.transitionDelay=(Math.min(i%6,5)*55)+'ms';io.observe(el);});
    if(reduce) document.querySelectorAll('[data-count]').forEach(el=>el.textContent=el.dataset.count+(el.dataset.suffix||''));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('gsap-on');
  // عناصر الـ rv تبدأ مخفية (GSAP يتحكم) — نلغي CSS transition تجنّب التضارب
  gsap.set('.rv',{opacity:0,y:24,clearProps:'transition'});

  // 1) دخول الهيرو — timeline سينمائي عند التحميل (بدون scroll)
  const heroEls=document.querySelectorAll('.hero .rv');
  if(heroEls.length){
    gsap.timeline({defaults:{ease:'power3.out'}})
      .to(heroEls,{opacity:1,y:0,duration:0.9,stagger:0.09,delay:0.15});
  }

  // 2) عناوين الأقسام كلمة-كلمة (h2.sec فقط)
  document.querySelectorAll('h2.sec').forEach(h=>{
    if(h.closest('.hero')) return;
    const words=h.textContent.trim().split(/\s+/);
    h.innerHTML=words.map(w=>`<span class="gw" style="display:inline-block">${w}</span>`).join(' ');
    h.classList.remove('rv'); gsap.set(h,{opacity:1});
    gsap.from(h.querySelectorAll('.gw'),{
      opacity:0,y:'0.5em',rotateX:-40,transformOrigin:'50% 100%',duration:0.7,ease:'power3.out',stagger:0.05,
      scrollTrigger:{trigger:h,start:'top 86%',once:true}
    });
  });

  // 3) بقية عناصر rv — دخول مع scroll، stagger ذكي حسب المجموعة (نفس الأب)
  const groups=new Map();
  document.querySelectorAll('.rv:not(.hero .rv)').forEach(el=>{
    if(el.closest('.hero')) return;
    const key=el.parentElement;
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(el);
  });
  groups.forEach(els=>{
    gsap.to(els,{
      opacity:1,y:0,duration:0.7,ease:'power2.out',stagger:0.08,
      scrollTrigger:{trigger:els[0],start:'top 88%',once:true}
    });
  });

  // 4) counter للأرقام
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target=+el.dataset.count, suf=el.dataset.suffix||'';
    const o={v:0};
    ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>{
      gsap.to(o,{v:target,duration:1.4,ease:'power2.out',onUpdate:()=>{el.textContent=Math.round(o.v)+suf;}});
    }});
  });

  // 5) parallax خفيف — الـ pill والشبكة الخلفية
  const pill=document.querySelector('.hero .pill');
  if(pill) gsap.to(pill,{yPercent:-30,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:0.6}});

  ScrollTrigger.refresh();
}
async function mount(){
  const c=await loadContent(); CONTENT=c;
  document.getElementById('app').innerHTML=[
    heroHTML(c),painHTML(c),baHTML(c),servicesHTML(c),offerHTML(c),
    proofHTML(c),teamHTML(c),processHTML(c),whyHTML(c),startHTML(c),faqHTML(c),footerHTML(c)
  ].join('');
  bindGlobalCTAs(c); bindForm(c); LB.init(); bindProofGalleries(c); reveal(); initHeroFlow();
}
mount();
