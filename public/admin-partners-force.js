(()=>{
  const STORE_KEY='nascw_content_v1';
  const TOKEN_KEY='nascwAdminUploadToken';
  const DEFAULT={enabled:true,kicker:'Strategic Partners',title:'Strategic Partners',sub:'Selected operational partners around NAS CodeWorks.',items:[
    {name:'BHTC for Training & Consulting',role:'Training & Consulting',bio:'Consulting and business development services for organizations.',url:'https://www.instagram.com/bhtc.firm',photo:''},
    {name:'moral.academy',role:'Media Training Academy',bio:'Media training for professionals, officials, and spokespeople with AI-enhanced skill development.',url:'https://www.instagram.com/moral.academy.1',photo:''},
    {name:'MC AGENCY',role:'Marketing & Creative Production',bio:'Digital marketing and creative production.',url:'https://www.instagram.com/multi_creatoriq',photo:''}
  ]};
  const $=s=>document.querySelector(s);
  const ce=(t,p)=>Object.assign(document.createElement(t),p||{});
  const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>';
  function toast(msg,bad){const t=$('#toast'),m=$('#toast-msg');if(!t||!m)return;m.textContent=msg;t.style.borderColor=bad?'var(--red)':'var(--green)';t.classList.add('show');clearTimeout(toast._p);toast._p=setTimeout(()=>t.classList.remove('show'),3000)}
  function read(){try{const s=localStorage.getItem(STORE_KEY);if(s)return JSON.parse(s)}catch(e){}try{return JSON.parse(JSON.stringify(window.__DEFAULT_CONTENT__||{}))}catch(e){return {}}}
  function normalize(p){p=Object.assign({},DEFAULT,p||{});if(!Array.isArray(p.items)||!p.items.length)p.items=JSON.parse(JSON.stringify(DEFAULT.items));p.items=p.items.map(x=>Object.assign({name:'',role:'',bio:'',url:'',photo:''},x||{}));return p}
  function write(partners){const c=read();c.partners=normalize(partners);c.layout=c.layout||{};if(!Array.isArray(c.layout.order))c.layout.order=['hero','pain','ba','services','offers','proof','team','process','why','start','faq'];c.layout.order=c.layout.order.filter(x=>x!=='partners');const i=c.layout.order.indexOf('faq');c.layout.order.splice(i>=0?i:c.layout.order.length,0,'partners');localStorage.setItem(STORE_KEY,JSON.stringify(c));return c}
  function field(label,value,on,big){const w=ce('div',{className:'fld'});const l=ce('label',{textContent:label});const i=ce(big?'textarea':'input');i.value=value||'';i.oninput=()=>{on(i.value)};w.append(l,i);return w}
  function btn(txt,fn,cls){const b=ce('button',{className:cls||'mini',innerHTML:txt});b.type='button';b.onclick=fn;return b}
  async function uploadImage(file){const token=localStorage.getItem(TOKEN_KEY)||'';if(!token){toast('أدخل Upload Token من الإعدادات أولاً',true);throw Error('missing token')}const fd=new FormData();fd.append('file',file);fd.append('section','partners');fd.append('group','logos');const r=await fetch('/api/upload-image',{method:'POST',headers:{'x-nascw-admin-token':token},body:fd});const j=await r.json().catch(()=>({}));if(!r.ok||!j.url)throw Error(j.error||'فشل رفع الصورة');return j.url}
  function showEditor(){
    const main=$('#main');if(!main)return;
    const c=read();let p=normalize(c.partners);write(p);
    document.querySelectorAll('#side a').forEach(x=>x.classList.remove('active'));
    const sideBtn=$('#partners-admin-entry');if(sideBtn)sideBtn.classList.add('active');
    main.innerHTML='';
    const hero=ce('div',{className:'sec-hero'});
    hero.innerHTML='<div class="sh-icon">'+icon+'</div><div><h1>الشركاء الاستراتيجيون</h1><p>تعديل قسم Strategic Partners ورفع شعارات الشركاء.</p></div>';
    main.appendChild(hero);
    const card=ce('div',{className:'card'});
    card.innerHTML='<div class="card-h"><div class="ci">'+icon+'</div><div><h2>Strategic Partners</h2><div class="hint">قسم مستقل يظهر فوق الأسئلة الشائعة مباشرة</div></div></div>';
    const body=ce('div',{className:'card-body'});
    const save=()=>{write(p);try{window.dispatchEvent(new Event('input'))}catch(e){}};
    const toggle=ce('div',{className:'toggle'+(p.enabled?' on':'')});
    toggle.innerHTML='<div class="sw"></div><div><div class="tl">تفعيل قسم الشركاء</div><div class="ts">إظهار/إخفاء القسم من الموقع</div></div>';
    toggle.onclick=()=>{p.enabled=!p.enabled;toggle.classList.toggle('on');save()};
    body.appendChild(toggle);
    body.appendChild(field('العنوان الفرعي',p.kicker,v=>{p.kicker=v;save()}));
    body.appendChild(field('العنوان',p.title,v=>{p.title=v;save()}));
    body.appendChild(field('الوصف',p.sub,v=>{p.sub=v;save()},true));
    const list=ce('div');
    function drawList(){
      list.innerHTML='';
      p.items.forEach((m,i)=>{
        const sc=ce('div',{className:'sub-card open'});
        sc.innerHTML='<div class="sc-head"><span class="sc-num">'+(i+1)+'</span><span class="sc-label">شريك</span><span class="sc-name">'+(m.name||'Partner')+'</span><div class="sc-acts"></div></div>';
        const acts=sc.querySelector('.sc-acts');
        acts.append(btn('↑',()=>{if(i>0){[p.items[i-1],p.items[i]]=[p.items[i],p.items[i-1]];save();drawList()}}));
        acts.append(btn('↓',()=>{if(i<p.items.length-1){[p.items[i+1],p.items[i]]=[p.items[i],p.items[i+1]];save();drawList()}}));
        acts.append(btn('حذف',()=>{if(confirm('حذف الشريك؟')){p.items.splice(i,1);save();drawList()}},'mini del'));
        const inner=ce('div',{className:'sc-body'});
        const photo=ce('div',{className:'fld'});photo.innerHTML='<label>شعار / صورة الشريك</label>';
        const prev=ce('div',{style:'display:flex;align-items:center;gap:12px;margin-bottom:8px'});
        function drawPhoto(){prev.innerHTML='';if(m.photo){const img=ce('img',{src:m.photo});img.style.cssText='width:72px;height:72px;border-radius:14px;object-fit:contain;background:#07101d;border:1px solid var(--line);padding:8px;filter:grayscale(1)';prev.appendChild(img);prev.appendChild(btn('حذف',()=>{m.photo='';save();drawPhoto()},'mini del'))}else{const ph=ce('div',{textContent:(m.name||'?').charAt(0)});ph.style.cssText='width:72px;height:72px;border-radius:14px;display:grid;place-items:center;border:1px solid var(--line);color:var(--fg-3);font-weight:800;background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(124,58,237,.1))';prev.appendChild(ph)}}
        drawPhoto();
        const input=ce('input',{type:'file',accept:'image/*',style:'display:none'});
        input.onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{m.photo=await uploadImage(f);save();drawPhoto();toast('تم رفع الصورة — اضغط حفظ ونشر')}catch(err){toast(err.message,true)}};
        prev.appendChild(btn('رفع صورة',()=>input.click()));photo.append(prev,input);inner.appendChild(photo);
        inner.appendChild(field('الاسم',m.name,v=>{m.name=v;const n=sc.querySelector('.sc-name');if(n)n.textContent=v||'Partner';save()}));
        inner.appendChild(field('الدور / التصنيف',m.role,v=>{m.role=v;save()}));
        inner.appendChild(field('نبذة قصيرة',m.bio,v=>{m.bio=v;save()},true));
        inner.appendChild(field('الرابط',m.url,v=>{m.url=v;save()}));
        sc.appendChild(inner);list.appendChild(sc);
      });
      list.appendChild(btn('+ إضافة شريك',()=>{p.items.push({name:'',role:'',bio:'',url:'',photo:''});save();drawList()},'add-btn'));
    }
    drawList();body.appendChild(list);card.appendChild(body);main.appendChild(card);
  }
  function inject(){
    const side=$('#side');if(!side)return;
    let a=$('#partners-admin-entry');
    if(!a){a=ce('a',{id:'partners-admin-entry',innerHTML:icon+'<span>الشركاء الاستراتيجيون</span>'});a.onclick=showEditor;const team=[...side.querySelectorAll('a')].find(x=>/فريق العمل/.test(x.textContent));if(team)team.after(a);else side.appendChild(a)}
  }
  function boot(){inject();const side=$('#side');if(side&&!side.__partnersForce){side.__partnersForce=1;new MutationObserver(inject).observe(side,{childList:true,subtree:true})}const b=$('#btn-save');if(b&&!b.__partnersForce){b.__partnersForce=1;b.addEventListener('click',()=>write(normalize(read().partners)),true)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  let n=0;const t=setInterval(()=>{boot();if(++n>120)clearInterval(t)},250);
})();
