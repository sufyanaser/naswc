export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html') || response.status !== 200) {
      return response;
    }

    const adminCleanup = url.pathname === '/admin' || url.pathname === '/admin.html'
      ? '\n<script>try{var k="nascw_content_v1",v=localStorage.getItem(k);if(v&&v.indexOf("data:image/")!==-1){localStorage.removeItem(k);sessionStorage.setItem("nascw_storage_cleaned","1");}}catch(e){}</script>'
      : '';

    return new HTMLRewriter()
      .on('head', {
        element(element) {
          element.append(adminCleanup + '\n<link rel="stylesheet" href="/team-orbit.css" data-nas-team-orbit="base">\n<link rel="stylesheet" href="/team-orbit-polish.css" data-nas-team-orbit="polish">\n<link rel="stylesheet" href="/premium-team-services.css" data-nas-premium-team-services="true">\n<link rel="stylesheet" href="/layout-rhythm-pass.css" data-nas-layout-rhythm="true">\n<link rel="stylesheet" href="/hero-workflow.css" data-nas-hero-workflow="style">\n<script src="/hero-workflow.js" defer data-nas-hero-workflow="script"></script>', { html: true });
        }
      })
      .transform(response);
  }
};
