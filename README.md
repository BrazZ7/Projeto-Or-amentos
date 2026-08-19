# OrcaFacil — SaaS de orçamentos profissionais em PDF

Plataforma multiempresa (multi-tenant) para criação, personalização e envio de
orçamentos profissionais em PDF, com geração assistida por IA, link público de
aprovação e painel de acompanhamento.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **PostgreSQL** + **Prisma ORM**
- **NextAuth** (autenticação por credenciais, sessão JWT)
- **@react-pdf/renderer** (geração de PDF, 4 modelos: clássico, moderno, proposta comercial e formal)
- **Anthropic Claude** (recursos de IA: melhorar/corrigir textos, gerar descrições, montar orçamento a partir de texto livre)
- **Nodemailer** (confirmação de e-mail, recuperação de senha, envio de orçamentos)
- **Stripe** (assinaturas recorrentes — scaffolding, requer chaves próprias)

## Arquitetura multi-tenant

Cada empresa cadastrada é um `Company` (tenant). Usuários (`User`) pertencem a
uma empresa. Todos os dados operacionais — clientes, produtos, orçamentos —
possuem `companyId` e **toda consulta do lado do servidor filtra por esse
campo** a partir da sessão autenticada (`requireSession()` em
`src/lib/session.ts`), o que garante isolamento total entre empresas. Nenhuma
rota aceita um `companyId` vindo do cliente.

## Rodar localmente com Docker (mais simples)

Só precisa ter o [Docker Desktop](https://www.docker.com/products/docker-desktop/)
instalado. Não precisa instalar Node nem Postgres na máquina.

1. Clone o repositório e entre na pasta:
   ```bash
   git clone https://github.com/BrazZ7/projeto-or-amentos.git
   cd projeto-or-amentos
   git checkout claude/saas-orcamentos-pdf-w7edha
   ```
2. (Opcional) copie `.env.example` para `.env` e preencha `ANTHROPIC_API_KEY`
   se quiser testar os recursos de IA. Sem isso, tudo o mais funciona normalmente.
3. Suba tudo com um comando:
   ```bash
   docker compose up --build
   ```
   Na primeira vez isso baixa as imagens, builda a aplicação, sobe o Postgres,
   roda as migrações e popula os planos automaticamente — pode levar alguns
   minutos.
4. Acesse `http://localhost:3000`.

**Usuário de teste** (criado automaticamente pelo seed, já com e-mail
confirmado — não precisa cadastrar nada):

- E-mail: `demo@orcafacil.com`
- Senha: `Demo@1234`

Ele já vem com uma empresa de demonstração e um plano Starter em teste. Se
preferir, também dá pra criar sua própria conta pela tela de cadastro.

Como o SMTP não está configurado por padrão, o link de confirmação de e-mail
(no cadastro) e o de recuperação de senha aparecem no terminal onde você rodou
`docker compose up` (procure por "E-mail não enviado (SMTP não configurado)").

Para parar: `Ctrl+C` e depois `docker compose down` (adicione `-v` para também
apagar os dados do banco).

## Configuração manual (sem Docker)

1. Copie `.env.example` para `.env` e preencha as variáveis (banco de dados,
   NextAuth, SMTP, Anthropic, Stripe conforme necessário).
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode as migrações e o seed (planos padrão: Grátis, Starter, Profissional):
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação estará disponível em `http://localhost:3000`.

### Rodar em outra porta

Se a 3000 já estiver ocupada, defina `PORT` no `.env` (que não vai para o
repositório):

```bash
PORT="3001"
```

Ajuste também `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` para a mesma porta, senão
os links de login e de aprovação de orçamento vão apontar para o lugar errado.
Uma variável de ambiente `PORT` no shell tem precedência sobre o `.env`, útil
para uma execução pontual:

```bash
PORT=3005 npm run dev
```

No Docker o equivalente é `APP_HOST_PORT` (veja `docker-compose.yml`).

## Testes

```bash
npm test
```

A suíte usa Vitest e cobre catálogo, formatação, resolução de imagem do PDF,
limites de plano, gate de IA, rate limiting e o fluxo de NF-e.

Os testes de integração precisam de um Postgres e criam um banco próprio
(`orcafacil_test`), derivado da `DATABASE_URL` trocando apenas o nome — o banco
de desenvolvimento não é tocado. As migrações são aplicadas automaticamente
antes da execução.

A emissão de NF-e roda sempre no provedor de teste: a suíte força
`NFE_PROVIDER=sandbox`, então uma máquina com `FOCUS_NFE_TOKEN` configurado não
envia nota de verdade ao rodar os testes.

## Deploy na Vercel

O projeto está pronto para deploy na Vercel (o `npm run build` já roda
`prisma generate`, `prisma migrate deploy` e `prisma db seed` automaticamente).

1. **Banco de dados**: crie um Postgres gratuito, por exemplo em
   [neon.tech](https://neon.tech) ou [supabase.com](https://supabase.com), e copie a
   connection string (use a variante com `sslmode=require`, se oferecida).
2. Em [vercel.com](https://vercel.com), faça login com sua conta GitHub e clique em
   **Add New → Project**, selecionando o repositório `BrazZ7/projeto-or-amentos` e o
   branch com o código (`claude/saas-orcamentos-pdf-w7edha` ou o branch para onde ele
   for mesclado).
3. Antes de clicar em **Deploy**, configure as variáveis de ambiente do projeto
   (aba *Environment Variables*):
   - `DATABASE_URL` — a connection string do passo 1
   - `NEXTAUTH_SECRET` — gere com `openssl rand -base64 32`
   - `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` — a URL que a Vercel vai atribuir ao
     projeto (ex: `https://seu-projeto.vercel.app`); dá para editar depois do
     primeiro deploy e fazer um redeploy
   - `ANTHROPIC_API_KEY` — opcional, habilita os recursos de IA
   - `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`/`SMTP_FROM` — opcional; sem
     isso, os e-mails de confirmação/recuperação só aparecem nos **Runtime Logs** do
     projeto na Vercel (Functions → Logs), o que é suficiente para testar o fluxo
   - `STRIPE_*` — opcional, só necessário para testar assinaturas de verdade
4. Clique em **Deploy**.
5. Depois do primeiro deploy, ative o **Vercel Blob** (aba *Storage* → *Create
   Database* → *Blob* → conectar ao projeto) para que o upload de logotipo,
   assinatura e imagens de produto funcione — a Vercel injeta a variável
   `BLOB_READ_WRITE_TOKEN` automaticamente e a rota `/api/upload` já usa o Blob
   quando essa variável existe (sem ela, cai para disco local, que não persiste em
   produção). Depois de conectar o Blob, faça um redeploy.

Com isso o app fica acessível por uma URL pública para teste completo do fluxo:
cadastro → confirmação de e-mail (via logs, se SMTP não configurado) → login →
empresa/clientes/produtos → orçamento → PDF → link público de aprovação.

## Funcionalidades implementadas

- Cadastro de empresa + usuário owner, confirmação de e-mail, login, recuperação de senha.
- Cadastro completo da empresa: dados fiscais (CPF/CNPJ), contatos, endereço,
  logotipo, assinatura, cores de marca, fonte, dados bancários/PIX.
- Configurações de documento: modelo de PDF, posição da logomarca, cabeçalho/rodapé,
  prefixo de numeração, validade padrão e textos padrão (pagamento, entrega, garantia, observações).
- Cadastro de clientes (pessoa física/jurídica) e produtos/serviços (com imagem, categoria, unidade, preço, custo, garantia).
- Criação de orçamentos com numeração sequencial por empresa, itens com produto do catálogo ou personalizados,
  cálculo automático de subtotal/desconto/frete/total, condições comerciais e modelo de PDF por orçamento.
- Recursos de IA (requer `ANTHROPIC_API_KEY`): melhorar, corrigir, profissionalizar e resumir textos;
  gerar descrição de produto; gerar condições de pagamento e observações comerciais;
  montar um rascunho de orçamento completo a partir de um pedido em texto livre.
- Geração de PDF em 4 modelos (clássico, moderno, proposta comercial, formal), com identidade visual da empresa.
- Fluxo de status do orçamento: rascunho → enviado → visualizado → aprovado/recusado/vencido/cancelado.
- Link público (`/orcamento/[token]`) para o cliente visualizar, baixar o PDF, aprovar ou recusar — sem necessidade de login.
- Envio do orçamento por e-mail (PDF anexado + link público) e compartilhamento via WhatsApp.
- Painel administrativo com total de orçamentos, valor aprovado, taxa de conversão, clientes recentes e orçamentos a vencer.
- Plano e assinatura: limites de uso por plano (orçamentos/mês, clientes, produtos, usuários), aplicados na criação de
  cada recurso, e checkout de assinatura via Stripe (requer chaves configuradas).

## Estrutura de pastas

```
prisma/schema.prisma        Esquema completo do banco de dados
src/app/                    Rotas (App Router): landing, autenticação, dashboard, link público, API
src/components/             Componentes de UI, formulários e telas por domínio
src/lib/                    Prisma client, auth, sessão/tenant, validações (zod), cálculo de totais,
                             geração de PDF, IA, e-mail, Stripe, limites de plano
```

## Observações de produção

- O upload de imagens (`/api/upload`) grava em `public/uploads` para simplificar o
  desenvolvimento local; em produção, substitua por um provedor de armazenamento de
  objetos (S3, R2, etc.) mantendo o mesmo contrato de resposta (`{ url }`).
- Sem `SMTP_HOST` configurado, e-mails são apenas registrados no console (modo de
  desenvolvimento), para permitir testar o fluxo de autenticação sem um provedor real.

## Follow-ups conhecidos

- `npm audit` aponta CVEs pendentes em `next@14.2.x` e `nodemailer@7.x` cuja correção
  completa exige major bumps (Next 16 / Nodemailer 9) incompatíveis, hoje, com
  `next-auth@4`. Mantido na última versão patch da major atual; reavaliar o upgrade
  de major quando `next-auth` suportar Nodemailer 9 (ou ao migrar para Auth.js v5).
