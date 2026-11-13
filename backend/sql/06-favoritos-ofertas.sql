-- Headstock | Parte 6 de N: FAVORITOS e OFERTAS
-- Requer a Parte 4 (05-anuncios.sql). Rode UMA vez.
--
-- FAVORITOS (RF12): 152 favoritos de 28 usuarios (de 3 a 8 cada). Ninguem favorita o proprio anuncio;
-- so anuncios ativos ou vendidos (os que a lista de favoritos mostra). Anuncios de moda no shoegaze (Jazzmaster, Big Muff,
-- BigSky...) e os de Fender/Gibson aparecem com mais frequencia. Usuario banido nao tem favoritos.
--
-- OFERTAS (RF08): 29 propostas de preco, em 22 anuncios, seguindo as regras da API:
--   * valor sempre menor que o preco do anuncio; so em anuncios que aceitam propostas; comprador diferente do vendedor;
--   * no maximo UMA proposta aberta (pendente/aceita) por comprador em cada anuncio;
--   * uma proposta substituida e sempre seguida de outra do mesmo negocio (contraproposta = idAutor do vendedor);
--   * pendente vale 24h; aceita vale 24h depois do aceite; as demais ja venceram.
-- Por situacao: pendente: 6 | substituida: 6 | aceita: 1 | recusada: 7 | expirada: 4 | cancelada: 1 | utilizada: 4
--
-- As propostas ABERTAS (pendente/aceita) usam horarios relativos a AGORA (hora em que o script roda),
-- entao aparecem como "Expira em ..." no chat. As antigas ficam no passado, depois da criacao do anuncio.
-- As "utilizada" sao dos 4 anuncios vendidos por proposta; a Parte 7 cria os pedidos com esses valores, pagos poucas horas
-- depois do aceite (a oferta aceita vale 24h). Por isso, rode as Partes 6 e 7 em seguida (no mesmo dia).
-- A Parte 8 (mensagens) deve incluir as mensagens automaticas que o app grava a cada proposta (ex.: "Fiz uma proposta de R$ ...").

BEGIN;

-- 1) Ofertas ---------------------------------------------------------------------------------------------
DO $$
DECLARE
  r record;
  v_anuncio integer;
  v_vendedor integer;
  v_comprador integer;
  v_criado timestamp;
  v_resposta timestamp;
  v_agora timestamp := now() AT TIME ZONE 'UTC';
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
    ('marcos@email.com', 'Fender Player Jazzmaster', 'lucas@email.com', 'c', 6600, 'pendente', NULL, 3, NULL),
    ('marcos@email.com', 'Fender Player Stratocaster', 'ana@email.com', 'c', 6000, 'substituida', NULL, 20, 2),
    ('marcos@email.com', 'Fender Player Stratocaster', 'ana@email.com', 'v', 6400, 'aceita', NULL, 18, 16),
    ('aline.freitas@email.com', 'Gibson SG Standard', 'lucas@email.com', 'c', 12000, 'pendente', NULL, 8, NULL),
    ('felipe.nogueira@email.com', 'Ibanez RG421', 'renato@email.com', 'c', 2000, 'pendente', NULL, 1, NULL),
    ('diego.carvalho@email.com', 'Strymon Timeline', 'juliana.matos@email.com', 'c', 3100, 'pendente', NULL, 5, NULL),
    ('carolina.pinto@email.com', 'Fender Player Jaguar', 'ana@email.com', 'c', 5600, 'substituida', NULL, 10, 4),
    ('carolina.pinto@email.com', 'Fender Player Jaguar', 'ana@email.com', 'v', 6100, 'pendente', NULL, 6, NULL),
    ('natalia.correia@email.com', 'Gibson ES-335', 'thiago.barbosa@email.com', 'c', 25000, 'pendente', NULL, 21, NULL),
    ('eduardo.lopes@email.com', 'PRS SE Custom 24', 'lucas@email.com', 'c', 5000, 'recusada', 20, NULL, 3),
    ('eduardo.lopes@email.com', 'PRS SE Custom 24', 'lucas@email.com', 'c', 5500, 'expirada', 96, NULL, NULL),
    ('rafael.teixeira@email.com', 'Giannini G-100 Standard Strato', 'bruno.castro@email.com', 'c', 550, 'recusada', 30, NULL, 5),
    ('vinicius.martins@email.com', 'Strinberg EGS-216', 'larissa.monteiro@email.com', 'c', 500, 'expirada', 40, NULL, NULL),
    ('thiago.barbosa@email.com', 'Marshall JCM800 2203', 'diego.carvalho@email.com', 'c', 12500, 'recusada', 18, NULL, 6),
    ('bruno.castro@email.com', 'Fender Twin Reverb', 'renato@email.com', 'c', 8200, 'substituida', 24, NULL, 8),
    ('bruno.castro@email.com', 'Fender Twin Reverb', 'renato@email.com', 'v', 8900, 'recusada', 32, NULL, 10),
    ('larissa.monteiro@email.com', 'Boss Katana-50 MkII', 'gustavo.pereira@email.com', 'c', 1800, 'expirada', 50, NULL, NULL),
    ('camila.rodrigues@email.com', 'Strymon BigSky', 'mariana.duarte@email.com', 'c', 3300, 'recusada', 15, NULL, 4),
    ('juliana.matos@email.com', 'Walrus Audio Slö Multi Texture Reverb', 'carolina.pinto@email.com', 'c', 2000, 'substituida', 12, NULL, 6),
    ('juliana.matos@email.com', 'Walrus Audio Slö Multi Texture Reverb', 'carolina.pinto@email.com', 'v', 2200, 'expirada', 18, NULL, NULL),
    ('isabela.ramos@email.com', 'Electro-Harmonix POG2', 'felipe.nogueira@email.com', 'c', 1100, 'recusada', 26, NULL, 2),
    ('mariana.duarte@email.com', 'Fender Telecaster American Professional II', 'lucas@email.com', 'c', 12500, 'cancelada', 22, NULL, NULL),
    ('henrique.moreira@email.com', 'Fender Player Telecaster', 'lucas@email.com', 'c', 5000, 'substituida', NULL, 535, 3),
    ('henrique.moreira@email.com', 'Fender Player Telecaster', 'lucas@email.com', 'v', 5500, 'utilizada', NULL, 532, 4),
    ('rodrigo.mendes@email.com', 'Strinberg LPS230', 'renato@email.com', 'c', 900, 'utilizada', NULL, 648, 5),
    ('ana@email.com', 'Yamaha FG800', 'patricia.souza@email.com', 'c', 1200, 'utilizada', NULL, 708, 2),
    ('rafael.teixeira@email.com', 'Boss DD-8 Digital Delay', 'ana@email.com', 'c', 800, 'substituida', NULL, 143, 5),
    ('rafael.teixeira@email.com', 'Boss DD-8 Digital Delay', 'ana@email.com', 'v', 880, 'utilizada', NULL, 138, 3),
    ('tatiane.cardoso@email.com', 'B.C. Rich Warlock Legacy Floyd Rose', 'eduardo.lopes@email.com', 'c', 5800, 'recusada', 8, NULL, 4)
    ) AS t(vendedor, titulo, comprador, autor, valor, status, horas_apos_anuncio, vivo_horas, horas_resposta)
  LOOP
    SELECT a."idAnuncio", a."idVendedor", a."dataCriacao" INTO v_anuncio, v_vendedor, v_criado
    FROM "Anuncio" a JOIN "Usuario" u ON u."idUsuario" = a."idVendedor"
    WHERE u."email" = r.vendedor AND a."titulo" = r.titulo;
    IF v_anuncio IS NULL THEN
      RAISE EXCEPTION 'Anuncio nao encontrado: % / %', r.vendedor, r.titulo;
    END IF;
    SELECT "idUsuario" INTO v_comprador FROM "Usuario" WHERE "email" = r.comprador;
    IF v_comprador IS NULL THEN
      RAISE EXCEPTION 'Comprador nao encontrado: %', r.comprador;
    END IF;

    IF r.vivo_horas IS NOT NULL THEN
      v_criado := v_agora - r.vivo_horas * interval '1 hour';
    ELSE
      v_criado := v_criado + r.horas_apos_anuncio * interval '1 hour';
    END IF;
    v_resposta := CASE WHEN r.horas_resposta IS NULL THEN NULL ELSE v_criado + r.horas_resposta * interval '1 hour' END;

    INSERT INTO "Oferta" ("valor", "status", "dataCriacao", "expiraEm", "dataResposta", "idAnuncio", "idComprador", "idAutor")
    VALUES (
      r.valor, r.status, v_criado,
      CASE WHEN r.status IN ('aceita', 'utilizada') THEN v_resposta + interval '24 hours' ELSE v_criado + interval '24 hours' END,
      v_resposta, v_anuncio, v_comprador,
      CASE r.autor WHEN 'c' THEN v_comprador ELSE v_vendedor END
    );
  END LOOP;
END $$;

-- 2) Favoritos -------------------------------------------------------------------------------------------
DO $$
DECLARE
  esperado integer := 152;
  inseridos integer;
BEGIN
  INSERT INTO "Favorito" ("idUsuario", "idAnuncio", "dataCriacao")
  SELECT u."idUsuario", a."idAnuncio",
         LEAST(GREATEST(a."dataCriacao", u."dataCadastro") + t.horas * interval '1 hour', (now() AT TIME ZONE 'UTC') - interval '1 hour')
  FROM (VALUES
    ('marcos@email.com', 'tatiane.cardoso@email.com', 'B.C. Rich Warlock Legacy Floyd Rose', 245),
    ('marcos@email.com', 'rafael.teixeira@email.com', 'Solez SLG9 Tensão Leve', 68),
    ('marcos@email.com', 'isabela.ramos@email.com', 'Electro-Harmonix POG2', 7),
    ('marcos@email.com', 'gustavo.pereira@email.com', 'MXR Phase 90', 286),
    ('marcos@email.com', 'eduardo.lopes@email.com', 'PRS SE Custom 24', 207),
    ('marcos@email.com', 'beatriz.almeida@email.com', 'Gibson Les Paul Standard 60s', 318),
    ('marcos@email.com', 'ana@email.com', 'Yamaha TRBX304', 246),
    ('lucas@email.com', 'camila.rodrigues@email.com', 'Elixir Nanoweb Light 12052', 118),
    ('lucas@email.com', 'thiago.barbosa@email.com', 'Marshall JCM800 2203', 161),
    ('lucas@email.com', 'renato@email.com', 'Cort KX300', 269),
    ('ana@email.com', 'felipe.nogueira@email.com', 'Peavey Bandit 112', 353),
    ('ana@email.com', 'marcos@email.com', 'Fender Player Jazz Bass', 22),
    ('ana@email.com', 'felipe.nogueira@email.com', 'Ibanez RG421', 366),
    ('ana@email.com', 'juliana.matos@email.com', 'Fender Precision Bass American Professional II', 334),
    ('ana@email.com', 'juliana.matos@email.com', 'Walrus Audio Slö Multi Texture Reverb', 37),
    ('ana@email.com', 'thiago.barbosa@email.com', 'D''Addario EXL110-8', 375),
    ('ana@email.com', 'henrique.moreira@email.com', 'Fender Player Telecaster', 234),
    ('ana@email.com', 'mariana.duarte@email.com', 'Meris Mercury7', 191),
    ('renato@email.com', 'felipe.nogueira@email.com', 'Ibanez RG421', 55),
    ('renato@email.com', 'henrique.moreira@email.com', 'Fender Deluxe Reverb', 29),
    ('renato@email.com', 'henrique.moreira@email.com', 'Fender Player Telecaster', 56),
    ('renato@email.com', 'beatriz.almeida@email.com', 'Vox AC30C2', 307),
    ('camila.rodrigues@email.com', 'mariana.duarte@email.com', 'Fender Telecaster American Professional II', 323),
    ('camila.rodrigues@email.com', 'felipe.nogueira@email.com', 'Ibanez RG421', 4),
    ('camila.rodrigues@email.com', 'juliana.matos@email.com', 'Fender Precision Bass American Professional II', 393),
    ('camila.rodrigues@email.com', 'felipe.nogueira@email.com', 'Electro-Harmonix Big Muff Pi', 274),
    ('camila.rodrigues@email.com', 'fernanda.gomes@email.com', 'ProCo RAT 2', 90),
    ('camila.rodrigues@email.com', 'rodrigo.mendes@email.com', 'Marshall DSL40CR', 239),
    ('felipe.nogueira@email.com', 'rodrigo.mendes@email.com', 'Electro-Harmonix Holy Grail Nano', 222),
    ('felipe.nogueira@email.com', 'gustavo.pereira@email.com', 'D''Addario EXL110 Regular Light', 72),
    ('felipe.nogueira@email.com', 'rodrigo.mendes@email.com', 'Strinberg LPS230', 365),
    ('felipe.nogueira@email.com', 'eduardo.lopes@email.com', 'Fulltone OCD', 339),
    ('juliana.matos@email.com', 'camila.rodrigues@email.com', 'Epiphone DR-100', 329),
    ('juliana.matos@email.com', 'eduardo.lopes@email.com', 'Orange Crush 20RT', 124),
    ('juliana.matos@email.com', 'eduardo.lopes@email.com', 'PRS SE Custom 24', 261),
    ('juliana.matos@email.com', 'aline.freitas@email.com', 'Boss SD-1 Super Overdrive', 41),
    ('juliana.matos@email.com', 'tatiane.cardoso@email.com', 'B.C. Rich Warlock Legacy Floyd Rose', 21),
    ('juliana.matos@email.com', 'larissa.monteiro@email.com', 'Boss VB-2 Vibrato', 25),
    ('juliana.matos@email.com', 'marcos@email.com', 'Boss SF-2 Super Flanger', 91),
    ('juliana.matos@email.com', 'beatriz.almeida@email.com', 'Vox AC30C2', 398),
    ('rafael.teixeira@email.com', 'marcos@email.com', 'Boss SF-2 Super Flanger', 188),
    ('rafael.teixeira@email.com', 'thiago.barbosa@email.com', 'Marshall JCM800 2203', 332),
    ('rafael.teixeira@email.com', 'mariana.duarte@email.com', 'Fender Telecaster American Professional II', 234),
    ('beatriz.almeida@email.com', 'mariana.duarte@email.com', 'Giannini Start N14', 60),
    ('beatriz.almeida@email.com', 'renato@email.com', 'Squier Affinity Precision Bass PJ', 296),
    ('beatriz.almeida@email.com', 'natalia.correia@email.com', 'Dunlop Fuzz Face Mini', 96),
    ('beatriz.almeida@email.com', 'rafael.teixeira@email.com', 'Marshall MG30GFX', 328),
    ('beatriz.almeida@email.com', 'larissa.monteiro@email.com', 'Boss VB-2 Vibrato', 52),
    ('thiago.barbosa@email.com', 'mariana.duarte@email.com', 'Meris Mercury7', 296),
    ('thiago.barbosa@email.com', 'marcos@email.com', 'Fender Player Stratocaster', 265),
    ('thiago.barbosa@email.com', 'juliana.matos@email.com', 'Walrus Audio Slö Multi Texture Reverb', 108),
    ('thiago.barbosa@email.com', 'aline.freitas@email.com', 'Ampeg SVT-CL', 161),
    ('thiago.barbosa@email.com', 'juliana.matos@email.com', 'Fender Precision Bass American Professional II', 37),
    ('thiago.barbosa@email.com', 'rafael.teixeira@email.com', 'Marshall MG30GFX', 67),
    ('thiago.barbosa@email.com', 'eduardo.lopes@email.com', 'Orange Crush 20RT', 243),
    ('larissa.monteiro@email.com', 'diego.carvalho@email.com', 'Strymon Timeline', 96),
    ('larissa.monteiro@email.com', 'beatriz.almeida@email.com', 'Gator GC-ELECTRIC-A Case Moldado para Guitarra', 327),
    ('larissa.monteiro@email.com', 'rafael.teixeira@email.com', 'Boss DD-8 Digital Delay', 360),
    ('larissa.monteiro@email.com', 'rafael.teixeira@email.com', 'Giannini G-100 Standard Strato', 60),
    ('diego.carvalho@email.com', 'marcos@email.com', 'Ernie Ball Super Slinky Bass', 308),
    ('diego.carvalho@email.com', 'isabela.ramos@email.com', 'Squier Affinity Stratocaster', 115),
    ('diego.carvalho@email.com', 'mariana.duarte@email.com', 'Meris Mercury7', 203),
    ('diego.carvalho@email.com', 'rodrigo.mendes@email.com', 'Electro-Harmonix Holy Grail Nano', 152),
    ('diego.carvalho@email.com', 'larissa.monteiro@email.com', 'Epiphone Les Paul Standard 50s', 261),
    ('diego.carvalho@email.com', 'marcos@email.com', 'Fender Player Stratocaster', 230),
    ('diego.carvalho@email.com', 'carolina.pinto@email.com', 'Fender Player Jaguar', 342),
    ('patricia.souza@email.com', 'rodrigo.mendes@email.com', 'Strinberg LPS230', 324),
    ('patricia.souza@email.com', 'juliana.matos@email.com', 'Martin D-28', 177),
    ('patricia.souza@email.com', 'lucas@email.com', 'Fender Player Precision Bass', 365),
    ('patricia.souza@email.com', 'mariana.duarte@email.com', 'Fender Telecaster American Professional II', 52),
    ('patricia.souza@email.com', 'thiago.barbosa@email.com', 'D''Addario EXL110-8', 219),
    ('patricia.souza@email.com', 'juliana.matos@email.com', 'Walrus Audio Slö Multi Texture Reverb', 130),
    ('patricia.souza@email.com', 'tatiane.cardoso@email.com', 'Yamaha TRBX305', 341),
    ('patricia.souza@email.com', 'carolina.pinto@email.com', 'Fender Player Jaguar', 133),
    ('gustavo.pereira@email.com', 'vinicius.martins@email.com', 'Strinberg EGS-216', 91),
    ('gustavo.pereira@email.com', 'isabela.ramos@email.com', 'Electro-Harmonix POG2', 83),
    ('gustavo.pereira@email.com', 'marcos@email.com', 'Boss SF-2 Super Flanger', 259),
    ('gustavo.pereira@email.com', 'camila.rodrigues@email.com', 'Strymon BigSky', 324),
    ('gustavo.pereira@email.com', 'larissa.monteiro@email.com', 'Boss VB-2 Vibrato', 227),
    ('mariana.duarte@email.com', 'carolina.pinto@email.com', 'Strymon Mobius', 337),
    ('mariana.duarte@email.com', 'fernanda.gomes@email.com', 'Fender Rumble 100', 262),
    ('mariana.duarte@email.com', 'diego.carvalho@email.com', 'Roland JC-120', 175),
    ('mariana.duarte@email.com', 'bruno.castro@email.com', 'Jackson JS22 Dinky', 217),
    ('bruno.castro@email.com', 'natalia.correia@email.com', 'Gibson ES-335', 397),
    ('bruno.castro@email.com', 'isabela.ramos@email.com', 'Electro-Harmonix POG2', 207),
    ('bruno.castro@email.com', 'renato@email.com', 'Cort KX300', 328),
    ('bruno.castro@email.com', 'beatriz.almeida@email.com', 'Boss CE-2W Waza Craft', 283),
    ('bruno.castro@email.com', 'henrique.moreira@email.com', 'Fender Player Telecaster', 71),
    ('bruno.castro@email.com', 'larissa.monteiro@email.com', 'Boss VB-2 Vibrato', 318),
    ('bruno.castro@email.com', 'rafael.teixeira@email.com', 'Giannini G-100 Standard Strato', 95),
    ('isabela.ramos@email.com', 'beatriz.almeida@email.com', 'Boss CE-2W Waza Craft', 32),
    ('isabela.ramos@email.com', 'camila.rodrigues@email.com', 'B.C. Rich Warlock Mk3', 103),
    ('isabela.ramos@email.com', 'alexandre.fonseca@email.com', 'Boss TR-2 Tremolo', 220),
    ('isabela.ramos@email.com', 'larissa.monteiro@email.com', 'Epiphone Les Paul Standard 50s', 389),
    ('isabela.ramos@email.com', 'felipe.nogueira@email.com', 'Ernie Ball Extra Slinky', 72),
    ('isabela.ramos@email.com', 'carolina.pinto@email.com', 'Strymon Mobius', 346),
    ('eduardo.lopes@email.com', 'ana@email.com', 'Yamaha TRBX304', 331),
    ('eduardo.lopes@email.com', 'mariana.duarte@email.com', 'Fender Telecaster American Professional II', 246),
    ('eduardo.lopes@email.com', 'juliana.matos@email.com', 'Walrus Audio Slö Multi Texture Reverb', 157),
    ('eduardo.lopes@email.com', 'beatriz.almeida@email.com', 'Vox AC30C2', 250),
    ('eduardo.lopes@email.com', 'larissa.monteiro@email.com', 'Epiphone Les Paul Standard 50s', 237),
    ('eduardo.lopes@email.com', 'diego.carvalho@email.com', 'Strymon Timeline', 155),
    ('eduardo.lopes@email.com', 'isabela.ramos@email.com', 'Squier Affinity Stratocaster', 212),
    ('eduardo.lopes@email.com', 'larissa.monteiro@email.com', 'Boss Katana-50 MkII', 219),
    ('fernanda.gomes@email.com', 'mariana.duarte@email.com', 'Giannini Start N14', 47),
    ('fernanda.gomes@email.com', 'beatriz.almeida@email.com', 'Boss CE-2W Waza Craft', 120),
    ('fernanda.gomes@email.com', 'juliana.matos@email.com', 'Elixir Nanoweb Custom Light 12027', 100),
    ('fernanda.gomes@email.com', 'marcos@email.com', 'Fender Player Jazzmaster', 159),
    ('fernanda.gomes@email.com', 'camila.rodrigues@email.com', 'Strymon BigSky', 25),
    ('fernanda.gomes@email.com', 'beatriz.almeida@email.com', 'Vox AC30C2', 262),
    ('vinicius.martins@email.com', 'mariana.duarte@email.com', 'Fender Telecaster American Professional II', 231),
    ('vinicius.martins@email.com', 'felipe.nogueira@email.com', 'Electro-Harmonix Big Muff Pi', 26),
    ('vinicius.martins@email.com', 'beatriz.almeida@email.com', 'Boss CE-2W Waza Craft', 70),
    ('aline.freitas@email.com', 'beatriz.almeida@email.com', 'Vox AC30C2', 83),
    ('aline.freitas@email.com', 'isabela.ramos@email.com', 'Squier Affinity Stratocaster', 323),
    ('aline.freitas@email.com', 'juliana.matos@email.com', 'Walrus Audio Slö Multi Texture Reverb', 5),
    ('aline.freitas@email.com', 'marcos@email.com', 'Boss SF-2 Super Flanger', 278),
    ('henrique.moreira@email.com', 'felipe.nogueira@email.com', 'Ibanez RG421', 150),
    ('henrique.moreira@email.com', 'marcos@email.com', 'Fender Player Jazzmaster', 262),
    ('henrique.moreira@email.com', 'gustavo.pereira@email.com', 'MXR Phase 90', 333),
    ('carolina.pinto@email.com', 'gustavo.pereira@email.com', 'Taylor 214ce', 75),
    ('carolina.pinto@email.com', 'beatriz.almeida@email.com', 'Boss CE-2W Waza Craft', 243),
    ('carolina.pinto@email.com', 'camila.rodrigues@email.com', 'B.C. Rich Warlock Mk3', 6),
    ('carolina.pinto@email.com', 'mariana.duarte@email.com', 'Meris Mercury7', 143),
    ('carolina.pinto@email.com', 'camila.rodrigues@email.com', 'Strymon BigSky', 45),
    ('carolina.pinto@email.com', 'juliana.matos@email.com', 'Fender Precision Bass American Professional II', 73),
    ('leonardo.ribeiro@email.com', 'beatriz.almeida@email.com', 'Boss CE-2W Waza Craft', 173),
    ('leonardo.ribeiro@email.com', 'patricia.souza@email.com', 'Yamaha C40', 136),
    ('leonardo.ribeiro@email.com', 'henrique.moreira@email.com', 'TC Electronic Flashback 2', 99),
    ('leonardo.ribeiro@email.com', 'bruno.castro@email.com', 'Fender Twin Reverb', 312),
    ('leonardo.ribeiro@email.com', 'isabela.ramos@email.com', 'Squier Affinity Stratocaster', 197),
    ('leonardo.ribeiro@email.com', 'felipe.nogueira@email.com', 'Electro-Harmonix Big Muff Pi', 260),
    ('natalia.correia@email.com', 'juliana.matos@email.com', 'Martin D-28', 395),
    ('natalia.correia@email.com', 'beatriz.almeida@email.com', 'Gibson Les Paul Standard 60s', 96),
    ('natalia.correia@email.com', 'camila.rodrigues@email.com', 'Epiphone DR-100', 304),
    ('rodrigo.mendes@email.com', 'marcos@email.com', 'Fender Player Stratocaster', 157),
    ('rodrigo.mendes@email.com', 'juliana.matos@email.com', 'Walrus Audio Slö Multi Texture Reverb', 80),
    ('rodrigo.mendes@email.com', 'diego.carvalho@email.com', 'Strymon Timeline', 244),
    ('tatiane.cardoso@email.com', 'marcos@email.com', 'Fender Player Stratocaster', 292),
    ('tatiane.cardoso@email.com', 'thiago.barbosa@email.com', 'Marshall JCM800 2203', 245),
    ('tatiane.cardoso@email.com', 'marcos@email.com', 'Ibanez Tube Screamer TS9', 356),
    ('tatiane.cardoso@email.com', 'thiago.barbosa@email.com', 'D''Addario EXL110-8', 49),
    ('tatiane.cardoso@email.com', 'diego.carvalho@email.com', 'Strymon Timeline', 98),
    ('tatiane.cardoso@email.com', 'natalia.correia@email.com', 'Gibson ES-335', 373),
    ('tatiane.cardoso@email.com', 'henrique.moreira@email.com', 'Fender Player Telecaster', 232),
    ('alexandre.fonseca@email.com', 'marcos@email.com', 'Fender Player Stratocaster', 196),
    ('alexandre.fonseca@email.com', 'beatriz.almeida@email.com', 'Boss CE-2W Waza Craft', 219),
    ('alexandre.fonseca@email.com', 'ana@email.com', 'Yamaha TRBX304', 138),
    ('alexandre.fonseca@email.com', 'isabela.ramos@email.com', 'Squier Affinity Stratocaster', 339),
    ('alexandre.fonseca@email.com', 'rafael.teixeira@email.com', 'Giannini G-100 Standard Strato', 49),
    ('alexandre.fonseca@email.com', 'mariana.duarte@email.com', 'Fender Telecaster American Professional II', 154),
    ('alexandre.fonseca@email.com', 'mariana.duarte@email.com', 'Meris Mercury7', 103)
  ) AS t(usuario, vendedor, titulo, horas)
  JOIN "Usuario" u ON u."email" = t.usuario
  JOIN "Usuario" v ON v."email" = t.vendedor
  JOIN "Anuncio" a ON a."idVendedor" = v."idUsuario" AND a."titulo" = t.titulo;

  GET DIAGNOSTICS inseridos = ROW_COUNT;
  IF inseridos <> esperado THEN
    RAISE EXCEPTION 'Favoritos inseridos (%) diferente do esperado (%): algum usuario ou anuncio nao foi encontrado', inseridos, esperado;
  END IF;
END $$;

COMMIT;

-- Conferencia (rode separado):
-- SELECT "status", count(*) FROM "Oferta" GROUP BY 1 ORDER BY 2 DESC;      -- total 29
-- SELECT count(*) FROM "Favorito";                                          -- 152
-- SELECT a."titulo", o."valor", o."status", o."expiraEm" FROM "Oferta" o JOIN "Anuncio" a USING ("idAnuncio") WHERE o."status" IN ('pendente','aceita') ORDER BY o."expiraEm";
