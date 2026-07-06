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
    if(window.NASCW_CMS_VALIDATE&&!window.NASCW_CMS_VALIDATE())throw Error('يوجد Custom Block غير صالح');
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

function nascwCmsToast(msg,bad){
  var t=document.querySelector('#toast'),m=document.querySelector('#toast-msg');
  if(!t||!m)return console.log(msg);
  m.textContent=msg;t.style.borderColor=bad?'var(--red)':'var(--green)';t.classList.add('show');
  clearTimeout(nascwCmsToast.t);nascwCmsToast.t=setTimeout(function(){t.classList.remove('show')},2600);
}
function nascwCmsSection(){try{return typeof CUR!=='undefined'&&CUR?CUR:'hero'}catch(e){return'hero'}}
function nascwCmsContent(){try{if(typeof C==='undefined'||!C)return null;if(!C.customBlocks)C.customBlocks={};return C}catch(e){return null}}
function nascwCmsList(sec){var c=nascwCmsContent();if(!c)return[];sec=sec||nascwCmsSection();if(!Array.isArray(c.customBlocks[sec]))c.customBlocks[sec]=[];return c.customBlocks[sec].sort(function(a,b){return(a.order||0)-(b.order||0)})}
function nascwCmsSave(){try{if(typeof save==='function')save(true)}catch(e){}}
function nascwCmsId(){return'cb_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6)}
function nascwCmsBlock(type){
  var b={id:nascwCmsId(),type:type,visible:true,order:nascwCmsList().length,stylePreset:'default',hoverPreset:'none',data:{}};
  if(type==='text')b.data={dir:'rtl',text:'نص جديد'};
  if(type==='divider')b.data={preset:'thin'};
  if(type==='image')b.data={url:'',alt:'',caption:'',ratio:'16x9'};
  if(type==='callout')b.data={title:'ملاحظة',body:'نص الملاحظة'};
  return b;
}
function nascwCmsAdd(type){var a=nascwCmsList();a.push(nascwCmsBlock(type));nascwCmsSave();nascwCmsDraw();nascwCmsToast('تمت إضافة بلوك')}
function nascwCmsInput(parent,label,value,on,big){
  var wrap=document.createElement('div');wrap.style.cssText=big?'grid-column:1/-1':'';
  var l=document.createElement('label');l.textContent=label;l.style.cssText='display:block;font-size:11px;color:var(--fg-3);margin-bottom:4px;font-weight:700';
  var el=document.createElement(big?'textarea':'input');el.value=value||'';el.style.cssText='width:100%;background:rgba(8,14,26,.75);border:1px solid var(--line);border-radius:8px;color:var(--fg);font:inherit;font-size:13px;padding:8px;min-height:'+(big?'78px':'auto');
  el.oninput=function(){on(el.value);nascwCmsSave()};wrap.appendChild(l);wrap.appendChild(el);parent.appendChild(wrap);return el;
}
function nascwCmsSelect(parent,label,value,opts,on){
  var wrap=document.createElement('div');var l=document.createElement('label');l.textContent=label;l.style.cssText='display:block;font-size:11px;color:var(--fg-3);margin-bottom:4px;font-weight:700';
  var s=document.createElement('select');s.style.cssText='width:100%;background:rgba(8,14,26,.75);border:1px solid var(--line);border-radius:8px;color:var(--fg);font:inherit;font-size:13px;padding:8px';
  opts.forEach(function(o){var op=document.createElement('option');op.value=o;op.textContent=o;if(o===value)op.selected=true;s.appendChild(op)});
  s.onchange=function(){on(s.value);nascwCmsSave()};wrap.appendChild(l);wrap.appendChild(s);parent.appendChild(wrap);return s;
}
function nascwCmsRow(b,i,sec){
  var row=document.createElement('div');row.style.cssText='border:1px solid var(--line-soft);border-radius:10px;background:var(--panel-3);margin-top:9px;overflow:hidden;opacity:'+(b.visible===false?'.45':'1');
  var head=document.createElement('div');head.style.cssText='display:flex;align-items:center;gap:6px;padding:9px 10px;border-bottom:1px solid var(--line-soft)';
  var title=document.createElement('b');title.textContent=b.type+' · '+b.id;title.style.cssText='flex:1;font-size:12px;color:var(--fg)';head.appendChild(title);
  function btn(txt,fn){var x=document.createElement('button');x.type='button';x.textContent=txt;x.style.cssText='font:inherit;font-size:11px;padding:5px 8px;border-radius:7px;border:1px solid var(--line);background:var(--panel);color:var(--fg-2);cursor:pointer';x.onclick=fn;head.appendChild(x)}
  var a=nascwCmsList(sec);
  btn(b.visible===false?'إظهار':'إخفاء',function(){b.visible=b.visible===false;nascwCmsDraw();nascwCmsSave()});
  btn('↑',function(){if(i>0){var t=a[i-1];a[i-1]=a[i];a[i]=t;a.forEach(function(x,k){x.order=k});nascwCmsDraw();nascwCmsSave()}});
  btn('↓',function(){if(i<a.length-1){var t=a[i+1];a[i+1]=a[i];a[i]=t;a.forEach(function(x,k){x.order=k});nascwCmsDraw();nascwCmsSave()}});
  btn('نسخ',function(){var c=JSON.parse(JSON.stringify(b));c.id=nascwCmsId();c.order=a.length;a.push(c);nascwCmsDraw();nascwCmsSave()});
  btn('حذف',function(){if(confirm('حذف البلوك؟')){a.splice(i,1);a.forEach(function(x,k){x.order=k});nascwCmsDraw();nascwCmsSave()}});
  row.appendChild(head);
  var edit=document.createElement('div');edit.style.cssText='padding:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px';
  nascwCmsSelect(edit,'Style',b.stylePreset||'default',['default','subtle','highlighted','glass'],function(v){b.stylePreset=v});
  nascwCmsSelect(edit,'Hover',b.hoverPreset||'none',['none','soft-glow','border-highlight','slight-lift'],function(v){b.hoverPreset=v});
  if(b.type==='text'){nascwCmsSelect(edit,'Direction',b.data.dir||'rtl',['rtl','ltr'],function(v){b.data.dir=v});nascwCmsInput(edit,'Text',b.data.text||'',function(v){b.data.text=v},true)}
  if(b.type==='divider'){nascwCmsSelect(edit,'Preset',b.data.preset||'thin',['thin','dotted','accent'],function(v){b.data.preset=v})}
  if(b.type==='image'){nascwCmsInput(edit,'Image URL',b.data.url||'',function(v){b.data.url=v},true);nascwCmsInput(edit,'Alt text',b.data.alt||'',function(v){b.data.alt=v});nascwCmsInput(edit,'Caption',b.data.caption||'',function(v){b.data.caption=v});nascwCmsSelect(edit,'Ratio',b.data.ratio||'16x9',['16x9','4x3','1x1'],function(v){b.data.ratio=v})}
  if(b.type==='callout'){nascwCmsInput(edit,'Title',b.data.title||'',function(v){b.data.title=v});nascwCmsInput(edit,'Body',b.data.body||'',function(v){b.data.body=v},true)}
  row.appendChild(edit);return row;
}
function nascwCmsDraw(){
  var main=document.getElementById('main');if(!main)return;var old=document.getElementById('cms-block-summary');if(old)old.remove();
  var sec=nascwCmsSection(),a=nascwCmsList(sec);var box=document.createElement('div');box.id='cms-block-summary';box.style.cssText='grid-column:1/-1;margin-top:12px;border:1px solid rgba(0,212,255,.22);border-radius:12px;padding:12px;background:rgba(0,212,255,.045);color:var(--fg-2);font-size:13px';
  var h=document.createElement('div');h.innerHTML='<b style="color:var(--cyan)">Custom Blocks</b> — '+sec+' — '+a.length+' بلوك';box.appendChild(h);
  if(!a.length){var e=document.createElement('div');e.textContent='لا توجد بلوكات. استخدم الشريط العمودي.';e.style.cssText='margin-top:8px;border:1px dashed var(--line);border-radius:10px;padding:10px;text-align:center;color:var(--fg-3)';box.appendChild(e)}
  a.forEach(function(b,i){box.appendChild(nascwCmsRow(b,i,sec))});var card=main.querySelector('.card');if(card)card.after(box);else main.appendChild(box);
}
function nascwCmsToolbarLite(){
  if(document.getElementById('cms-tools'))return;
  var root=document.getElementById('adminroot')||document.body,box=document.createElement('div');box.id='cms-tools';box.style.cssText='position:fixed;left:12px;top:72px;z-index:180;width:54px;padding:8px;border:1px solid var(--line);border-radius:16px;background:rgba(15,26,46,.94);display:flex;flex-direction:column;gap:8px';
  [['text','T'],['divider','—'],['image','▧'],['callout','!']].forEach(function(p){var b=document.createElement('button');b.type='button';b.textContent=p[1];b.title='Add '+p[0]+' block';b.style.cssText='width:38px;height:38px;border-radius:11px;border:1px solid var(--line-soft);background:var(--panel-3);color:var(--fg-2);font-weight:800;cursor:pointer';b.onclick=function(){nascwCmsAdd(p[0])};box.appendChild(b)});root.appendChild(box);
}
function nascwCmsValidate(){
  var c=nascwCmsContent(),bad='';if(!c)return true;Object.keys(c.customBlocks||{}).some(function(sec){var a=c.customBlocks[sec];return Array.isArray(a)&&a.some(function(b){if(b.type==='text'&&!String(b.data.text||'').trim())bad=sec+': نص فارغ';if(b.type==='image'){if(!String(b.data.url||'').trim())bad=sec+': رابط الصورة مطلوب';if(!String(b.data.alt||'').trim())bad=sec+': alt مطلوب للصورة'}return !!bad})});
  if(bad)nascwCmsToast('تعذر الحفظ: '+bad,true);return !bad;
}
window.NASCW_CMS_VALIDATE=nascwCmsValidate;
function nascwCmsBoot(){nascwCmsToolbarLite();setInterval(function(){nascwCmsToolbarLite();nascwCmsDraw()},1400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',nascwCmsBoot,{once:true});else nascwCmsBoot();
