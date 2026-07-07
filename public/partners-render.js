(()=>{
  const esc=v=>String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const defaults={enabled:true,kicker:'Strategic Partners',title:'Strategic Partners',sub:'Selected operational partners around NAS CodeWorks.',items:[
    {name:'BHTC for Training & Consulting',role:'Training & Consulting',bio:'Consulting and business development services for organizations.',url:'https://www.instagram.com/bhtc.firm',photo:''},
    {name:'moral.academy',role:'Media Training Academy',bio:'Media training for professionals, officials, and spokespeople with AI-enhanced skill development.',url:'https://www.instagram.com/moral.academy.1',photo:''},
    {name:'MC AGENCY',role:'Marketing & Creative Production',bio:'Digital marketing and creative production.',url:'https://www.instagram.com/multi_creatoriq',photo:''}
  ]};
  function content(){try{const raw=localStorage.getItem('nascw_content_v1');if(raw)return JSON.parse(raw)}catch(e){}return window.__DEFAULT_CONTENT__||{}}
  function data(c){const p=Object.assign({},defaults,(c||{}).partners||{});if(!Array.isArray(p.items)||!p.items.length)p.items=defaults.items;p.items=p.items.map(x=>Object.assign({name:'',role:'',bio:'',url:'',photo:''},x||{}));return p}
  function initials(n){n=String(n||'Partner').trim().split(/\s+/);return (n[0]?.[0]||'P')+(n[1]?.[0]||'')}
  function style(){if(document.getElementById('nascw-partners-style'))return;const s=document.createElement('style');s.id='nascw-partners-style';s.textContent=`
.strategic-partners{padding:46px 0 42px;background:linear-gradient(180deg,transparent,rgba(15,26,46,.15),transparent)}
.strategic-partners .partners-head{max-width:760px;margin:0 auto 32px;text-align:center}
.strategic-partners .partners-head .kicker{justify-content:center;margin-inline:auto}
.strategic-partners .partners-head p{color:var(--fg-3);font-size:14px;line-height:1.75;max-width:620px;margin:0 auto}
.strategic-partners .partners-orb-grid{display:flex;justify-content:center;align-items:flex-start;gap:24px;max-width:940px;margin:0 auto;flex-wrap:wrap;min-height:190px}
.strategic-partners .partner-orb{--orb:112px;position:relative;width:var(--orb);height:var(--orb);display:flex;flex-direction:column;align-items:center;overflow:hidden;border:1px solid rgba(0,212,255,.18);border-radius:999px;background:linear-gradient(150deg,rgba(15,26,46,.88),rgba(7,16,29,.92));color:inherit;text-decoration:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 20px 42px -34px rgba(0,212,255,.48);transition:height .36s cubic-bezier(.2,.7,.2,1),border-radius .36s cubic-bezier(.2,.7,.2,1),border-color .24s ease,box-shadow .24s ease,transform .28s ease;will-change:height,border-radius,transform}
.strategic-partners .partner-orb:hover,.strategic-partners .partner-orb:focus-visible{height:174px;border-radius:999px 999px 32px 32px;border-color:rgba(0,212,255,.48);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 26px 58px -34px rgba(0,212,255,.72);transform:translateY(-4px);outline:none}
.strategic-partners .partner-orb::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 28%,rgba(0,212,255,.16),transparent 48%);opacity:.8;pointer-events:none}
.strategic-partners .partner-orb-logo{position:relative;z-index:1;width:var(--orb);height:var(--orb);min-height:var(--orb);display:grid;place-items:center;border-radius:50%;overflow:hidden}
.strategic-partners .partner-orb-logo img{width:100%;height:100%;object-fit:contain;padding:25%;filter:grayscale(1) contrast(1.04) brightness(.95);transition:filter .32s ease,transform .36s cubic-bezier(.2,.7,.2,1)}
.strategic-partners .partner-orb:hover .partner-orb-logo img,.strategic-partners .partner-orb:focus-visible .partner-orb-logo img{filter:grayscale(0) contrast(1) brightness(1);transform:scale(1.06)}
.strategic-partners .partner-orb-initials{position:absolute;inset:0;display:grid;place-items:center;color:var(--cyan);font-size:34px;font-weight:800;letter-spacing:.04em;background:linear-gradient(135deg,rgba(0,212,255,.09),rgba(124,58,237,.08));transition:transform .32s ease,letter-spacing .32s ease}
.strategic-partners .partner-orb:hover .partner-orb-initials,.strategic-partners .partner-orb:focus-visible .partner-orb-initials{transform:scale(1.04);letter-spacing:.08em}
.strategic-partners .partner-orb-info{position:relative;z-index:1;width:100%;padding:0 13px 18px;text-align:center;opacity:0;transform:translateY(10px);transition:opacity .22s ease .08s,transform .28s ease .06s;pointer-events:none}
.strategic-partners .partner-orb:hover .partner-orb-info,.strategic-partners .partner-orb:focus-visible .partner-orb-info{opacity:1;transform:translateY(0)}
.strategic-partners .partner-orb-name{display:block;color:var(--fg);font-size:13px;font-weight:700;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.strategic-partners .partner-orb-role{display:block;margin-top:5px;color:var(--cyan);font-size:11.5px;font-weight:600;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.9}
@media(max-width:760px){.strategic-partners .partners-orb-grid{gap:16px;min-height:auto}.strategic-partners .partner-orb{--orb:98px}.strategic-partners .partner-orb:hover,.strategic-partners .partner-orb:focus-visible{height:156px}}
@media(prefers-reduced-motion:reduce){.strategic-partners .partner-orb,.strategic-partners .partner-orb *{transition:none!important}}
`;document.head.appendChild(s)}
  function card(it){const logo=it.photo?'<img src="'+esc(it.photo)+'" alt="'+esc(it.name)+'" loading="lazy">':'<span class="partner-orb-initials">'+esc(initials(it.name))+'</span>';const body='<span class="partner-orb-logo">'+logo+'</span><span class="partner-orb-info"><strong class="partner-orb-name">'+esc(it.name)+'</strong><small class="partner-orb-role">'+esc(it.role)+'</small></span>';return it.url?'<a class="partner-orb rv" href="'+esc(it.url)+'" target="_blank" rel="noopener">'+body+'</a>':'<article class="partner-orb rv">'+body+'</article>'}
  function html(p){if(!p.enabled)return '';return '<section id="partners" class="strategic-partners"><div class="wrap"><div class="partners-head"><span class="kicker rv">'+esc(p.kicker)+'</span><h2 class="sec rv">'+esc(p.title)+'</h2><p class="rv">'+esc(p.sub)+'</p></div><div class="partners-orb-grid">'+p.items.map(card).join('')+'</div></div></section>'}
  function render(c){style();const p=data(c||content()),app=document.getElementById('app');if(!app)return;const old=document.getElementById('partners');if(old)old.remove();const pv=new URLSearchParams(location.search).get('preview');if(pv==='partners'){app.innerHTML=html(p);return}if(!p.enabled)return;const t=document.createElement('template');t.innerHTML=html(p).trim();const faq=document.getElementById('faq');if(faq)faq.before(t.content.firstElementChild);else app.appendChild(t.content.firstElementChild)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>render(),0),{once:true});else setTimeout(()=>render(),0);
  window.addEventListener('message',e=>{const d=e.data;if(d&&d.type==='nascw-preview-content'&&d.content)setTimeout(()=>render(d.content),0)});
})();
