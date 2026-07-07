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
.strategic-partners{padding:46px 0 38px;background:linear-gradient(180deg,transparent,rgba(15,26,46,.18),transparent)}
.strategic-partners .partners-head{max-width:760px;margin:0 auto 28px;text-align:center}
.strategic-partners .partners-head .kicker{justify-content:center;margin-inline:auto}
.strategic-partners .partners-head p{color:var(--fg-3);font-size:14px;line-height:1.75;max-width:620px;margin:0 auto}
.strategic-partners .team-grid{max-width:940px;margin:0 auto;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.strategic-partners .tm{opacity:.9;background:rgba(15,26,46,.72);text-decoration:none;color:inherit}
.strategic-partners .tm:hover{opacity:1}
.strategic-partners .tm-photo{background:linear-gradient(150deg,var(--bg-2),#0A1526);display:grid;place-items:center}
.strategic-partners .tm-photo img{object-fit:contain;padding:24%;background:radial-gradient(circle at 50% 42%,rgba(255,255,255,.05),transparent 60%);filter:grayscale(1) contrast(1.04) brightness(.95)}
.strategic-partners .tm:hover .tm-photo img{filter:grayscale(0) contrast(1) brightness(1);transform:scale(1.08)}
.strategic-partners .tm-ph{position:absolute;inset:0;display:grid;place-items:center;font-size:42px;font-weight:800;color:var(--cyan);background:linear-gradient(135deg,rgba(0,212,255,.08),rgba(124,58,237,.08))}
.strategic-partners .tm-body .url{font-size:11.5px;color:var(--fg-3);direction:ltr;text-align:left;margin-top:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:760px){.strategic-partners .team-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
  function card(it){const photo=it.photo?'<img src="'+esc(it.photo)+'" alt="'+esc(it.name)+'" loading="lazy">':'<div class="tm-ph">'+esc(initials(it.name))+'</div>';const body='<div class="tm-photo">'+photo+'</div><div class="tm-body"><div class="nm">'+esc(it.name)+'</div><div class="rl">'+esc(it.role)+'</div>'+(it.bio?'<div class="bio">'+esc(it.bio)+'</div>':'')+(it.url?'<div class="url">'+esc(it.url.replace(/^https?:\/\//,''))+'</div>':'')+'</div>';return it.url?'<a class="tm rv" href="'+esc(it.url)+'" target="_blank" rel="noopener">'+body+'</a>':'<article class="tm rv">'+body+'</article>'}
  function html(p){if(!p.enabled)return '';return '<section id="partners" class="strategic-partners"><div class="wrap"><div class="partners-head"><span class="kicker rv">'+esc(p.kicker)+'</span><h2 class="sec rv">'+esc(p.title)+'</h2><p class="rv">'+esc(p.sub)+'</p></div><div class="team-grid">'+p.items.map(card).join('')+'</div></div></section>'}
  function render(c){style();const p=data(c||content()),app=document.getElementById('app');if(!app)return;const old=document.getElementById('partners');if(old)old.remove();const pv=new URLSearchParams(location.search).get('preview');if(pv==='partners'){app.innerHTML=html(p);return}if(!p.enabled)return;const t=document.createElement('template');t.innerHTML=html(p).trim();const faq=document.getElementById('faq');if(faq)faq.before(t.content.firstElementChild);else app.appendChild(t.content.firstElementChild)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>render(),0),{once:true});else setTimeout(()=>render(),0);
  window.addEventListener('message',e=>{const d=e.data;if(d&&d.type==='nascw-preview-content'&&d.content)setTimeout(()=>render(d.content),0)});
})();
