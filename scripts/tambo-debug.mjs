import fs from 'node:fs';
import { TamboAI, advanceStream } from '@tambo-ai/typescript-sdk';

function readEnvValue(envText, key) {
  const re = new RegExp(`^${key}\\s*=\\s*(.+)\\s*$`, 'm');
  const m = envText.match(re);
  if (!m) return null;
  return m[1].trim().replace(/^['\"]|['\"]$/g, '');
}

const envText = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const apiKey = readEnvValue(envText, 'VITE_TAMBO_API_KEY');

if (!apiKey) {
  console.error('No VITE_TAMBO_API_KEY found in .env');
  process.exit(1);
}

const client = new TamboAI({ apiKey, baseURL: 'https://api.tambo.co' });

const params = {
  messageToAppend: {
    role: 'user',
    content: [{ type: 'text', text: 'hello from debug script' }],
  },
  availableComponents: [],
  clientTools: [],
};

try {
  const stream = await advanceStream(client, params, undefined);
  let i = 0;
  for await (const chunk of stream) {
    const s = JSON.stringify(chunk);
    const out = s.length > 2000 ? s.slice(0, 2000) + '…' : s;
    console.log('CHUNK', i, out);
    i++;
    if (i >= 5) break;
  }
  console.log('DONE');
} catch (e) {
  const err = e instanceof Error ? e : new Error(String(e));
  const anyErr = e;
  console.error('ERROR_NAME', anyErr?.name);
  console.error('ERROR_MESSAGE', err.message);
  if (anyErr?.status) console.error('ERROR_STATUS', anyErr.status);
  if (anyErr?.error) console.error('ERROR_BODY', JSON.stringify(anyErr.error));
  console.error('ERROR_STACK', err.stack);
  process.exit(1);
}
