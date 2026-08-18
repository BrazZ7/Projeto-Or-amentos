import { testDatabaseUrl } from './env';

// Roda em cada worker antes dos testes: o cliente Prisma le DATABASE_URL na
// primeira consulta, entao apontar para o banco de teste aqui basta.
process.env.DATABASE_URL = testDatabaseUrl();

// Forca o provedor de teste. Sem isso, uma maquina com FOCUS_NFE_TOKEN no
// ambiente mandaria notas de verdade para o gateway fiscal ao rodar a suite.
process.env.NFE_PROVIDER = 'sandbox';
