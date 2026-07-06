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

function nascwCmsToast(msg){
  var t=document.querySelector('#toast'),m=document.querySelector('#toast-msg');
  if(!t||!m)return console.log(msg);
  m.textContent=msg;
  t.classList.add('show');
  clearTimeout(nascwCmsToast.t);
  nascwCmsToast.t=setTimeout(function(){t.classList.remove('show')},2600);
}
function nascwCmsSection(){
  try{return typeof CUR!=='undefined'&&CUR?CUR:'hero'}catch(e){return'hero'}
}
function nascwCmsContent(){
  try{
    if(typeof C==='undefined'||!C)return null;
    if(!C.customBlocks)C.customBlocks={};
    return C;
  }catch(e){return null}
}
function nascwCmsBlock(type){
  var id='cb_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
  var b={id:id,type:type,visible:true,order:0,stylePreset:'default',hoverPreset:'none',data:{}};
  if(type==='text')b.data={dir:'rtl',text:'نص جديد'};
  if(type==='divider')b.data={preset:'thin'};
  if(type==='image')b.data={url:'',alt:'',caption:'',ratio:'16x9'};
  if(type==='callout')b.data={title:'ملاحظة',body:'نص الملاحظة'};
  return b;
}
function nascwCmsAdd(type){
  var c=nascwCmsContent();
  if(!c){nascwCmsToast('المحتوى غير جاهز بعد');return;}
  var sec=nascwCmsSection();
  if(!Array.isArray(c.customBlocks[sec]))c.customBlocks[sec]=[];
  var b=nascwCmsBlock(type);
  b.order=c.customBlocks[sec].length;
  c.customBlocks[sec].push(b);
  try{if(typeof save==='function')save(true)}catch(e){}
  nascwCmsDrawCount();
  nascwCmsToast('تمت إضافة بلوك إلى '+sec);
}
function nascwCmsDrawCount(){
  var main=document.getElementById('main');
  if(!main)return;
  var old=document.getElementById('cms-block-summary');
  if(old)old.remove();
  var c=nascwCmsContent();
  if(!c)return;
  var sec=nascwCmsSection();
  var count=Array.isArray(c.customBlocks[sec])?c.customBlocks[sec].length:0;
  var box=document.createElement('div');
  box.id='cms-block-summary';
  box.style.cssText='grid-column:1/-1;margin-top:12px;border:1px solid rgba(0,212,255,.22);border-radius:12px;padding:12px;background:rgba(0,212,255,.045);color:var(--fg-2);font-size:13px';
  box.textContent='Custom Blocks foundation — '+sec+' — عدد البلوكات: '+count;
  var card=main.querySelector('.card');
  if(card)card.after(box);else main.appendChild(box);
}
function nascwCmsToolbarLite(){
  if(document.getElementById('cms-tools'))return;
  var root=document.getElementById('adminroot')||document.body;
  var box=document.createElement('div');
  box.id='cms-tools';
  box.style.cssText='position:fixed;left:12px;top:72px;z-index:180;width:54px;padding:8px;border:1px solid var(--line);border-radius:16px;background:rgba(15,26,46,.94);display:flex;flex-direction:column;gap:8px';
  [['text','T'],['divider','—'],['image','▧'],['callout','!']].forEach(function(pair){
    var b=document.createElement('button');
    b.type='button';
    b.textContent=pair[1];
    b.title='Add '+pair[0]+' block';
    b.style.cssText='width:38px;height:38px;border-radius:11px;border:1px solid var(--line-soft);background:var(--panel-3);color:var(--fg-2);font-weight:800;cursor:pointer';
    b.onclick=function(){nascwCmsAdd(pair[0])};
    box.appendChild(b);
  });
  root.appendChild(box);
}
function nascwCmsBoot(){
  nascwCmsToolbarLite();
  setInterval(function(){nascwCmsToolbarLite();nascwCmsDrawCount()},1400);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',nascwCmsBoot,{once:true});else nascwCmsBoot();
