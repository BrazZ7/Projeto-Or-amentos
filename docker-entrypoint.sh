#!/bin/sh
set -e

echo "Aguardando o banco de dados ficar disponível..."
until npx prisma migrate deploy; do
  echo "Banco ainda não respondeu, tentando de novo em 2s..."
  sleep 2
done

echo "Aplicando dados iniciais (planos)..."
npx prisma db seed

echo "Iniciando aplicação..."
exec "$@"
