import { readFileSync } from 'fs';
import path from 'path';

/**
 * Le a DATABASE_URL do .env e devolve a do banco de teste.
 *
 * O Vitest nao carrega .env sozinho como o Next faz, e derivar a URL em vez de
 * pedir uma variavel nova faz a suite rodar em qualquer maquina que ja consiga
 * rodar a aplicacao.
 */
export function testDatabaseUrl() {
  let base = process.env.DATABASE_URL;

  if (!base) {
    try {
      const env = readFileSync(path.join(process.cwd(), '.env'), 'utf8');
      base = env.match(/^DATABASE_URL\s*=\s*"?([^"\n\r]+)"?/m)?.[1];
    } catch {
      // sem .env — cai no erro abaixo
    }
  }

  if (!base) {
    throw new Error(
      'DATABASE_URL nao encontrada. Defina a variavel ou crie o .env antes de rodar os testes.',
    );
  }

  // Troca apenas o nome do banco, preservando usuario, host, porta e query.
  return base.replace(/\/([^/?]+)(\?|$)/, '/orcafacil_test$2');
}
