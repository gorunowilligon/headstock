-- Headstock | Parte 3b: IDs NUMERICOS
-- Requer as Partes 1, 2 e 3. Rode UMA vez.
--
-- Converte de TEXT para INTEGER (auto-incremento):
--   "Usuario"."idUsuario"        'admin', 'u01'...'u29'  ->  1, 2, ...   (ordem de cadastro: admin = 1)
--   "Instrumento"."idInstrumento" 'cat-fender-...'        ->  1, 2, ...   (ordem: categoria, marca, modelo)
-- e todas as colunas que apontam para eles (12 chaves estrangeiras). Os relacionamentos sao preservados.
-- As demais tabelas (Anuncio, Pedido...) continuam com id TEXT (uuid); so estas duas mudam.
--
-- Depois disto, novos usuarios/instrumentos recebem o numero sozinhos (nao informe o id no INSERT).
--
-- ATENCAO: o backend atual ainda trata esses ids como texto (schema.prisma, validacoes zod, tipos do frontend).
-- Nao faca deploy do backend contra este banco antes de atualizar o codigo.

BEGIN;

-- 1) Numerar as linhas dos dois pais -----------------------------------------------------------------
-- Usuario: número novo para cada linha, numa ordem fixa
ALTER TABLE "Usuario" ADD COLUMN "idNovo" INTEGER;
UPDATE "Usuario" t SET "idNovo" = n.num
FROM (SELECT "idUsuario", row_number() OVER (ORDER BY "dataCadastro", "idUsuario") AS num FROM "Usuario") n
WHERE t."idUsuario" = n."idUsuario";
ALTER TABLE "Usuario" ALTER COLUMN "idNovo" SET NOT NULL;

-- Instrumento: número novo para cada linha, numa ordem fixa
ALTER TABLE "Instrumento" ADD COLUMN "idNovo" INTEGER;
UPDATE "Instrumento" t SET "idNovo" = n.num
FROM (SELECT "idInstrumento", row_number() OVER (ORDER BY "categoria", "marca", "modelo") AS num FROM "Instrumento") n
WHERE t."idInstrumento" = n."idInstrumento";
ALTER TABLE "Instrumento" ALTER COLUMN "idNovo" SET NOT NULL;

-- 2) Trocar cada coluna que aponta para eles (apaga a FK antiga, converte, preserva NOT NULL) ------------
-- Anuncio.idVendedor
ALTER TABLE "Anuncio" DROP CONSTRAINT "Anuncio_idVendedor_fkey";
ALTER TABLE "Anuncio" ADD COLUMN "idVendedor_novo" INTEGER;
UPDATE "Anuncio" f SET "idVendedor_novo" = p."idNovo" FROM "Usuario" p WHERE f."idVendedor" = p."idUsuario";
ALTER TABLE "Anuncio" DROP COLUMN "idVendedor";
ALTER TABLE "Anuncio" RENAME COLUMN "idVendedor_novo" TO "idVendedor";
ALTER TABLE "Anuncio" ALTER COLUMN "idVendedor" SET NOT NULL;

-- FotoAnuncio.idDono
ALTER TABLE "FotoAnuncio" DROP CONSTRAINT "FotoAnuncio_idDono_fkey";
ALTER TABLE "FotoAnuncio" ADD COLUMN "idDono_novo" INTEGER;
UPDATE "FotoAnuncio" f SET "idDono_novo" = p."idNovo" FROM "Usuario" p WHERE f."idDono" = p."idUsuario";
ALTER TABLE "FotoAnuncio" DROP COLUMN "idDono";
ALTER TABLE "FotoAnuncio" RENAME COLUMN "idDono_novo" TO "idDono";
ALTER TABLE "FotoAnuncio" ALTER COLUMN "idDono" SET NOT NULL;

-- Favorito.idUsuario
ALTER TABLE "Favorito" DROP CONSTRAINT "Favorito_idUsuario_fkey";
ALTER TABLE "Favorito" ADD COLUMN "idUsuario_novo" INTEGER;
UPDATE "Favorito" f SET "idUsuario_novo" = p."idNovo" FROM "Usuario" p WHERE f."idUsuario" = p."idUsuario";
ALTER TABLE "Favorito" DROP COLUMN "idUsuario";
ALTER TABLE "Favorito" RENAME COLUMN "idUsuario_novo" TO "idUsuario";
ALTER TABLE "Favorito" ALTER COLUMN "idUsuario" SET NOT NULL;

-- Pedido.idComprador
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_idComprador_fkey";
ALTER TABLE "Pedido" ADD COLUMN "idComprador_novo" INTEGER;
UPDATE "Pedido" f SET "idComprador_novo" = p."idNovo" FROM "Usuario" p WHERE f."idComprador" = p."idUsuario";
ALTER TABLE "Pedido" DROP COLUMN "idComprador";
ALTER TABLE "Pedido" RENAME COLUMN "idComprador_novo" TO "idComprador";
ALTER TABLE "Pedido" ALTER COLUMN "idComprador" SET NOT NULL;

-- Oferta.idComprador
ALTER TABLE "Oferta" DROP CONSTRAINT "Oferta_idComprador_fkey";
ALTER TABLE "Oferta" ADD COLUMN "idComprador_novo" INTEGER;
UPDATE "Oferta" f SET "idComprador_novo" = p."idNovo" FROM "Usuario" p WHERE f."idComprador" = p."idUsuario";
ALTER TABLE "Oferta" DROP COLUMN "idComprador";
ALTER TABLE "Oferta" RENAME COLUMN "idComprador_novo" TO "idComprador";
ALTER TABLE "Oferta" ALTER COLUMN "idComprador" SET NOT NULL;

-- Oferta.idAutor
ALTER TABLE "Oferta" DROP CONSTRAINT "Oferta_idAutor_fkey";
ALTER TABLE "Oferta" ADD COLUMN "idAutor_novo" INTEGER;
UPDATE "Oferta" f SET "idAutor_novo" = p."idNovo" FROM "Usuario" p WHERE f."idAutor" = p."idUsuario";
ALTER TABLE "Oferta" DROP COLUMN "idAutor";
ALTER TABLE "Oferta" RENAME COLUMN "idAutor_novo" TO "idAutor";
ALTER TABLE "Oferta" ALTER COLUMN "idAutor" SET NOT NULL;

-- Mensagem.idRemetente
ALTER TABLE "Mensagem" DROP CONSTRAINT "Mensagem_idRemetente_fkey";
ALTER TABLE "Mensagem" ADD COLUMN "idRemetente_novo" INTEGER;
UPDATE "Mensagem" f SET "idRemetente_novo" = p."idNovo" FROM "Usuario" p WHERE f."idRemetente" = p."idUsuario";
ALTER TABLE "Mensagem" DROP COLUMN "idRemetente";
ALTER TABLE "Mensagem" RENAME COLUMN "idRemetente_novo" TO "idRemetente";
ALTER TABLE "Mensagem" ALTER COLUMN "idRemetente" SET NOT NULL;

-- Mensagem.idDestinatario
ALTER TABLE "Mensagem" DROP CONSTRAINT "Mensagem_idDestinatario_fkey";
ALTER TABLE "Mensagem" ADD COLUMN "idDestinatario_novo" INTEGER;
UPDATE "Mensagem" f SET "idDestinatario_novo" = p."idNovo" FROM "Usuario" p WHERE f."idDestinatario" = p."idUsuario";
ALTER TABLE "Mensagem" DROP COLUMN "idDestinatario";
ALTER TABLE "Mensagem" RENAME COLUMN "idDestinatario_novo" TO "idDestinatario";
ALTER TABLE "Mensagem" ALTER COLUMN "idDestinatario" SET NOT NULL;

-- Denuncia.idAutor
ALTER TABLE "Denuncia" DROP CONSTRAINT "Denuncia_idAutor_fkey";
ALTER TABLE "Denuncia" ADD COLUMN "idAutor_novo" INTEGER;
UPDATE "Denuncia" f SET "idAutor_novo" = p."idNovo" FROM "Usuario" p WHERE f."idAutor" = p."idUsuario";
ALTER TABLE "Denuncia" DROP COLUMN "idAutor";
ALTER TABLE "Denuncia" RENAME COLUMN "idAutor_novo" TO "idAutor";
ALTER TABLE "Denuncia" ALTER COLUMN "idAutor" SET NOT NULL;

-- Denuncia.idAdministrador
ALTER TABLE "Denuncia" DROP CONSTRAINT "Denuncia_idAdministrador_fkey";
ALTER TABLE "Denuncia" ADD COLUMN "idAdministrador_novo" INTEGER;
UPDATE "Denuncia" f SET "idAdministrador_novo" = p."idNovo" FROM "Usuario" p WHERE f."idAdministrador" = p."idUsuario";
ALTER TABLE "Denuncia" DROP COLUMN "idAdministrador";
ALTER TABLE "Denuncia" RENAME COLUMN "idAdministrador_novo" TO "idAdministrador";

-- Denuncia.idUsuarioDenunciado
ALTER TABLE "Denuncia" DROP CONSTRAINT "Denuncia_idUsuarioDenunciado_fkey";
ALTER TABLE "Denuncia" ADD COLUMN "idUsuarioDenunciado_novo" INTEGER;
UPDATE "Denuncia" f SET "idUsuarioDenunciado_novo" = p."idNovo" FROM "Usuario" p WHERE f."idUsuarioDenunciado" = p."idUsuario";
ALTER TABLE "Denuncia" DROP COLUMN "idUsuarioDenunciado";
ALTER TABLE "Denuncia" RENAME COLUMN "idUsuarioDenunciado_novo" TO "idUsuarioDenunciado";

-- Anuncio.idInstrumento
ALTER TABLE "Anuncio" DROP CONSTRAINT "Anuncio_idInstrumento_fkey";
ALTER TABLE "Anuncio" ADD COLUMN "idInstrumento_novo" INTEGER;
UPDATE "Anuncio" f SET "idInstrumento_novo" = p."idNovo" FROM "Instrumento" p WHERE f."idInstrumento" = p."idInstrumento";
ALTER TABLE "Anuncio" DROP COLUMN "idInstrumento";
ALTER TABLE "Anuncio" RENAME COLUMN "idInstrumento_novo" TO "idInstrumento";
ALTER TABLE "Anuncio" ALTER COLUMN "idInstrumento" SET NOT NULL;

-- 3) Os pais passam a usar o numero como chave primaria ------------------------------------------------
-- Usuario: a coluna numérica vira a chave primária (auto-incremento, GENERATED BY DEFAULT)
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey";
ALTER TABLE "Usuario" DROP COLUMN "idUsuario";
ALTER TABLE "Usuario" RENAME COLUMN "idNovo" TO "idUsuario";
ALTER TABLE "Usuario" ALTER COLUMN "idUsuario" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario");
SELECT setval(pg_get_serial_sequence('"Usuario"', 'idUsuario'), COALESCE(max("idUsuario"), 1), max("idUsuario") IS NOT NULL) FROM "Usuario";

-- Instrumento: a coluna numérica vira a chave primária (auto-incremento, GENERATED BY DEFAULT)
ALTER TABLE "Instrumento" DROP CONSTRAINT "Instrumento_pkey";
ALTER TABLE "Instrumento" DROP COLUMN "idInstrumento";
ALTER TABLE "Instrumento" RENAME COLUMN "idNovo" TO "idInstrumento";
ALTER TABLE "Instrumento" ALTER COLUMN "idInstrumento" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE "Instrumento" ADD CONSTRAINT "Instrumento_pkey" PRIMARY KEY ("idInstrumento");
SELECT setval(pg_get_serial_sequence('"Instrumento"', 'idInstrumento'), COALESCE(max("idInstrumento"), 1), max("idInstrumento") IS NOT NULL) FROM "Instrumento";

-- 4) Recriar chaves estrangeiras (mesmos nomes e regras de antes) e indices --------------------------------
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_idVendedor_fkey" FOREIGN KEY ("idVendedor") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FotoAnuncio" ADD CONSTRAINT "FotoAnuncio_idDono_fkey" FOREIGN KEY ("idDono") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idComprador_fkey" FOREIGN KEY ("idComprador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_idComprador_fkey" FOREIGN KEY ("idComprador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_idAutor_fkey" FOREIGN KEY ("idAutor") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_idRemetente_fkey" FOREIGN KEY ("idRemetente") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_idDestinatario_fkey" FOREIGN KEY ("idDestinatario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idAutor_fkey" FOREIGN KEY ("idAutor") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idAdministrador_fkey" FOREIGN KEY ("idAdministrador") REFERENCES "Usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idUsuarioDenunciado_fkey" FOREIGN KEY ("idUsuarioDenunciado") REFERENCES "Usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_idInstrumento_fkey" FOREIGN KEY ("idInstrumento") REFERENCES "Instrumento"("idInstrumento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- A chave primaria composta de Favorito caiu junto com a coluna antiga
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_pkey" PRIMARY KEY ("idUsuario", "idAnuncio");

CREATE INDEX "Anuncio_idVendedor_idx" ON "Anuncio"("idVendedor");
CREATE UNIQUE INDEX "Anuncio_idInstrumento_key" ON "Anuncio"("idInstrumento");
CREATE INDEX "FotoAnuncio_idDono_idx" ON "FotoAnuncio"("idDono");
CREATE INDEX "Pedido_idComprador_idx" ON "Pedido"("idComprador");
CREATE INDEX "Oferta_idAnuncio_idComprador_idx" ON "Oferta"("idAnuncio", "idComprador");
CREATE INDEX "Mensagem_idRemetente_dataEnvio_idx" ON "Mensagem"("idRemetente", "dataEnvio");
CREATE INDEX "Mensagem_idDestinatario_dataEnvio_idx" ON "Mensagem"("idDestinatario", "dataEnvio");

COMMIT;

-- Conferencia (rode separado):
-- SELECT "idUsuario", "nome", "email" FROM "Usuario" ORDER BY 1 LIMIT 5;        -- 1 = admin
-- SELECT "idInstrumento", "marca", "modelo" FROM "Instrumento" ORDER BY 1 LIMIT 5;
-- SELECT data_type FROM information_schema.columns WHERE table_name='Usuario' AND column_name='idUsuario'; -- integer
