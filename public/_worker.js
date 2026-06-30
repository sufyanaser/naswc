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
          element.append('\n<link rel="stylesheet" href="/team-orbit.css" data-nas-team-orbit="base">\n<link rel="stylesheet" href="/team-orbit-polish.css" data-nas-team-orbit="polish">', { html: true });
        }
      })
      .transform(response);
  }
};
