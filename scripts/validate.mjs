import fs from 'node:fs';

const required = [
  'public/index.html', 'public/style.css', 'public/app.js',
  'public/vendor/gsap.min.js', 'public/vendor/ScrollTrigger.min.js',
  'public/admin/index.html', 'public/admin.js', 'public/admin-uiux.css', 'public/admin-uiux.js',
  'public/admin-upload-r2.js', 'public/admin-publish-click.js', 'public/admin-partners-force.js',
  'public/docpdf/index.html', 'docs/UI_UX_AUDIT.md',
  'public/robots.txt', 'public/sitemap.xml'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}

const html = fs.readFileSync('public/index.html', 'utf8');
const css = fs.readFileSync('public/style.css', 'utf8');
const js = fs.readFileSync('public/app.js', 'utf8');
const adminHtml = fs.readFileSync('public/admin/index.html', 'utf8');
const adminJs = fs.readFileSync('public/admin.js', 'utf8');
const adminUxJs = fs.readFileSync('public/admin-uiux.js', 'utf8');
const uploadJs = fs.readFileSync('public/admin-upload-r2.js', 'utf8');
const docpdf = fs.readFileSync('public/docpdf/index.html', 'utf8');
const defaultContent = JSON.parse(fs.readFileSync('public/content.json', 'utf8'));

const adminIds = [
  'gate', 'gate-pass', 'gate-go', 'adminroot', 'tb-status', 'tb-status-text',
  'btn-preview', 'btn-import', 'btn-export', 'btn-save', 'side', 'main',
  'pv-divider', 'pv-panel', 'pv-dev', 'pv-reload', 'pv-open', 'pv-close',
  'pv-frame', 'file-import'
];
const sectionBuilders = [
  'brand', 'hero', 'pain', 'ba', 'services', 'offers', 'proof', 'team',
  'process', 'why', 'start', 'faq', 'contact', 'footer', 'settings'
];
const frozenStateKeys = [
  'nascw_content_v1', 'nascw_admin_pass', 'nascw_admin_ok',
  'nascwAdminUploadToken', 'nascw_pv_w'
];

const checks = [
  // --- Public marketing site (v7 — light bilingual SaaS redesign + Agent 2/3 Motion) ---
  ['default document language is Arabic', /<html[^>]*lang="ar"/i.test(html)],
  ['default direction is rtl', /<html[^>]*dir="rtl"/i.test(html)],
  ['consolidated stylesheet loaded', /href="\/style\.css(?:\?[^"]*)?"/i.test(html)],
  ['consolidated script loaded', /src="\/app\.js(?:\?[^"]*)?"/i.test(html)],
  ['no legacy patch stylesheets referenced', !/site\.css|studio-v5\.css|nexacore-v6\.css|hero-workflow\.css|team-orbit|layout-rhythm-pass|compare-focus|premium-team-services|team-photo-transparent-fix|team-final-cards/.test(html)],
  ['no legacy patch scripts referenced', !/src="\/(?:site|render|render-core|partners-render|custom-blocks-render|slideshow-polish|founder-copy-fix|header-nav-polish|copy-tone-patch|copy-tone-apply|team-four-cards)\.js/.test(html)],
  ['self-hosted gsap 3.15 and scrolltrigger loaded', /src="\/vendor\/gsap\.min\.js/.test(html) && /src="\/vendor\/ScrollTrigger\.min\.js/.test(html)],
  ['motion ownership contract wired', /__NASCW_MOTION__/.test(js) && /AGENT_2/.test(js) && /AGENT_3/.test(js) && /onIntroComplete/.test(js)],
  ['agent 3 mascot intro and skip intro wired', /id="nasIntro"/.test(html) && /id="skipIntroBtn"/.test(html) && /initAgent3IntroAndHero/.test(js)],
  ['agent 2 scrolltrigger and observer fallback wired', /\breveal\b/.test(html) && /initAgent2ScrollAndInteractions/.test(js) && /IntersectionObserver/.test(js)],
  ['reduced motion fallback supported', /prefers-reduced-motion:\s*reduce/.test(css) && /prefers-reduced-motion:\s*reduce/.test(js)],

  ['bilingual AR/EN toggle markup', /data-lang-set="ar"/.test(html) && /data-lang-set="en"/.test(html)],
  ['bilingual content pairs present', /data-lang="ar"/.test(html) && /data-lang="en"/.test(html)],
  ['bilingual toggle behavior wired', /applyLang/.test(js) && /data-lang-set/.test(js)],

  ['header section', /<header class="site-header"/i.test(html)],
  ['hero section', /class="hero"/.test(html)],
  ['core services section', /id="services"/i.test(html)],
  ['selected work section', /id="work"/i.test(html)],
  ['why nas codeworks section', /id="why"/i.test(html)],
  ['engagement process section', /id="process"/i.test(html)],
  ['contact / cta section', /id="contact"/i.test(html)],

  ['selected work status badges are honest', /is-dev/.test(html) && /is-beta/.test(html) && !/is-live/.test(html)],
  ['functional mascot assets', /nasai-coding\.png/.test(html) && /nasai-thinking\.png/.test(html)],
  ['contact email link', /mailto:info@nascw\.net/.test(html)],
  ['whatsapp business number', /9647804228066/.test(html) && !/9647708111744/.test(html)],
  ['canonical url', /rel="canonical" href="https:\/\/nascw\.net\/"/.test(html)],
  ['legal footer line preserved', /شركة الرنين للخدمات الإعلامية والرقمية والإعلانية والإنتاج الفني/.test(html)],
  ['stylesheet substantial', css.length > 10000],
  ['script content present', js.length > 500],

  // --- Admin CMS / Document Studio (frozen contracts — docs/UI_UX_AUDIT.md) ---
  ['admin control ids preserved', adminIds.every(id => new RegExp(`id=["']${id}["']`).test(adminHtml))],
  ['all section builders preserved', sectionBuilders.every(id => new RegExp(`B\\.${id}\\s*=`).test(adminJs))],
  ['admin state keys preserved', frozenStateKeys.every(key => adminJs.includes(key) || adminHtml.includes(key))],
  ['same import export nodes moved', /menu\.append\(importButton, exportButton\)/.test(adminUxJs)],
  ['advanced blocks preserved', ['text', 'divider', 'image', 'callout'].every(type => fs.readFileSync('public/admin-publish-click.js', 'utf8').includes(`'${type}'`))],
  ['upload api preserved', adminJs.includes('/api/upload-image') && uploadJs.includes('/api/content')],
  ['document studio state preserved', docpdf.includes("S='nas_docpdf_clear_v4'")],
  ['gate controls preserved', ['gate-pass', 'gate-go', 'gate-err'].every(id => new RegExp(`id=["']${id}["']`).test(adminHtml))]
];
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) throw new Error(`Validation failed: ${failed.map(([n]) => n).join(', ')}`);
console.log(`lint:ok (${checks.length} checks)`);
