-- Headstock | Parte 3c: IDs NUMERICOS nas demais tabelas
-- Requer as Partes 1, 2, 3 e 3b (03b-ids-numericos.sql). Rode UMA vez.
--
-- Converte de TEXT (uuid) para INTEGER auto-incremento o id de:
--   Anuncio, FotoAnuncio, Oferta, Pedido, Avaliacao, Mensagem, Denuncia
-- e as 9 colunas que apontam para eles (ex.: Pedido.idAnuncio, Avaliacao.idPedido, Denuncia.idMensagem).
-- Favorito nao tem id proprio: sua chave composta (idUsuario, idAnuncio) e recriada com os numeros.
-- Os relacionamentos sao preservados; as linhas ganham numeros por ordem de criacao (1, 2, 3...).
--
-- Fotos enviadas pelo app guardam a propria URL ("/fotos/<id>"); ela e reescrita com o numero novo.
-- Fotos externas (https://...) nao mudam.
--
-- ATENCAO: o backend e o frontend ainda tratam estes ids como texto. Atualize o codigo antes do deploy.

BEGIN;

-- 1) Numerar as linhas -------------------------------------------------------------------------------
-- Anuncio
ALTER TABLE "Anuncio" ADD COLUMN "idNovo" INTEGER;
UPDATE "Anuncio" x SET "idNovo" = n.num
FROM (SELECT "idAnuncio", row_number() OVER (ORDER BY "dataCriacao", "idAnuncio") AS num FROM "Anuncio") n
WHERE x."idAnuncio" = n."idAnuncio";
ALTER TABLE "Anuncio" ALTER COLUMN "idNovo" SET NOT NULL;

-- FotoAnuncio
ALTER TABLE "FotoAnuncio" ADD COLUMN "idNovo" INTEGER;
UPDATE "FotoAnuncio" x SET "idNovo" = n.num
FROM (SELECT "idFoto", row_number() OVER (ORDER BY "dataEnvio", "idFoto") AS num FROM "FotoAnuncio") n
WHERE x."idFoto" = n."idFoto";
ALTER TABLE "FotoAnuncio" ALTER COLUMN "idNovo" SET NOT NULL;

-- Oferta
ALTER TABLE "Oferta" ADD COLUMN "idNovo" INTEGER;
UPDATE "Oferta" x SET "idNovo" = n.num
FROM (SELECT "idOferta", row_number() OVER (ORDER BY "dataCriacao", "idOferta") AS num FROM "Oferta") n
WHERE x."idOferta" = n."idOferta";
ALTER TABLE "Oferta" ALTER COLUMN "idNovo" SET NOT NULL;

-- Pedido
ALTER TABLE "Pedido" ADD COLUMN "idNovo" INTEGER;
UPDATE "Pedido" x SET "idNovo" = n.num
FROM (SELECT "idPedido", row_number() OVER (ORDER BY "dataCriacao", "idPedido") AS num FROM "Pedido") n
WHERE x."idPedido" = n."idPedido";
ALTER TABLE "Pedido" ALTER COLUMN "idNovo" SET NOT NULL;

-- Avaliacao
ALTER TABLE "Avaliacao" ADD COLUMN "idNovo" INTEGER;
UPDATE "Avaliacao" x SET "idNovo" = n.num
FROM (SELECT "idAvaliacao", row_number() OVER (ORDER BY "dataCriacao", "idAvaliacao") AS num FROM "Avaliacao") n
WHERE x."idAvaliacao" = n."idAvaliacao";
ALTER TABLE "Avaliacao" ALTER COLUMN "idNovo" SET NOT NULL;

-- Mensagem
ALTER TABLE "Mensagem" ADD COLUMN "idNovo" INTEGER;
UPDATE "Mensagem" x SET "idNovo" = n.num
FROM (SELECT "idMensagem", row_number() OVER (ORDER BY "dataEnvio", "idMensagem") AS num FROM "Mensagem") n
WHERE x."idMensagem" = n."idMensagem";
ALTER TABLE "Mensagem" ALTER COLUMN "idNovo" SET NOT NULL;

-- Denuncia
ALTER TABLE "Denuncia" ADD COLUMN "idNovo" INTEGER;
UPDATE "Denuncia" x SET "idNovo" = n.num
FROM (SELECT "idDenuncia", row_number() OVER (ORDER BY "dataCriacao", "idDenuncia") AS num FROM "Denuncia") n
WHERE x."idDenuncia" = n."idDenuncia";
ALTER TABLE "Denuncia" ALTER COLUMN "idNovo" SET NOT NULL;

-- A URL das fotos enviadas pelo app usa o id; reescreve com o numero novo
UPDATE "FotoAnuncio" SET "url" = '/fotos/' || "idNovo" WHERE "dados" IS NOT NULL;

-- 2) Trocar as colunas que apontam para essas tabelas -----------------------------------------------------
-- FotoAnuncio.idAnuncio
ALTER TABLE "FotoAnuncio" DROP CONSTRAINT "FotoAnuncio_idAnuncio_fkey";
ALTER TABLE "FotoAnuncio" ADD COLUMN "idAnuncio_novo" INTEGER;
UPDATE "FotoAnuncio" f SET "idAnuncio_novo" = p."idNovo" FROM "Anuncio" p WHERE f."idAnuncio" = p."idAnuncio";
ALTER TABLE "FotoAnuncio" DROP COLUMN "idAnuncio";
ALTER TABLE "FotoAnuncio" RENAME COLUMN "idAnuncio_novo" TO "idAnuncio";

-- Favorito.idAnuncio
ALTER TABLE "Favorito" DROP CONSTRAINT "Favorito_idAnuncio_fkey";
ALTER TABLE "Favorito" ADD COLUMN "idAnuncio_novo" INTEGER;
UPDATE "Favorito" f SET "idAnuncio_novo" = p."idNovo" FROM "Anuncio" p WHERE f."idAnuncio" = p."idAnuncio";
ALTER TABLE "Favorito" DROP COLUMN "idAnuncio";
ALTER TABLE "Favorito" RENAME COLUMN "idAnuncio_novo" TO "idAnuncio";
ALTER TABLE "Favorito" ALTER COLUMN "idAnuncio" SET NOT NULL;

-- Pedido.idAnuncio
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_idAnuncio_fkey";
ALTER TABLE "Pedido" ADD COLUMN "idAnuncio_novo" INTEGER;
UPDATE "Pedido" f SET "idAnuncio_novo" = p."idNovo" FROM "Anuncio" p WHERE f."idAnuncio" = p."idAnuncio";
ALTER TABLE "Pedido" DROP COLUMN "idAnuncio";
ALTER TABLE "Pedido" RENAME COLUMN "idAnuncio_novo" TO "idAnuncio";
ALTER TABLE "Pedido" ALTER COLUMN "idAnuncio" SET NOT NULL;

-- Oferta.idAnuncio
ALTER TABLE "Oferta" DROP CONSTRAINT "Oferta_idAnuncio_fkey";
ALTER TABLE "Oferta" ADD COLUMN "idAnuncio_novo" INTEGER;
UPDATE "Oferta" f SET "idAnuncio_novo" = p."idNovo" FROM "Anuncio" p WHERE f."idAnuncio" = p."idAnuncio";
ALTER TABLE "Oferta" DROP COLUMN "idAnuncio";
ALTER TABLE "Oferta" RENAME COLUMN "idAnuncio_novo" TO "idAnuncio";
ALTER TABLE "Oferta" ALTER COLUMN "idAnuncio" SET NOT NULL;

-- Mensagem.idAnuncio
ALTER TABLE "Mensagem" DROP CONSTRAINT "Mensagem_idAnuncio_fkey";
ALTER TABLE "Mensagem" ADD COLUMN "idAnuncio_novo" INTEGER;
UPDATE "Mensagem" f SET "idAnuncio_novo" = p."idNovo" FROM "Anuncio" p WHERE f."idAnuncio" = p."idAnuncio";
ALTER TABLE "Mensagem" DROP COLUMN "idAnuncio";
ALTER TABLE "Mensagem" RENAME COLUMN "idAnuncio_novo" TO "idAnuncio";

-- Denuncia.idAnuncio
ALTER TABLE "Denuncia" DROP CONSTRAINT "Denuncia_idAnuncio_fkey";
ALTER TABLE "Denuncia" ADD COLUMN "idAnuncio_novo" INTEGER;
UPDATE "Denuncia" f SET "idAnuncio_novo" = p."idNovo" FROM "Anuncio" p WHERE f."idAnuncio" = p."idAnuncio";
ALTER TABLE "Denuncia" DROP COLUMN "idAnuncio";
ALTER TABLE "Denuncia" RENAME COLUMN "idAnuncio_novo" TO "idAnuncio";

-- Pedido.idOferta
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_idOferta_fkey";
ALTER TABLE "Pedido" ADD COLUMN "idOferta_novo" INTEGER;
UPDATE "Pedido" f SET "idOferta_novo" = p."idNovo" FROM "Oferta" p WHERE f."idOferta" = p."idOferta";
ALTER TABLE "Pedido" DROP COLUMN "idOferta";
ALTER TABLE "Pedido" RENAME COLUMN "idOferta_novo" TO "idOferta";

-- Avaliacao.idPedido
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_idPedido_fkey";
ALTER TABLE "Avaliacao" ADD COLUMN "idPedido_novo" INTEGER;
UPDATE "Avaliacao" f SET "idPedido_novo" = p."idNovo" FROM "Pedido" p WHERE f."idPedido" = p."idPedido";
ALTER TABLE "Avaliacao" DROP COLUMN "idPedido";
ALTER TABLE "Avaliacao" RENAME COLUMN "idPedido_novo" TO "idPedido";
ALTER TABLE "Avaliacao" ALTER COLUMN "idPedido" SET NOT NULL;

-- Denuncia.idMensagem
ALTER TABLE "Denuncia" DROP CONSTRAINT "Denuncia_idMensagem_fkey";
ALTER TABLE "Denuncia" ADD COLUMN "idMensagem_novo" INTEGER;
UPDATE "Denuncia" f SET "idMensagem_novo" = p."idNovo" FROM "Mensagem" p WHERE f."idMensagem" = p."idMensagem";
ALTER TABLE "Denuncia" DROP COLUMN "idMensagem";
ALTER TABLE "Denuncia" RENAME COLUMN "idMensagem_novo" TO "idMensagem";

-- 3) Cada tabela passa a usar o numero como chave primaria (auto-incremento) -------------------------------
-- Anuncio
ALTER TABLE "Anuncio" DROP CONSTRAINT "Anuncio_pkey";
ALTER TABLE "Anuncio" DROP COLUMN "idAnuncio";
ALTER TABLE "Anuncio" RENAME COLUMN "idNovo" TO "idAnuncio";
ALTER TABLE "Anuncio" ALTER COLUMN "idAnuncio" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("idAnuncio");
SELECT setval(pg_get_serial_sequence('"Anuncio"', 'idAnuncio'), COALESCE(max("idAnuncio"), 1), max("idAnuncio") IS NOT NULL) FROM "Anuncio";

-- FotoAnuncio
ALTER TABLE "FotoAnuncio" DROP CONSTRAINT "FotoAnuncio_pkey";
ALTER TABLE "FotoAnuncio" DROP COLUMN "idFoto";
ALTER TABLE "FotoAnuncio" RENAME COLUMN "idNovo" TO "idFoto";
ALTER TABLE "FotoAnuncio" ALTER COLUMN "idFoto" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE "FotoAnuncio" ADD CONSTRAINT "FotoAnuncio_pkey" PRIMARY KEY ("idFoto");
SELECT setval(pg_get_serial_sequence('"FotoAnuncio"', 'idFoto'), COALESCE(max("idFoto"), 1), max("idFoto") IS NOT NULL) FROM "FotoAnuncio";

-- Oferta
ALTER TABLE "Oferta" DROP CONSTRAINT "Oferta_pkey";
ALTER TABLE "Oferta" DROP COLUMN "idOferta";
ALTER TABLE "Oferta" RENAME COLUMN "idNovo" TO "idOferta";
ALTER TABLE "Oferta" ALTER COLUMN "idOferta" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_pkey" PRIMARY KEY ("idOferta");
SELECT setval(pg_get_serial_sequence('"Oferta"', 'idOferta'), COALESCE(max("idOferta"), 1), max("idOferta") IS NOT NULL) FROM "Oferta";

-- Pedido
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_pkey";
ALTER TABLE "Pedido" DROP COLUMN "idPedido";
ALTER TABLE "Pedido" RENAME COLUMN "idNovo" TO "idPedido";
ALTER TABLE "Pedido" ALTER COLUMN "idPedido" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_pkey" PRIMARY KEY ("idPedido");
SELECT setval(pg_get_serial_sequence('"Pedido"', 'idPedido'), COALESCE(max("idPedido"), 1), max("idPedido") IS NOT NULL) FROM "Pedido";

-- Avaliacao
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_pkey";
ALTER TABLE "Avaliacao" DROP COLUMN "idAvaliacao";
ALTER TABLE "Avaliacao" RENAME COLUMN "idNovo" TO "idAvaliacao";
ALTER TABLE "Avaliacao" ALTER COLUMN "idAvaliacao" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("idAvaliacao");
SELECT setval(pg_get_serial_sequence('"Avaliacao"', 'idAvaliacao'), COALESCE(max("idAvaliacao"), 1), max("idAvaliacao") IS NOT NULL) FROM "Avaliacao";

-- Mensagem
ALTER TABLE "Mensagem" DROP CONSTRAINT "Mensagem_pkey";
ALTER TABLE "Mensagem" DROP COLUMN "idMensagem";
ALTER TABLE "Mensagem" RENAME COLUMN "idNovo" TO "idMensagem";
ALTER TABLE "Mensagem" ALTER COLUMN "idMensagem" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("idMensagem");
SELECT setval(pg_get_serial_sequence('"Mensagem"', 'idMensagem'), COALESCE(max("idMensagem"), 1), max("idMensagem") IS NOT NULL) FROM "Mensagem";

-- Denuncia
ALTER TABLE "Denuncia" DROP CONSTRAINT "Denuncia_pkey";
ALTER TABLE "Denuncia" DROP COLUMN "idDenuncia";
ALTER TABLE "Denuncia" RENAME COLUMN "idNovo" TO "idDenuncia";
ALTER TABLE "Denuncia" ALTER COLUMN "idDenuncia" ADD GENERATED BY DEFAULT AS IDENTITY;
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_pkey" PRIMARY KEY ("idDenuncia");
SELECT setval(pg_get_serial_sequence('"Denuncia"', 'idDenuncia'), COALESCE(max("idDenuncia"), 1), max("idDenuncia") IS NOT NULL) FROM "Denuncia";

-- 4) Recriar chaves estrangeiras (mesmos nomes e regras), chaves compostas e indices ------------------------
ALTER TABLE "FotoAnuncio" ADD CONSTRAINT "FotoAnuncio_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idOferta_fkey" FOREIGN KEY ("idOferta") REFERENCES "Oferta"("idOferta") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "Pedido"("idPedido") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idMensagem_fkey" FOREIGN KEY ("idMensagem") REFERENCES "Mensagem"("idMensagem") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_pkey" PRIMARY KEY ("idUsuario", "idAnuncio");
CREATE INDEX "FotoAnuncio_idAnuncio_ordem_idx" ON "FotoAnuncio"("idAnuncio", "ordem");
CREATE INDEX "Pedido_idAnuncio_idx" ON "Pedido"("idAnuncio");
CREATE UNIQUE INDEX "Pedido_idOferta_key" ON "Pedido"("idOferta");
CREATE INDEX "Oferta_idAnuncio_idComprador_idx" ON "Oferta"("idAnuncio", "idComprador");
CREATE UNIQUE INDEX "Avaliacao_idPedido_tipoAvaliacao_key" ON "Avaliacao"("idPedido", "tipoAvaliacao");

COMMIT;

-- Conferencia (rode separado): todos os ids devem ser integer
-- SELECT table_name, data_type FROM information_schema.columns
-- WHERE column_name LIKE 'id%' AND column_name <> 'idTransacao' AND table_schema = 'public' AND data_type <> 'integer'
-- ORDER BY 1;  -- 0 linhas ("idTransacao" e o codigo do gateway de pagamento e continua texto)
