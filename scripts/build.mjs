import fs from 'node:fs';
import path from 'node:path';

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });
for (const file of fs.readdirSync('public')) {
  const src = path.join('public', file);
  const dst = path.join('dist', file);
  const stat = fs.statSync(src);
  if (stat.isFile()) fs.copyFileSync(src, dst);
}
const html = fs.readFileSync('dist/index.html', 'utf8');
if (!html.includes('NAS CodeWorks')) throw new Error('Build verification failed');
console.log(`build:ok (${fs.readdirSync('dist').length} files)`);
