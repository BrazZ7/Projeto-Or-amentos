-- Regera o token do link público dos orçamentos ainda não respondidos.
--
-- Antes o valor vinha de cuid(), que embute timestamp e contador e portanto é
-- adivinhável — e esta é a única rota sem autenticação do sistema. Agora o
-- token é gerado na aplicação com randomBytes(32); aqui a equivalência é feita
-- com dois gen_random_uuid(), que no core do Postgres 13+ usa o CSPRNG do
-- sistema operacional. Dois UUIDs sem hífen dão os mesmos 64 caracteres hex.
--
-- Só orçamentos NÃO respondidos são afetados. Trocar o token de um orçamento já
-- aprovado ou recusado quebraria o link que o cliente tem, sem ganho: aquele
-- registro não aceita mais decisão. Os status abaixo são exatamente os que a
-- rota de decisão recusa.
UPDATE "Quote"
SET "publicToken" =
  replace(gen_random_uuid()::text, '-', '') ||
  replace(gen_random_uuid()::text, '-', '')
WHERE "status" NOT IN ('APPROVED', 'REJECTED', 'CANCELED');
