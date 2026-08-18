import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolucao nativa do tsconfig: dispensa o plugin vite-tsconfig-paths para
  // o alias @/ funcionar nos testes.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Os testes de integracao compartilham um banco e limpam tabelas entre
    // casos. Em paralelo, uma suite apagaria as linhas da outra no meio da
    // execucao.
    fileParallelism: false,
    globalSetup: ['tests/global-setup.ts'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});
