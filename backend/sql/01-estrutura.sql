-- Headstock | Parte 1 de N: ESTRUTURA (10 tabelas, indices e chaves estrangeiras)
-- Cole no Supabase: SQL Editor > New query > Run. Rode UMA vez, em banco vazio.
-- Gerado a partir de prisma/migrations/20261113162011_init/migration.sql

BEGIN;

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'comum',
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reputacaoMedia" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "suspenso" BOOLEAN NOT NULL DEFAULT false,
    "banido" BOOLEAN NOT NULL DEFAULT false,
    "chavePix" TEXT,
    "enderecoCompleto" TEXT,
    "nivelAcesso" INTEGER,
    "tokenRecuperacaoHash" TEXT,
    "tokenRecuperacaoExpira" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Instrumento" (
    "idInstrumento" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tipoCaptacao" TEXT NOT NULL DEFAULT '',
    "numeroCordas" INTEGER NOT NULL DEFAULT 0,
    "orientacao" TEXT NOT NULL DEFAULT '',
    "especificacoes" JSONB NOT NULL DEFAULT '{}',
    "noCatalogo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Instrumento_pkey" PRIMARY KEY ("idInstrumento")
);

-- CreateTable
CREATE TABLE "Anuncio" (
    "idAnuncio" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "preco" DECIMAL(12,2) NOT NULL,
    "condicao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "localizacao" TEXT NOT NULL,
    "descricao" TEXT,
    "aceitaPropostas" BOOLEAN NOT NULL DEFAULT true,
    "idVendedor" TEXT NOT NULL,
    "idInstrumento" TEXT NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("idAnuncio")
);

-- CreateTable
CREATE TABLE "FotoAnuncio" (
    "idFoto" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tamanhoMB" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT,
    "dados" BYTEA,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idDono" TEXT NOT NULL,
    "idAnuncio" TEXT,

    CONSTRAINT "FotoAnuncio_pkey" PRIMARY KEY ("idFoto")
);

-- CreateTable
CREATE TABLE "Favorito" (
    "idUsuario" TEXT NOT NULL,
    "idAnuncio" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("idUsuario","idAnuncio")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "idPedido" TEXT NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,
    "taxaPlataforma" DECIMAL(12,2) NOT NULL,
    "valorFrete" DECIMAL(12,2) NOT NULL,
    "codigoRastreio" TEXT,
    "statusPedido" TEXT NOT NULL DEFAULT 'pago',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPagamento" TEXT NOT NULL,
    "idTransacao" TEXT NOT NULL,
    "cepDestino" TEXT NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "prazoRastreio" TIMESTAMP(3),
    "dataEnvio" TIMESTAMP(3),
    "dataEntrega" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "motivoDisputa" TEXT,
    "resolucaoDisputa" TEXT,
    "idComprador" TEXT NOT NULL,
    "idAnuncio" TEXT NOT NULL,
    "idOferta" TEXT,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("idPedido")
);

-- CreateTable
CREATE TABLE "Oferta" (
    "idOferta" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "dataResposta" TIMESTAMP(3),
    "idAnuncio" TEXT NOT NULL,
    "idComprador" TEXT NOT NULL,
    "idAutor" TEXT NOT NULL,

    CONSTRAINT "Oferta_pkey" PRIMARY KEY ("idOferta")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "idAvaliacao" TEXT NOT NULL,
    "notaEstrelas" INTEGER NOT NULL,
    "textoJustificativo" TEXT NOT NULL,
    "tipoAvaliacao" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idPedido" TEXT NOT NULL,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("idAvaliacao")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "idMensagem" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idRemetente" TEXT NOT NULL,
    "idDestinatario" TEXT NOT NULL,
    "idAnuncio" TEXT,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("idMensagem")
);

-- CreateTable
CREATE TABLE "Denuncia" (
    "idDenuncia" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "descricaoTextual" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolucao" TEXT,
    "idAutor" TEXT NOT NULL,
    "idAdministrador" TEXT,
    "idAnuncio" TEXT,
    "idUsuarioDenunciado" TEXT,
    "idMensagem" TEXT,

    CONSTRAINT "Denuncia_pkey" PRIMARY KEY ("idDenuncia")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Instrumento_noCatalogo_categoria_idx" ON "Instrumento"("noCatalogo", "categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Anuncio_idInstrumento_key" ON "Anuncio"("idInstrumento");

-- CreateIndex
CREATE INDEX "Anuncio_status_dataCriacao_idx" ON "Anuncio"("status", "dataCriacao");

-- CreateIndex
CREATE INDEX "Anuncio_status_preco_idx" ON "Anuncio"("status", "preco");

-- CreateIndex
CREATE INDEX "Anuncio_idVendedor_idx" ON "Anuncio"("idVendedor");

-- CreateIndex
CREATE INDEX "FotoAnuncio_idAnuncio_ordem_idx" ON "FotoAnuncio"("idAnuncio", "ordem");

-- CreateIndex
CREATE INDEX "FotoAnuncio_idDono_idx" ON "FotoAnuncio"("idDono");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_idOferta_key" ON "Pedido"("idOferta");

-- CreateIndex
CREATE INDEX "Pedido_idComprador_idx" ON "Pedido"("idComprador");

-- CreateIndex
CREATE INDEX "Pedido_idAnuncio_idx" ON "Pedido"("idAnuncio");

-- CreateIndex
CREATE INDEX "Pedido_statusPedido_idx" ON "Pedido"("statusPedido");

-- CreateIndex
CREATE INDEX "Oferta_idAnuncio_idComprador_idx" ON "Oferta"("idAnuncio", "idComprador");

-- CreateIndex
CREATE INDEX "Oferta_status_expiraEm_idx" ON "Oferta"("status", "expiraEm");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_idPedido_tipoAvaliacao_key" ON "Avaliacao"("idPedido", "tipoAvaliacao");

-- CreateIndex
CREATE INDEX "Mensagem_idRemetente_dataEnvio_idx" ON "Mensagem"("idRemetente", "dataEnvio");

-- CreateIndex
CREATE INDEX "Mensagem_idDestinatario_dataEnvio_idx" ON "Mensagem"("idDestinatario", "dataEnvio");

-- CreateIndex
CREATE INDEX "Denuncia_status_idx" ON "Denuncia"("status");

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_idVendedor_fkey" FOREIGN KEY ("idVendedor") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_idInstrumento_fkey" FOREIGN KEY ("idInstrumento") REFERENCES "Instrumento"("idInstrumento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoAnuncio" ADD CONSTRAINT "FotoAnuncio_idDono_fkey" FOREIGN KEY ("idDono") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoAnuncio" ADD CONSTRAINT "FotoAnuncio_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idComprador_fkey" FOREIGN KEY ("idComprador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idOferta_fkey" FOREIGN KEY ("idOferta") REFERENCES "Oferta"("idOferta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_idComprador_fkey" FOREIGN KEY ("idComprador") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oferta" ADD CONSTRAINT "Oferta_idAutor_fkey" FOREIGN KEY ("idAutor") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "Pedido"("idPedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_idRemetente_fkey" FOREIGN KEY ("idRemetente") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_idDestinatario_fkey" FOREIGN KEY ("idDestinatario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idAutor_fkey" FOREIGN KEY ("idAutor") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idAdministrador_fkey" FOREIGN KEY ("idAdministrador") REFERENCES "Usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idAnuncio_fkey" FOREIGN KEY ("idAnuncio") REFERENCES "Anuncio"("idAnuncio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idUsuarioDenunciado_fkey" FOREIGN KEY ("idUsuarioDenunciado") REFERENCES "Usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Denuncia" ADD CONSTRAINT "Denuncia_idMensagem_fkey" FOREIGN KEY ("idMensagem") REFERENCES "Mensagem"("idMensagem") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
