function nascwCustomEsc(value){
  return String(value==null?'':value).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]});
}
function nascwCustomSafeUrl(value){
  value=String(value||'').trim();
  if(!value)return '';
  try{
    var url=new URL(value,location.origin);
    return ['http:','https:','mailto:','tel:'].indexOf(url.protocol)>=0?value:'';
  }catch(e){return ''}
}
function nascwCustomBlockHtml(block){
  if(!block||block.visible===false)return '';
  var style=nascwCustomEsc(block.stylePreset||'default');
  var hover=nascwCustomEsc(block.hoverPreset||'none');
  var data=block.data||{};
  var cls='ncb '+style+' '+hover;
  if(block.type==='text'){
    return '<article class="'+cls+' ncb-text" dir="'+nascwCustomEsc(data.dir||'rtl')+'"><p>'+nascwCustomEsc(data.text||'')+'</p></article>';
  }
  if(block.type==='divider'){
    return '<hr class="ncb-divider '+nascwCustomEsc(data.preset||'thin')+'">';
  }
  if(block.type==='callout'){
    return '<aside class="'+cls+' ncb-callout"><h3>'+nascwCustomEsc(data.title||'')+'</h3><p>'+nascwCustomEsc(data.body||'')+'</p></aside>';
  }
  if(block.type==='image'){
    var src=nascwCustomSafeUrl(data.url||'');
    if(!src)return '';
    return '<figure class="'+cls+' ncb-image ratio-'+nascwCustomEsc(data.ratio||'16x9')+'"><img src="'+nascwCustomEsc(src)+'" alt="'+nascwCustomEsc(data.alt||'')+'" loading="lazy">'+(data.caption?'<figcaption>'+nascwCustomEsc(data.caption)+'</figcaption>':'')+'</figure>';
  }
  return '';
}
function nascwCustomBlocksRender(content){
  if(!content||!content.customBlocks)return;
  document.querySelectorAll('.nascw-custom-blocks').forEach(function(node){node.remove()});
  Object.keys(content.customBlocks).forEach(function(sectionId){
    var list=content.customBlocks[sectionId];
    if(!Array.isArray(list)||!list.length)return;
    var target=document.getElementById(sectionId)||(sectionId==='hero'?document.querySelector('header.hero'):null);
    if(!target)return;
    var html=list.slice().sort(function(a,b){return(a.order||0)-(b.order||0)}).map(nascwCustomBlockHtml).join('');
    if(!html)return;
    var wrap=document.createElement('div');
    wrap.className='nascw-custom-blocks';
    wrap.innerHTML='<div class="ncb-list">'+html+'</div>';
    target.appendChild(wrap);
  });
}
function nascwCustomBlocksStyle(){
  if(document.getElementById('nascw-custom-blocks-style'))return;
  var style=document.createElement('style');
  style.id='nascw-custom-blocks-style';
  style.textContent='.nascw-custom-blocks{margin:28px auto 0;max-width:var(--maxw);padding:0 20px}.ncb-list{display:grid;gap:14px}.ncb{border:1px solid var(--line-soft);border-radius:var(--r);background:var(--panel);overflow:hidden;transition:.22s}.ncb.highlighted{border-color:var(--cyan);background:linear-gradient(145deg,rgba(0,212,255,.08),rgba(124,58,237,.06))}.ncb.glass{background:rgba(15,26,46,.58);backdrop-filter:blur(12px)}.ncb.soft-glow:hover{box-shadow:0 18px 46px -28px rgba(0,212,255,.7)}.ncb.border-highlight:hover{border-color:var(--cyan)}.ncb.slight-lift:hover{transform:translateY(-3px)}.ncb-text{padding:22px}.ncb-text p{color:var(--fg-2);margin:0}.ncb-divider{border:0;margin:10px 0;height:1px;background:var(--line)}.ncb-divider.accent{height:2px;background:linear-gradient(90deg,var(--cyan),var(--violet))}.ncb-divider.dotted{background:none;border-top:1px dashed var(--line)}.ncb-callout{padding:20px;border-inline-start:3px solid var(--cyan)}.ncb-callout p{color:var(--fg-2)}.ncb-image{padding:14px}.ncb-image img{width:100%;border:1px solid var(--line-soft);border-radius:14px;object-fit:cover}.ncb-image.ratio-16x9 img{aspect-ratio:16/9}.ncb-image.ratio-4x3 img{aspect-ratio:4/3}.ncb-image.ratio-1x1 img{aspect-ratio:1/1}.ncb-image figcaption{font-size:13px;color:var(--fg-3);margin-top:8px}';
  document.head.appendChild(style);
}
(function(){
  nascwCustomBlocksStyle();
  var latest=null;
  window.addEventListener('message',function(event){
    var data=event.data||{};
    if(data.type==='nascw-preview-content'&&data.content){latest=data.content;setTimeout(function(){nascwCustomBlocksRender(latest)},60)}
  });
  var tries=0;
  var timer=setInterval(function(){
    tries++;
    if(latest){nascwCustomBlocksRender(latest);return}
    try{
      var raw=localStorage.getItem('nascw_content_v1');
      if(raw)nascwCustomBlocksRender(JSON.parse(raw));
      else if(window.__DEFAULT_CONTENT__)nascwCustomBlocksRender(window.__DEFAULT_CONTENT__);
    }catch(e){}
    if(tries>80)clearInterval(timer);
  },300);
})();
