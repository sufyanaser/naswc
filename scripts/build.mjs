import fs from 'node:fs';
import path from 'node:path';

fs.rmSync('dist', { recursive: true, force: true });
fs.cpSync('public', 'dist', { recursive: true });
const html = fs.readFileSync('dist/index.html', 'utf8');
if (!html.includes('NAS CodeWorks')) throw new Error('Build verification failed');
console.log(`build:ok (${fs.readdirSync('dist').length} files)`);
