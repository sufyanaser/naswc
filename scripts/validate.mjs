import fs from 'node:fs';

const required = ['public/index.html', 'public/site.css', 'public/studio-v5.css', 'public/site.js'];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}

const html = fs.readFileSync('public/index.html', 'utf8');
const css = fs.readFileSync('public/site.css', 'utf8');
const js = fs.readFileSync('public/site.js', 'utf8');
const studioCss = fs.readFileSync('public/studio-v5.css', 'utf8');

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
  ['interactive capabilities', /class="[^"]*capability-console[^"]*"/i.test(html) && /selectCapability/.test(js)],
  ['currency toggle', /data-currency="IQD"/i.test(html) && /data-currency="USD"/i.test(html)],
  ['new whatsapp number', /9647804228066/.test(html) && !/9647708111744/.test(html)],
  ['mobile app dock', /class="mobile-app-dock"/i.test(html)],
  ['currency behavior', /price-card\[data-iqd\]\[data-usd\]/.test(js)],
  ['css content', css.length > 10000],
  ['js content', js.length > 500]
];
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) throw new Error(`Validation failed: ${failed.map(([n]) => n).join(', ')}`);
console.log(`lint:ok (${checks.length} checks)`);
