import fs from 'node:fs';

const required = [
  'public/index.html', 'public/site.css', 'public/studio-v5.css', 'public/nexacore-v6.css', 'public/site.js',
  'public/vendor/gsap.min.js', 'public/vendor/ScrollTrigger.min.js',
  'public/admin/index.html', 'public/admin.js', 'public/admin-uiux.css', 'public/admin-uiux.js',
  'public/admin-upload-r2.js', 'public/admin-publish-click.js', 'public/admin-partners-force.js',
  'public/docpdf/index.html', 'docs/UI_UX_AUDIT.md'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}

const html = fs.readFileSync('public/index.html', 'utf8');
const css = fs.readFileSync('public/site.css', 'utf8');
const js = fs.readFileSync('public/site.js', 'utf8');
const studioCss = fs.readFileSync('public/studio-v5.css', 'utf8');
const nexacoreCss = fs.readFileSync('public/nexacore-v6.css', 'utf8');
const adminHtml = fs.readFileSync('public/admin/index.html', 'utf8');
const adminJs = fs.readFileSync('public/admin.js', 'utf8');
const adminUxJs = fs.readFileSync('public/admin-uiux.js', 'utf8');
const uploadJs = fs.readFileSync('public/admin-upload-r2.js', 'utf8');
const docpdf = fs.readFileSync('public/docpdf/index.html', 'utf8');

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
  ['html lang', /<html[^>]*lang="ar"/i.test(html)],
  ['rtl direction', /dir="rtl"/i.test(html)],
  ['site stylesheet', /href="\/site\.css(?:\?[^\"]*)?"/i.test(html)],
  ['site script', /src="\/site\.js(?:\?[^\"]*)?"/i.test(html)],
  ['services section', /id="services"/i.test(html)],
  ['websites section', /id="websites"/i.test(html)],
  ['systems section', /id="systems"/i.test(html)],
  ['work section', /id="work"/i.test(html)],
  ['contact section', /id="contact"/i.test(html)],
  ['studio stylesheet', /href="\/studio-v5\.css(?:\?[^\"]*)?"/i.test(html) && studioCss.length > 10000],
  ['v6 visual language', /href="\/nexacore-v6\.css(?:\?[^\"]*)?"/i.test(html) && nexacoreCss.length > 15000],
  ['v6 luminous hero', /class="hero-rays"/.test(html) && /\.hero-rays/.test(nexacoreCss)],
  ['self-hosted gsap', /src="\/vendor\/gsap\.min\.js/.test(html) && /src="\/vendor\/ScrollTrigger\.min\.js/.test(html)],
  ['interactive capabilities', /class="[^"]*capability-console[^"]*"/i.test(html) && /selectCapability/.test(js)],
  ['currency toggle', /data-currency="IQD"/i.test(html) && /data-currency="USD"/i.test(html)],
  ['new whatsapp number', /9647804228066/.test(html) && !/9647708111744/.test(html)],
  ['mobile app dock', /class="mobile-app-dock"/i.test(html)],
  ['currency behavior', /price-card\[data-iqd\]\[data-usd\]/.test(js)],
  ['css content', css.length > 10000],
  ['js content', js.length > 500]
  ,['admin control ids preserved', adminIds.every(id => new RegExp(`id=["']${id}["']`).test(adminHtml))]
  ,['all section builders preserved', sectionBuilders.every(id => new RegExp(`B\\.${id}\\s*=`).test(adminJs))]
  ,['admin state keys preserved', frozenStateKeys.every(key => adminJs.includes(key) || adminHtml.includes(key))]
  ,['same import export nodes moved', /menu\.append\(importButton, exportButton\)/.test(adminUxJs)]
  ,['advanced blocks preserved', ['text','divider','image','callout'].every(type => fs.readFileSync('public/admin-publish-click.js','utf8').includes(`'${type}'`))]
  ,['upload api preserved', adminJs.includes('/api/upload-image') && uploadJs.includes('/api/content')]
  ,['document studio state preserved', docpdf.includes("S='nas_docpdf_clear_v4'")]
  ,['gate controls preserved', ['gate-pass','gate-go','gate-err'].every(id => new RegExp(`id=["']${id}["']`).test(adminHtml))]
];
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) throw new Error(`Validation failed: ${failed.map(([n]) => n).join(', ')}`);
console.log(`lint:ok (${checks.length} checks)`);
