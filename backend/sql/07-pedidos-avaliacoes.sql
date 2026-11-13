-- Headstock | Parte 7 de N: PEDIDOS e AVALIACOES
-- Requer as Partes 4 (05-anuncios.sql) e 6 (06-favoritos-ofertas.sql). Rode UMA vez.
--
-- PEDIDOS (RF09): 17 pedidos, um por anuncio, cobrindo todo o ciclo de vida:
--   concluido: 9 | reembolsado: 1 | pago: 2 | devolucao_autorizada: 1 | entregue: 1 | em_disputa: 1 | cancelado: 1 | enviado: 1
--   * frete, taxa de 7% (RN01) e total calculados com as mesmas formulas da API;
--   * pedidos de 4 anuncios usam o valor da oferta "utilizada" da Parte 6 (Pedido.idOferta preenchido), pagos poucas horas
--     depois do aceite (a oferta aceita vale 24h): rode as Partes 6 e 7 em seguida;
--   * prazo de rastreio = 3 dias uteis apos o pagamento (RN03); um pedido "pago" esta com o prazo VENCIDO (rastreioAtrasado);
--   * "entregue" ha menos de 48h (ainda dentro do prazo de disputa, RN04); "concluido" so apos 48h da entrega (RN02);
--   * disputas: uma mantida pela moderacao, um estorno, uma devolucao autorizada, uma em analise; uma venda cancelada.
--   Datas relativas a AGORA (hora em que o script roda), para que os prazos continuem coerentes na tela.
--   Os anuncios dos pedidos viram "vendido" (exceto o cancelado, que volta/fica "ativo", como na API).
--
-- AVALIACOES (RF11): 19 avaliacoes (vendedor e produto), so de pedidos entregues ou concluidos, como a API exige.
--   Depois, a reputacao dos 9 vendedores avaliados e recalculada pela mesma regra da API
--   (media das notas de "vendedor", 2 casas; suspenso se a media ficar abaixo de 2). Os demais usuarios mantem a
--   reputacao inicial da Parte 2, inclusive o suspenso e o banido.
--
-- Os codigos de transacao sao ficticios ("sandbox_...", como no pagamento simulado).

BEGIN;

-- Soma dias uteis como a API (regras.js: somarDiasUteis): avanca um dia por vez e ignora sabado e domingo
CREATE FUNCTION pg_temp.somar_dias_uteis(inicio timestamp, dias integer) RETURNS timestamp
LANGUAGE plpgsql AS $$
DECLARE
  resultado timestamp := inicio;
  restantes integer := dias;
BEGIN
  WHILE restantes > 0 LOOP
    resultado := resultado + interval '1 day';
    IF extract(dow FROM resultado) NOT IN (0, 6) THEN
      restantes := restantes - 1;
    END IF;
  END LOOP;
  RETURN resultado;
END $$;

-- 1) Pedidos ---------------------------------------------------------------------------------------------
DO $$
DECLARE
  r record;
  v_agora timestamp := now() AT TIME ZONE 'UTC';
  v_anuncio integer;
  v_comprador integer;
  v_oferta integer;
  v_pago timestamp;
  v_envio timestamp;
  v_entrega timestamp;
  v_conclusao timestamp;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
    ('ana@email.com', 'Yamaha FG800', 'patricia.souza@email.com', 'pix', '69005-000', 'concluido', NULL, 6, 30, 96, 49, 'BR482915307BR', NULL, NULL, 1274.35, 84.00, 74.35, true),
    ('rodrigo.mendes@email.com', 'Strinberg LPS230', 'renato@email.com', 'cartao', '90010-000', 'concluido', NULL, 3, 40, 120, 50, 'BR730166284BR', NULL, NULL, 983.70, 63.00, 83.70, true),
    ('diego.carvalho@email.com', 'Roland JC-120', 'larissa.monteiro@email.com', 'cartao', '70040-010', 'concluido', 600, NULL, 26, 110, 52, 'BR118840926BR', NULL, NULL, 5027.30, 343.00, 127.30, false),
    ('henrique.moreira@email.com', 'Fender Player Telecaster', 'lucas@email.com', 'pix', '80010-000', 'concluido', NULL, 8, 20, 80, 49, 'BR906352418BR', NULL, NULL, 5579.50, 385.00, 79.50, true),
    ('isabela.ramos@email.com', 'Gibson J-45 Standard', 'beatriz.almeida@email.com', 'cartao', '88010-000', 'concluido', 450, NULL, 22, 70, 50, 'BR254718093BR', NULL, NULL, 22982.75, 1603.00, 82.75, false),
    ('natalia.correia@email.com', 'Dunlop Fuzz Face Mini', 'mariana.duarte@email.com', 'pix', '29010-000', 'concluido', 380, NULL, 45, 100, 50, 'BR671203845BR', 'O pedal chegou com um ruído de fundo forte, diferente do que o anúncio descrevia.', 'manter_venda: o pedal foi testado e o ruído é característico do circuito de fuzz.', 552.20, 36.40, 32.20, false),
    ('rafael.teixeira@email.com', 'Marshall MG30GFX', 'bruno.castro@email.com', 'cartao', '66010-000', 'concluido', 330, NULL, 28, 140, 49, 'BR389027516BR', NULL, NULL, 923.10, 56.00, 123.10, false),
    ('camila.rodrigues@email.com', 'Elixir Nanoweb Light 12052', 'juliana.matos@email.com', 'pix', '40020-000', 'concluido', 300, NULL, 18, 90, 48, 'BR540871962BR', NULL, NULL, 134.95, 6.65, 39.95, false),
    ('felipe.nogueira@email.com', 'Ernie Ball Extra Slinky', 'thiago.barbosa@email.com', 'pix', '74003-010', 'concluido', 260, NULL, 20, 72, 49, 'BR827406139BR', NULL, NULL, 94.55, 2.94, 52.55, false),
    ('camila.rodrigues@email.com', 'Epiphone DR-100', 'diego.carvalho@email.com', 'cartao', '60025-000', 'reembolsado', 250, NULL, 24, 70, NULL, 'BR195630847BR', 'O violão chegou com o tampo trincado. Anexei fotos da caixa e do instrumento.', 'estornar: as fotos confirmaram o dano; o estorno foi aprovado.', 1174.35, 77.00, 74.35, false),
    ('fernanda.gomes@email.com', 'Fender Rumble 100', 'diego.carvalho@email.com', 'pix', '60025-000', 'pago', 190, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2023.10, 133.00, 123.10, false),
    ('aline.freitas@email.com', 'Boss SD-1 Super Overdrive', 'carolina.pinto@email.com', 'pix', '78005-000', 'devolucao_autorizada', 140, NULL, 24, 60, NULL, 'BR462081735BR', 'O pedal que recebi é outra versão (SD-1W), não a que foi anunciada.', 'autorizar_devolucao: o comprador deve devolver o pedal com código de rastreio.', 433.20, 26.60, 53.20, false),
    ('rafael.teixeira@email.com', 'Boss DD-8 Digital Delay', 'ana@email.com', 'cartao', '30130-000', 'entregue', NULL, 5, 40, 72, NULL, 'BR758241096BR', NULL, NULL, 916.40, 61.60, 36.40, true),
    ('henrique.moreira@email.com', 'TC Electronic Flashback 2', 'gustavo.pereira@email.com', 'pix', '11010-000', 'em_disputa', 120, NULL, 24, 60, NULL, 'BR314958270BR', 'O pedal não liga. Testei com duas fontes diferentes e o LED não acende.', NULL, 678.00, 45.50, 28.00, false),
    ('isabela.ramos@email.com', 'Squier Affinity Stratocaster', 'leonardo.ribeiro@email.com', 'cartao', '12210-000', 'cancelado', 110, NULL, NULL, NULL, NULL, NULL, NULL, 'cancelar_venda: o vendedor não postou o instrumento dentro do prazo de 3 dias úteis.', 1450.10, 98.00, 50.10, false),
    ('tatiane.cardoso@email.com', 'B.C. Rich Warlock Legacy Floyd Rose', 'eduardo.lopes@email.com', 'pix', '14010-000', 'enviado', 70, NULL, 30, NULL, NULL, 'BR603917284BR', NULL, NULL, 6950.10, 483.00, 50.10, false),
    ('renato@email.com', 'Boss DS-1 Distortion', 'felipe.nogueira@email.com', 'pix', '13010-000', 'pago', 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 378.00, 24.50, 28.00, false)
    ) AS t(vendedor, titulo, comprador, metodo, cep, status, pago_h, apos_oferta_h, env_h, ent_h, conc_h, rastreio, motivo, resolucao, total, taxa, frete, usa_oferta)
  LOOP
    SELECT a."idAnuncio" INTO v_anuncio
    FROM "Anuncio" a JOIN "Usuario" u ON u."idUsuario" = a."idVendedor"
    WHERE u."email" = r.vendedor AND a."titulo" = r.titulo;
    IF v_anuncio IS NULL THEN RAISE EXCEPTION 'Anuncio nao encontrado: % / %', r.vendedor, r.titulo; END IF;
    SELECT "idUsuario" INTO v_comprador FROM "Usuario" WHERE "email" = r.comprador;
    IF v_comprador IS NULL THEN RAISE EXCEPTION 'Comprador nao encontrado: %', r.comprador; END IF;

    v_oferta := NULL;
    IF r.usa_oferta THEN
      SELECT "idOferta" INTO v_oferta FROM "Oferta" WHERE "idAnuncio" = v_anuncio AND "status" = 'utilizada';
      IF v_oferta IS NULL THEN RAISE EXCEPTION 'Oferta utilizada nao encontrada para: %', r.titulo; END IF;
    END IF;

    -- pedido por oferta: pago algumas horas depois do aceite; os demais, N horas atras
    IF v_oferta IS NOT NULL THEN
      SELECT "dataResposta" + r.apos_oferta_h * interval '1 hour' INTO v_pago FROM "Oferta" WHERE "idOferta" = v_oferta;
    ELSE
      v_pago := v_agora - r.pago_h * interval '1 hour';
    END IF;
    v_envio := CASE WHEN r.env_h IS NULL THEN NULL ELSE v_pago + r.env_h * interval '1 hour' END;
    v_entrega := CASE WHEN r.ent_h IS NULL THEN NULL ELSE v_envio + r.ent_h * interval '1 hour' END;
    v_conclusao := CASE WHEN r.conc_h IS NULL THEN NULL ELSE v_entrega + r.conc_h * interval '1 hour' END;

    INSERT INTO "Pedido" (
      "valorTotal", "taxaPlataforma", "valorFrete", "codigoRastreio", "statusPedido", "dataCriacao",
      "metodoPagamento", "idTransacao", "cepDestino", "dataPagamento", "prazoRastreio", "dataEnvio", "dataEntrega", "dataConclusao",
      "motivoDisputa", "resolucaoDisputa", "idComprador", "idAnuncio", "idOferta"
    ) VALUES (
      r.total, r.taxa, r.frete, r.rastreio, r.status, v_pago,
      r.metodo, 'sandbox_' || gen_random_uuid()::text, r.cep, v_pago, pg_temp.somar_dias_uteis(v_pago, 3), v_envio, v_entrega, v_conclusao,
      r.motivo, r.resolucao, v_comprador, v_anuncio, v_oferta
    );
  END LOOP;
END $$;

-- 2) Anuncios vendidos (a API marca "vendido" no momento da compra) --------------------------------------------
UPDATE "Anuncio" a SET "status" = 'vendido'
FROM (VALUES
    ('diego.carvalho@email.com', 'Roland JC-120'),
    ('isabela.ramos@email.com', 'Gibson J-45 Standard'),
    ('natalia.correia@email.com', 'Dunlop Fuzz Face Mini'),
    ('camila.rodrigues@email.com', 'Elixir Nanoweb Light 12052'),
    ('felipe.nogueira@email.com', 'Ernie Ball Extra Slinky'),
    ('camila.rodrigues@email.com', 'Epiphone DR-100'),
    ('fernanda.gomes@email.com', 'Fender Rumble 100'),
    ('aline.freitas@email.com', 'Boss SD-1 Super Overdrive'),
    ('renato@email.com', 'Boss DS-1 Distortion')
) AS t(vendedor, titulo), "Usuario" u
WHERE u."email" = t.vendedor AND a."idVendedor" = u."idUsuario" AND a."titulo" = t.titulo;

-- 3) Avaliacoes ------------------------------------------------------------------------------------------
DO $$
DECLARE
  r record;
  v_pedido integer;
  v_entrega timestamp;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
    ('ana@email.com', 'Yamaha FG800', 'vendedor', 5, 'Vendedora atenciosa, tirou todas as minhas dúvidas e embalou muito bem.', 12),
    ('ana@email.com', 'Yamaha FG800', 'produto', 5, 'Violão exatamente como nas fotos, som lindo.', 14),
    ('rodrigo.mendes@email.com', 'Strinberg LPS230', 'vendedor', 4, 'Boa comunicação, só demorou um pouco para postar.', 20),
    ('rodrigo.mendes@email.com', 'Strinberg LPS230', 'produto', 3, 'Funciona, mas tem mais marcas de uso do que as fotos mostravam.', 22),
    ('diego.carvalho@email.com', 'Roland JC-120', 'vendedor', 5, 'Embalagem reforçada e nota fiscal. Vendedor top.', 16),
    ('diego.carvalho@email.com', 'Roland JC-120', 'produto', 4, 'Chegou perfeito, o clean é sensacional. Só é muito pesado.', 18),
    ('henrique.moreira@email.com', 'Fender Player Telecaster', 'vendedor', 5, 'Negociação tranquila, aceitou a contraproposta rapidamente.', 10),
    ('henrique.moreira@email.com', 'Fender Player Telecaster', 'produto', 5, 'Impecável, melhor que o descrito.', 11),
    ('isabela.ramos@email.com', 'Gibson J-45 Standard', 'vendedor', 5, 'Vendedora honesta, case muito bem protegido para o envio.', 14),
    ('isabela.ramos@email.com', 'Gibson J-45 Standard', 'produto', 5, 'Violão incrível, timbre quente. Recomendo.', 15),
    ('natalia.correia@email.com', 'Dunlop Fuzz Face Mini', 'vendedor', 3, 'O pedal estava bom, mas a vendedora demorou a responder durante a disputa.', 60),
    ('natalia.correia@email.com', 'Dunlop Fuzz Face Mini', 'produto', 4, 'Depois que entendi que o ruído é do circuito, gostei do timbre.', 62),
    ('rafael.teixeira@email.com', 'Marshall MG30GFX', 'vendedor', 4, 'Entrega dentro do prazo, tudo certo.', 25),
    ('rafael.teixeira@email.com', 'Marshall MG30GFX', 'produto', 3, 'Funciona, mas tem um chiado leve ao ligar.', 26),
    ('camila.rodrigues@email.com', 'Elixir Nanoweb Light 12052', 'vendedor', 5, 'Rápida e atenciosa, cordas lacradas como prometido.', 8),
    ('camila.rodrigues@email.com', 'Elixir Nanoweb Light 12052', 'produto', 5, 'Cordas ótimas, duram bastante.', 9),
    ('felipe.nogueira@email.com', 'Ernie Ball Extra Slinky', 'vendedor', 5, 'Postou no mesmo dia. Excelente.', 7),
    ('felipe.nogueira@email.com', 'Ernie Ball Extra Slinky', 'produto', 5, 'Cordas novas, lacradas, 008 certinho.', 8),
    ('rafael.teixeira@email.com', 'Boss DD-8 Digital Delay', 'vendedor', 5, 'Entrega rápida e o pedal chegou muito bem embalado.', 8)
    ) AS t(vendedor, titulo, tipo, nota, texto, horas_apos_entrega)
  LOOP
    SELECT p."idPedido", p."dataEntrega" INTO v_pedido, v_entrega
    FROM "Pedido" p
    JOIN "Anuncio" a ON a."idAnuncio" = p."idAnuncio"
    JOIN "Usuario" u ON u."idUsuario" = a."idVendedor"
    WHERE u."email" = r.vendedor AND a."titulo" = r.titulo;
    IF v_pedido IS NULL THEN RAISE EXCEPTION 'Pedido nao encontrado para avaliar: % / %', r.vendedor, r.titulo; END IF;

    INSERT INTO "Avaliacao" ("notaEstrelas", "textoJustificativo", "tipoAvaliacao", "dataCriacao", "idPedido")
    VALUES (r.nota, r.texto, r.tipo, v_entrega + r.horas_apos_entrega * interval '1 hour', v_pedido);
  END LOOP;
END $$;

-- 4) Reputacao dos vendedores avaliados (mesma regra de services/reputacao.js: media de "vendedor", suspenso se < 2) ----------
UPDATE "Usuario" u
SET "reputacaoMedia" = s.media, "suspenso" = (s.media < 2)
FROM (
  SELECT a."idVendedor" AS id, round(avg(av."notaEstrelas")::numeric, 2)::double precision AS media
  FROM "Avaliacao" av
  JOIN "Pedido" p ON p."idPedido" = av."idPedido"
  JOIN "Anuncio" a ON a."idAnuncio" = p."idAnuncio"
  WHERE av."tipoAvaliacao" = 'vendedor'
  GROUP BY a."idVendedor"
) s
WHERE u."idUsuario" = s.id;

COMMIT;

-- Conferencia (rode separado):
-- SELECT "statusPedido", count(*) FROM "Pedido" GROUP BY 1 ORDER BY 2 DESC;     -- total 17
-- SELECT "tipoAvaliacao", count(*), round(avg("notaEstrelas"), 2) FROM "Avaliacao" GROUP BY 1;   -- 19 no total
-- SELECT u."nome", u."reputacaoMedia" FROM "Usuario" u WHERE u."idUsuario" IN (SELECT a."idVendedor" FROM "Pedido" p JOIN "Anuncio" a USING ("idAnuncio")) ORDER BY 1;
