// Sobe o servidor de desenvolvimento na porta configurada.
//
// O `next dev` só enxerga a variável PORT do ambiente real — o que está no
// .env é carregado tarde demais para decidir em qual porta o servidor escuta.
// Como o .env é o arquivo de configuração por máquina deste projeto (e está no
// .gitignore), este script lê a porta de lá e repassa via -p, no mesmo espírito
// do APP_HOST_PORT do docker-compose.yml.
//
// Precedência: PORT do ambiente > PORT do .env > 3000.

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';

const DEFAULT_PORT = 3000;
const require = createRequire(import.meta.url);

function portFromEnvFile() {
  try {
    const content = readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    const match = content.match(/^\s*PORT\s*=\s*["']?(\d+)["']?\s*$/m);
    return match ? match[1] : null;
  } catch {
    return null; // sem .env (ex: CI) — segue com o padrão
  }
}

function resolvePort() {
  const raw = process.env.PORT || portFromEnvFile();
  if (!raw) return DEFAULT_PORT;

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.warn(`PORT inválida (${raw}); usando ${DEFAULT_PORT}.`);
    return DEFAULT_PORT;
  }
  return port;
}

const port = resolvePort();
const nextBin = require.resolve('next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, 'dev', '-p', String(port)], {
  stdio: 'inherit',
  env: { ...process.env, PORT: String(port) },
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
