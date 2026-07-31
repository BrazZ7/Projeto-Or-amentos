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

## Configuração

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
