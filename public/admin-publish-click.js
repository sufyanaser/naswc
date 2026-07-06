(()=>{
  const STORE_KEY='nascw_content_v1';
  const TOKEN_KEY='nascwAdminUploadToken';
  function toast(msg,bad){
    const t=document.querySelector('#toast'),m=document.querySelector('#toast-msg');
    if(!t||!m)return;
    m.textContent=msg;
    t.style.borderColor=bad?'var(--red)':'var(--green)';
    const s=t.querySelector('svg'); if(s)s.style.color=bad?'var(--red)':'var(--green)';
    t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),3200);
  }
  function token(){
    let v=localStorage.getItem(TOKEN_KEY)||'';
    if(!v){v=(prompt('أدخل رمز النشر')||'').trim();if(v)localStorage.setItem(TOKEN_KEY,v)}
    return v;
  }
  async function publish(){
    const raw=localStorage.getItem(STORE_KEY);
    if(!raw)throw Error('لا يوجد محتوى محفوظ للنشر');
    const tk=token(); if(!tk)throw Error('رمز النشر مفقود');
    const r=await fetch('/api/content',{method:'POST',headers:{'content-type':'application/json; charset=utf-8','x-nascw-admin-token':tk},body:raw});
    const j=await r.json().catch(()=>({}));
    if(r.status===401)localStorage.removeItem(TOKEN_KEY);
    if(!r.ok)throw Error(j.error||('فشل النشر: '+r.status));
    toast('تم الحفظ والنشر ✓');
  }
  function bind(){
    const b=document.querySelector('#btn-save');
    if(!b||b.__nascwPublishBound)return;
    b.__nascwPublishBound=true;
    b.addEventListener('click',()=>setTimeout(()=>publish().catch(e=>toast(e.message,true)),120));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  let n=0,t=setInterval(()=>{bind();if(++n>30)clearInterval(t)},250);
})();

function nascwCmsToolbarLite(){
  if(document.getElementById('cms-tools'))return;
  var root=document.getElementById('adminroot')||document.body;
  var box=document.createElement('div');
  box.id='cms-tools';
  box.style.cssText='position:fixed;left:12px;top:72px;z-index:180;width:54px;padding:8px;border:1px solid var(--line);border-radius:16px;background:rgba(15,26,46,.94);display:flex;flex-direction:column;gap:8px';
  ['T','—','▧','!'].forEach(function(label){
    var b=document.createElement('button');
    b.type='button';
    b.textContent=label;
    b.style.cssText='width:38px;height:38px;border-radius:11px;border:1px solid var(--line-soft);background:var(--panel-3);color:var(--fg-2);font-weight:800;cursor:pointer';
    b.onclick=function(){alert('Custom Blocks foundation: '+label);};
    box.appendChild(b);
  });
  root.appendChild(box);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',nascwCmsToolbarLite,{once:true});else nascwCmsToolbarLite();
