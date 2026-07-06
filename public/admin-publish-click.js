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