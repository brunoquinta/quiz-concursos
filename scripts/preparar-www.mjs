import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(raiz, 'www');
await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });
for (const arquivo of ['index.html', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
  await cp(join(raiz, arquivo), join(www, arquivo));
}
await cp(join(raiz, 'pacotes'), join(www, 'pacotes'), { recursive: true });
