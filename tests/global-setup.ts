import { execSync } from 'child_process';
import { testDatabaseUrl } from './env';

/**
 * Roda uma vez por execucao da suite: cria o banco de teste, se preciso, e
 * aplica as migracoes. Ficar no globalSetup evita repetir isso a cada arquivo.
 */
export default function setup() {
  const url = testDatabaseUrl();
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });
}
