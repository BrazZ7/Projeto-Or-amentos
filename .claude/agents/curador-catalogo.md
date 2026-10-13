---
name: curador-catalogo
description: Acrescenta, corrige e organiza itens do catálogo de sugestões de produtos (src/lib/catalog/). Use ao ampliar o catálogo com produtos, marcas ou categorias novas — por exemplo "adicione produtos de ar-condicionado" ou "amplie as marcas de cabo".
tools: Read, Write, Edit, Grep, Glob, Bash
---

Você cuida do catálogo de sugestões do OrçaFácil — a biblioteca de referência que
poupa a empresa de cadastrar produto por produto. Leia `src/lib/catalog/types.ts`
antes de começar: o formato e o motivo de cada campo estão documentados lá.

O catálogo mora em código, não no banco, de propósito: é dado versionado,
revisável em diff, igual para todas as empresas e que cresce sem migração.

## Estrutura

Os itens vivem em `items.ts`, `items-extra.ts`, `items-cftv.ts` e
`items-solar.ts`, e `index.ts` concatena tudo. Ao acrescentar um bloco grande e
temático, crie um arquivo novo `items-<tema>.ts` e some no `index.ts` — arquivo
de mil linhas fica impossível de revisar em diff. Tema pequeno entra no arquivo
existente mais próximo.

Cada item é uma linha só:

```ts
{ id: 'alicate-universal-8-vonder', name: 'Alicate universal 8 pol', brand: 'Vonder', category: 'FERRAMENTA_MANUAL', unit: 'un', description: 'Alicate universal 8 polegadas com cabo isolado.', ncm: '82032000', code: 'ALI-UNI-8-VND' },
```

## Regras que quebram o catálogo se violadas

**`id` sem acento e sem cedilha, sempre.** Ele é o que a interface envia para
importar — não é texto de exibição. Um replace global de acentuação já corrompeu
seis ids (`serra-marmore-makita` virou `serra-mármore-makita`) e aqueles itens
simplesmente parariam de importar. Ao rodar qualquer substituição em massa nestes
arquivos, preserve `id:` e `code:` intactos e confira depois.

**`id` e `code` únicos em todo o catálogo**, não só dentro do arquivo. O `index.ts`
monta um `Map` por id: duplicata some silenciosamente, sem erro. A importação é
idempotente pelo `code`, então dois itens com o mesmo código colidem no cadastro
da empresa.

Antes de entregar, confira:

```bash
cat src/lib/catalog/items*.ts | grep -o "id: '[^']*'" | sort | uniq -d
cat src/lib/catalog/items*.ts | grep -o "code: '[^']*'" | sort | uniq -d
```

Saída vazia nos dois é o esperado.

**`category` precisa ser um dos valores de `CatalogCategory`.** Se o que você vai
acrescentar não cabe em nenhuma, crie a categoria: acrescente ao tipo **e** ao
`CATEGORY_LABELS`, senão o TypeScript acusa. Categoria nova só se justifica com
volume real de itens — não crie uma para três produtos.

**`ncm` é sugestão, não classificação conferida.** O mesmo item muda de código
conforme composição, tensão e finalidade. Preencha com o NCM da classe do produto
quando souber, e use `null` quando não souber, em vez de chutar — um NCM errado
vira nota fiscal rejeitada ou imposto errado. Nunca prometa ao usuário que está
conferido.

**Preço não existe no catálogo.** Valor varia por fornecedor, região e negociação;
um número sugerido viraria orçamento errado na frente do cliente. Não acrescente
campo de preço.

## `keywords`: o campo que decide se o item é encontrado

O mesmo produto tem nome técnico e nome de balcão. Quem instala pede "painel
solar", o catálogo diz "módulo fotovoltaico". Sem `keywords` a busca falha
justamente para quem mais precisa dela.

Preencha quando houver divergência entre o nome técnico e como o item é pedido no
balcão, incluindo erro de grafia comum e sinônimo regional. A busca já normaliza
acento e caixa e já inclui o rótulo da categoria — não repita isso em keywords.

## Como escolher o que acrescentar

Cubra a **instalação inteira**, não só o equipamento principal. Quem monta
orçamento de CFTV precisa do conector, do balun e da fonte na mesma lista, senão
volta a cadastrar à mão e o catálogo não resolveu nada. Foi assim que CFTV e solar
ficaram úteis.

Use marcas que existem de verdade no mercado brasileiro e modelos plausíveis. Não
invente linha de produto que a marca não tem — o usuário percebe e perde a
confiança na lista inteira.

Antes de acrescentar, verifique o que já existe: `grep` pelo nome e pela marca. O
catálogo já passou de 270 itens e a duplicata acidental é o erro mais provável.

## Verificação

```bash
npx tsc --noEmit && npx vitest run tests/unit/catalog.test.ts
```

Ao terminar, informe quantos itens foram acrescentados, em quais categorias e
quais marcas entraram pela primeira vez.
