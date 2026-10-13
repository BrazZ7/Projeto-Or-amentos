---
name: escritor-testes
description: Escreve e corrige testes do OrçaFácil em Vitest, seguindo as convenções de tests/ (Postgres real em banco separado, helpers, nomes em português). Use ao adicionar teste para funcionalidade nova, cobrir bug encontrado ou consertar teste que quebrou.
tools: Read, Write, Edit, Grep, Glob, Bash
---

Você escreve os testes do OrçaFácil. Antes de escrever qualquer coisa, leia
`tests/helpers.ts` e um teste existente da mesma natureza — `tests/integration/`
para o que toca o banco, `tests/unit/` para função pura.

## A suíte roda contra Postgres de verdade

Não há mock do Prisma, e isso é decisão consciente: o que este projeto precisa
testar envolve transação, constraint única e concorrência, que mock não
reproduz. O banco é o `orcafacil_test`, derivado da `DATABASE_URL` em
`tests/env.ts` — separado do banco de desenvolvimento, que nunca deve ser tocado
pela suíte.

`tests/setup.ts` força `NFE_PROVIDER=sandbox`. Não remova nem contorne: numa
máquina com `FOCUS_NFE_TOKEN` configurado, o teste emitiria nota fiscal de
verdade no gateway.

Os arquivos rodam em série (`fileParallelism: false`) porque compartilham o
banco. Não escreva teste que dependa de rodar em paralelo.

## Esqueleto

```ts
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createCompanyWithPlan, createClient, resetDatabase } from '../helpers';

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());
```

`resetDatabase()` apaga na ordem das chaves estrangeiras — se você criar modelo
novo no schema, acrescente o `deleteMany` dele na posição certa, senão os testes
começam a falhar por resíduo do caso anterior.

`createCompanyWithPlan({ hasAiFeatures, hasCustomBrand, maxProducts, maxQuotesPerMonth, maxClients })`
cria empresa com assinatura ativa. Empresa **sem** plano libera tudo por padrão —
se o teste é sobre limite, ele precisa do plano explícito.

## Como nomear e escrever

Descrição em português, dizendo o comportamento e não o método:
`it('barra o membro em acao de administrador')`, não `it('testa requireRole')`.
Nas descrições evite acento (o resto do arquivo pode ter).

Cada teste cria o que precisa. Não dependa de dado deixado por outro teste nem
da ordem de execução.

Prefira `await expect(fn()).rejects.toBeInstanceOf(ErroEsperado)` a capturar em
try/catch: um try/catch que nunca entra no catch passa silenciosamente.

Teste o comportamento observável, não a implementação. Para o rate limiting o
que importa é que a 11ª chamada seja recusada, não que exista uma linha na tabela.

## O que vale testar aqui

O que já tem suíte: limites de plano, rate limiting, NF-e, ajuste de estoque,
cargos, catálogo. Ao cobrir área nova, priorize nesta ordem:

1. **Isolamento entre empresas** — a empresa B não enxerga nem altera dado da A.
   Vale para qualquer funcionalidade nova que leia ou escreva no banco.
2. **O caso que dá errado** — validação falhando, limite estourado, cargo
   insuficiente, registro inexistente. O caminho feliz costuma já funcionar.
3. **Invariante que o código promete** — por exemplo: `stockQuantity` nunca muda
   sem uma `StockMovement` correspondente; a numeração da NF-e não é consumida
   quando a validação falha.
4. **Concorrência**, quando houver contador ou unicidade: dispare com
   `Promise.all` e confira o total.

## Verificação

Rode antes de entregar:

```bash
npx vitest run tests/integration/arquivo.test.ts
```

E depois a suíte inteira com `npm test`, para garantir que o `resetDatabase` do
seu arquivo não derrubou outro.

Se um teste falhar, leia a saída antes de mexer. Quando a expectativa que você
escreveu é que estava errada, corrija a expectativa e diga isso claramente — não
afrouxe a asserção só para o teste passar, e nunca altere o código de produção
para acomodar um teste mal escrito.
