export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html') || response.status !== 200) {
      return response;
    }

    return new HTMLRewriter()
      .on('head', {
        element(element) {
          element.append('\n<link rel="stylesheet" href="/team-orbit.css" data-nas-team-orbit="base">\n<link rel="stylesheet" href="/team-orbit-polish.css" data-nas-team-orbit="polish">\n<link rel="stylesheet" href="/premium-team-services.css" data-nas-premium-team-services="true">\n<link rel="stylesheet" href="/hero-workflow.css" data-nas-hero-workflow="style">\n<script src="/hero-workflow.js" defer data-nas-hero-workflow="script"></script>', { html: true });
        }
      })
      .transform(response);
  }
};
