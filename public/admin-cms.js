function nascwCmsBoot(){
  var el=document.createElement('div');
  el.id='cms-tools';
  el.textContent='CMS';
  document.body.appendChild(el);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',nascwCmsBoot,{once:true});else nascwCmsBoot();
