-- Headstock | Parte 8 de N: MENSAGENS (chat) e DENUNCIAS
-- Requer as Partes 6 (ofertas) e 7 (pedidos). Rode UMA vez.
--
-- MENSAGENS (RF10), em tres grupos, todos em ordem cronologica (os ids seguem o horario):
--   1) 41 mensagens AUTOMATICAS das ofertas, geradas a partir da tabela "Oferta" com o mesmo texto que a API grava:
--      "Fiz uma proposta de R$ ...", "Fiz uma contraproposta de R$ ...", "Aceitei a proposta de R$ ..." e "Recusei a proposta de R$ ...".
--   2) 111 mensagens escritas por pessoas: perguntas antes de propor (sempre ANTES da primeira oferta), perguntas gerais nos
--      anuncios, duas conversas sem anuncio, a logistica dos 17 pedidos (pagamento, rastreio, chegada, atraso, cancelamento),
--      as conversas das 4 disputas e a tentativa de golpe do usuario banido.
--   Todas ficam depois da criacao do anuncio e do cadastro dos dois usuarios, e nunca no futuro.
--   Obs.: "idAnuncio" de uma mensagem pode ser nulo (conversa sem anuncio), como a API permite.
--
-- DENUNCIAS (RF13): 12 denuncias, cada uma com exatamente UM alvo (anuncio, usuario ou mensagem):
--   resolvida: 6 | em_analise: 2 | aberta: 2 | descartada: 2
--   * as denuncias abertas ainda aparecem na fila do administrador; as demais foram analisadas pelo admin (idAdministrador);
--   * dois alvos sao mensagens (a tentativa de golpe do banido e o xingamento ao vendedor); quem denuncia participa da conversa;
--   * as resolvidas batem com o que ja esta nos dados: anuncio removido (Parte 4), banimento do usuario e anuncios pausados,
--     estorno e cancelamento de venda (Parte 7).
--
-- Horarios relativos a AGORA usam a hora em que o script roda.

BEGIN;

-- Valor em reais como a API escreve (toLocaleString pt-BR: "R$" + espaco sem quebra + 6.600,00)
CREATE FUNCTION pg_temp.brl(v numeric) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT 'R$' || chr(160) || replace(replace(replace(to_char(v, 'FM999,999,990.00'), ',', '#'), '.', ','), '#', '.')
$$;

CREATE TEMP TABLE msgs (
  seq bigserial,
  ts timestamp NOT NULL,
  remetente integer NOT NULL,
  destinatario integer NOT NULL,
  anuncio integer,
  conteudo text NOT NULL
) ON COMMIT DROP;

-- 1) Mensagens automaticas das ofertas ------------------------------------------------------------------------
INSERT INTO msgs (ts, remetente, destinatario, anuncio, conteudo)
SELECT o."dataCriacao", o."idAutor",
       CASE WHEN o."idAutor" = o."idComprador" THEN a."idVendedor" ELSE o."idComprador" END,
       o."idAnuncio",
       CASE WHEN o."idAutor" = o."idComprador" THEN 'Fiz uma proposta de ' ELSE 'Fiz uma contraproposta de ' END || pg_temp.brl(o."valor") || '.'
FROM "Oferta" o JOIN "Anuncio" a ON a."idAnuncio" = o."idAnuncio";

-- quem responde e sempre a outra parte (quem NAO fez a proposta)
INSERT INTO msgs (ts, remetente, destinatario, anuncio, conteudo)
SELECT o."dataResposta",
       CASE WHEN o."idAutor" = o."idComprador" THEN a."idVendedor" ELSE o."idComprador" END,
       o."idAutor",
       o."idAnuncio",
       CASE WHEN o."status" = 'recusada' THEN 'Recusei a proposta de ' ELSE 'Aceitei a proposta de ' END || pg_temp.brl(o."valor") || '.'
FROM "Oferta" o JOIN "Anuncio" a ON a."idAnuncio" = o."idAnuncio"
WHERE o."status" IN ('aceita', 'utilizada', 'recusada');

-- 2) Conversas escritas por pessoas -------------------------------------------------------------------------------
DO $$
DECLARE
  r record;
  v_agora timestamp := now() AT TIME ZONE 'UTC';
  v_vendedor integer;
  v_comprador integer;
  v_anuncio integer;
  v_base timestamp;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
    ('marcos@email.com', 'Fender Player Jazzmaster', 'lucas@email.com', 'c', 'o', -5, 'Oi Marcos! A Jazzmaster tem algum problema no tremolo ou nos captadores?'),
    ('marcos@email.com', 'Fender Player Jazzmaster', 'lucas@email.com', 'v', 'o', -4.2, 'Oi Lucas! Está tudo original e funcionando. Regulei há duas semanas e a afinação não foge.'),
    ('marcos@email.com', 'Fender Player Jazzmaster', 'lucas@email.com', 'c', 'o', -3.6, 'Perfeito! E ela segura bem pedal de fuzz e muito reverb? Quero usar para shoegaze.'),
    ('marcos@email.com', 'Fender Player Jazzmaster', 'lucas@email.com', 'v', 'o', -3.1, 'Segura sim, é a minha guitarra de ambiente. Os captadores são bem limpos e abertos.'),
    ('marcos@email.com', 'Fender Player Jazzmaster', 'lucas@email.com', 'v', 'o', 1.5, 'Vi sua proposta. Deixa eu pensar com calma e te respondo ainda hoje.'),
    ('marcos@email.com', 'Fender Player Stratocaster', 'ana@email.com', 'c', 'o', -2.5, 'Boa tarde! A Strat tem algum arranhão no braço ou no verniz?'),
    ('marcos@email.com', 'Fender Player Stratocaster', 'ana@email.com', 'v', 'o', -2, 'Boa tarde, Ana! Só um risquinho quase invisível na parte de trás do corpo. O braço está perfeito.'),
    ('marcos@email.com', 'Fender Player Stratocaster', 'ana@email.com', 'c', 'o', 18.2, 'Fechado em R$ 6.400! Vou pagar agora pelo site.'),
    ('marcos@email.com', 'Fender Player Stratocaster', 'ana@email.com', 'v', 'o', 18.6, 'Combinado! Assim que o pagamento cair eu separo o envio.'),
    ('natalia.correia@email.com', 'Gibson ES-335', 'thiago.barbosa@email.com', 'c', 'o', -6, 'Boa noite! A ES-335 vem com o case original? Teve alguma restauração?'),
    ('natalia.correia@email.com', 'Gibson ES-335', 'thiago.barbosa@email.com', 'v', 'o', -5, 'Boa noite, Thiago! Vem com o case original e sem nenhuma restauração, só troca de cordas.'),
    ('natalia.correia@email.com', 'Gibson ES-335', 'thiago.barbosa@email.com', 'c', 'o', -4, 'Perfeito. Vou fazer uma proposta, tudo bem?'),
    ('natalia.correia@email.com', 'Gibson ES-335', 'thiago.barbosa@email.com', 'v', 'o', 20, 'Obrigada pela proposta! Está um pouco abaixo do que pretendo, deixa eu avaliar.'),
    ('felipe.nogueira@email.com', 'Ibanez RG421', 'renato@email.com', 'c', 'o', -3, 'Fala Felipe! A RG421 tem folga no braço?'),
    ('felipe.nogueira@email.com', 'Ibanez RG421', 'renato@email.com', 'v', 'o', -2.6, 'Fala Renato! Sem folga nenhuma, braço firme e trastes com bastante vida.'),
    ('felipe.nogueira@email.com', 'Ibanez RG421', 'renato@email.com', 'c', 'o', -2.2, 'Beleza, vou te fazer uma proposta então.'),
    ('diego.carvalho@email.com', 'Strymon Timeline', 'juliana.matos@email.com', 'c', 'o', -8, 'Oi Diego! O Timeline vem com a fonte e a caixa?'),
    ('diego.carvalho@email.com', 'Strymon Timeline', 'juliana.matos@email.com', 'v', 'o', -7.4, 'Oi Juliana! Vem com a fonte original, a caixa e o manual.'),
    ('diego.carvalho@email.com', 'Strymon Timeline', 'juliana.matos@email.com', 'c', 'o', -7, 'Ótimo, obrigada!'),
    ('carolina.pinto@email.com', 'Fender Player Jaguar', 'ana@email.com', 'c', 'o', -3, 'Oi Carolina! O trinco do braço da Jaguar está funcionando direitinho?'),
    ('carolina.pinto@email.com', 'Fender Player Jaguar', 'ana@email.com', 'v', 'o', -2.4, 'Oi Ana! Está sim, a guitarra está toda regulada.'),
    ('carolina.pinto@email.com', 'Fender Player Jaguar', 'ana@email.com', 'v', 'o', 4.2, 'Fiz uma contraproposta. É o melhor valor que consigo, tá?'),
    ('aline.freitas@email.com', 'Gibson SG Standard', 'lucas@email.com', 'c', 'o', -4, 'Oi Aline! O retoque no verniz aparece muito?'),
    ('aline.freitas@email.com', 'Gibson SG Standard', 'lucas@email.com', 'v', 'o', -3.3, 'Oi Lucas! Fica na parte de trás, perto do botão da correia. Pela frente não se nota.'),
    ('eduardo.lopes@email.com', 'PRS SE Custom 24', 'lucas@email.com', 'c', 'o', -6, 'Oi Eduardo! A PRS tem a ponte com tremolo flutuante ou é fixa?'),
    ('eduardo.lopes@email.com', 'PRS SE Custom 24', 'lucas@email.com', 'v', 'o', -5.2, 'Oi Lucas! É a ponte tremolo da PRS, ancorada no corpo. Segura bem a afinação.'),
    ('rafael.teixeira@email.com', 'Giannini G-100 Standard Strato', 'bruno.castro@email.com', 'c', 'o', -2, 'Boa noite! A Giannini precisa de alguma regulagem urgente?'),
    ('rafael.teixeira@email.com', 'Giannini G-100 Standard Strato', 'bruno.castro@email.com', 'v', 'o', -1.5, 'Boa noite! Só uma regulagem simples de altura das cordas, o resto funciona direitinho.'),
    ('rafael.teixeira@email.com', 'Giannini G-100 Standard Strato', 'bruno.castro@email.com', 'c', 'o', 6.5, 'Esse lixo não vale nem isso. Vendedor trambiqueiro, vou espalhar que você vende porcaria.'),
    ('tatiane.cardoso@email.com', 'B.C. Rich Warlock Legacy Floyd Rose', 'eduardo.lopes@email.com', 'c', 'o', -3, 'Oi Tatiane! O Floyd Rose está bem regulado? Já veio com a trava de afinação?'),
    ('tatiane.cardoso@email.com', 'B.C. Rich Warlock Legacy Floyd Rose', 'eduardo.lopes@email.com', 'v', 'o', -2.4, 'Oi Eduardo! Sim, vem com trava, chaves e um jogo de cordas sobressalente.'),
    ('beatriz.almeida@email.com', 'Gibson Les Paul Standard 60s', 'lucas@email.com', 'c', 'a', 30, 'Oi Beatriz! Dá para testar pessoalmente em Florianópolis? Estou em Curitiba.'),
    ('beatriz.almeida@email.com', 'Gibson Les Paul Standard 60s', 'lucas@email.com', 'v', 'a', 33, 'Oi Lucas! Infelizmente só envio pela plataforma, mas faço um vídeo completo tocando em cada captador.'),
    ('beatriz.almeida@email.com', 'Gibson Les Paul Standard 60s', 'lucas@email.com', 'c', 'a', 35, 'Já ajuda bastante, obrigado!'),
    ('juliana.matos@email.com', 'Martin D-28', 'mariana.duarte@email.com', 'c', 'a', 20, 'Oi Juliana! Você aceita troca por uma Taylor?'),
    ('juliana.matos@email.com', 'Martin D-28', 'mariana.duarte@email.com', 'v', 'a', 24, 'Oi Mariana! Não aceito troca, só venda. Obrigada pelo interesse!'),
    ('thiago.barbosa@email.com', 'Marshall JCM800 2203', 'larissa.monteiro@email.com', 'c', 'a', 12, 'Oi Thiago! O cabeçote funciona em 127V e 220V?'),
    ('thiago.barbosa@email.com', 'Marshall JCM800 2203', 'larissa.monteiro@email.com', 'v', 'a', 15, 'Oi Larissa! Tem chave seletora de voltagem, funciona nas duas.'),
    ('mariana.duarte@email.com', 'Giannini Start N14', 'patricia.souza@email.com', 'c', 'a', 25, 'Oi Mariana! Esse violão serve para uma criança de 10 anos?'),
    ('mariana.duarte@email.com', 'Giannini Start N14', 'patricia.souza@email.com', 'v', 'a', 27, 'Oi Patrícia! Serve sim, é de tamanho padrão, mas leve. Para tocar sentada fica ótimo.'),
    ('felipe.nogueira@email.com', 'Peavey Bandit 112', 'bruno.castro@email.com', 'c', 'a', 40, 'Fala Felipe! O Bandit tem algum ruído no canal limpo?'),
    ('felipe.nogueira@email.com', 'Peavey Bandit 112', 'bruno.castro@email.com', 'v', 'a', 44, 'Fala Bruno! Nenhum, é um amp bem silencioso. Está comigo há anos e nunca deu problema.'),
    ('beatriz.almeida@email.com', 'Vox AC30C2', 'carolina.pinto@email.com', 'c', 'a', 18, 'Oi Beatriz! O reverb de mola faz barulho quando mexe no amp?'),
    ('beatriz.almeida@email.com', 'Vox AC30C2', 'carolina.pinto@email.com', 'v', 'a', 22, 'Oi Carolina! Faz um pouco se você bater no amp com ele ligado, é normal de mola. Fora isso, perfeito.'),
    ('marcos@email.com', NULL, 'ana@email.com', 'c', 'n', 80, 'Marcos, vi que você vende uns amps valvulados. Pode indicar um bom para tocar em casa?'),
    ('marcos@email.com', NULL, 'ana@email.com', 'v', 'n', 78.5, 'Oi Ana! O Blues Junior que tenho anunciado é perfeito para casa: valvulado e dá para estourar sem acordar a vizinhança.'),
    ('marcos@email.com', NULL, 'ana@email.com', 'c', 'n', 78, 'Valeu pela dica! Vou dar uma olhada.'),
    ('beatriz.almeida@email.com', NULL, 'larissa.monteiro@email.com', 'c', 'n', 60, 'Oi Beatriz, você vai continuar vendendo o case Gator? Quero comprar depois do pagamento.'),
    ('beatriz.almeida@email.com', NULL, 'larissa.monteiro@email.com', 'v', 'n', 58, 'Vou sim! Ele fica anunciado até o fim do mês.'),
    ('ana@email.com', 'Yamaha FG800', 'patricia.souza@email.com', 'c', 'p', 1, 'Acabei de pagar! Pode enviar quando puder.'),
    ('ana@email.com', 'Yamaha FG800', 'patricia.souza@email.com', 'v', 'x', 0.4, 'Enviei hoje! Código de rastreio: BR482915307BR'),
    ('ana@email.com', 'Yamaha FG800', 'patricia.souza@email.com', 'c', 'e', 1.5, 'Chegou tudo certo, obrigado!'),
    ('rodrigo.mendes@email.com', 'Strinberg LPS230', 'renato@email.com', 'c', 'p', 2, 'Pagamento feito. Obrigado!'),
    ('rodrigo.mendes@email.com', 'Strinberg LPS230', 'renato@email.com', 'v', 'x', 0.4, 'Postei agora pouco. Rastreio: BR730166284BR'),
    ('rodrigo.mendes@email.com', 'Strinberg LPS230', 'renato@email.com', 'c', 'e', 1.5, 'Recebi hoje, está perfeito. Valeu!'),
    ('diego.carvalho@email.com', 'Roland JC-120', 'larissa.monteiro@email.com', 'c', 'p', 3, 'Paguei pelo site agora, fico no aguardo do envio.'),
    ('diego.carvalho@email.com', 'Roland JC-120', 'larissa.monteiro@email.com', 'v', 'x', 0.4, 'Já está a caminho. Código dos Correios: BR118840926BR'),
    ('diego.carvalho@email.com', 'Roland JC-120', 'larissa.monteiro@email.com', 'c', 'e', 1.5, 'Chegou! Muito bem embalado, obrigado.'),
    ('henrique.moreira@email.com', 'Fender Player Telecaster', 'lucas@email.com', 'c', 'p', 1, 'Pagamento confirmado, aguardando o envio.'),
    ('henrique.moreira@email.com', 'Fender Player Telecaster', 'lucas@email.com', 'v', 'x', 0.4, 'Despachei! O rastreio é BR906352418BR'),
    ('henrique.moreira@email.com', 'Fender Player Telecaster', 'lucas@email.com', 'c', 'e', 1.5, 'Tudo certo com o item, obrigado pela negociação.'),
    ('isabela.ramos@email.com', 'Gibson J-45 Standard', 'beatriz.almeida@email.com', 'c', 'p', 2, 'Acabei de pagar! Pode enviar quando puder.'),
    ('isabela.ramos@email.com', 'Gibson J-45 Standard', 'beatriz.almeida@email.com', 'v', 'x', 0.4, 'Enviei hoje! Código de rastreio: BR254718093BR'),
    ('isabela.ramos@email.com', 'Gibson J-45 Standard', 'beatriz.almeida@email.com', 'c', 'e', 1.5, 'Chegou tudo certo, obrigado!'),
    ('natalia.correia@email.com', 'Dunlop Fuzz Face Mini', 'mariana.duarte@email.com', 'c', 'p', 3, 'Pagamento feito. Obrigado!'),
    ('natalia.correia@email.com', 'Dunlop Fuzz Face Mini', 'mariana.duarte@email.com', 'v', 'x', 0.4, 'Postei agora pouco. Rastreio: BR671203845BR'),
    ('rafael.teixeira@email.com', 'Marshall MG30GFX', 'bruno.castro@email.com', 'c', 'p', 1, 'Paguei pelo site agora, fico no aguardo do envio.'),
    ('rafael.teixeira@email.com', 'Marshall MG30GFX', 'bruno.castro@email.com', 'v', 'x', 0.4, 'Já está a caminho. Código dos Correios: BR389027516BR'),
    ('rafael.teixeira@email.com', 'Marshall MG30GFX', 'bruno.castro@email.com', 'c', 'e', 1.5, 'Chegou! Muito bem embalado, obrigado.'),
    ('camila.rodrigues@email.com', 'Elixir Nanoweb Light 12052', 'juliana.matos@email.com', 'c', 'p', 2, 'Pagamento confirmado, aguardando o envio.'),
    ('camila.rodrigues@email.com', 'Elixir Nanoweb Light 12052', 'juliana.matos@email.com', 'v', 'x', 0.4, 'Despachei! O rastreio é BR540871962BR'),
    ('camila.rodrigues@email.com', 'Elixir Nanoweb Light 12052', 'juliana.matos@email.com', 'c', 'e', 1.5, 'Tudo certo com o item, obrigado pela negociação.'),
    ('felipe.nogueira@email.com', 'Ernie Ball Extra Slinky', 'thiago.barbosa@email.com', 'c', 'p', 3, 'Acabei de pagar! Pode enviar quando puder.'),
    ('felipe.nogueira@email.com', 'Ernie Ball Extra Slinky', 'thiago.barbosa@email.com', 'v', 'x', 0.4, 'Enviei hoje! Código de rastreio: BR827406139BR'),
    ('felipe.nogueira@email.com', 'Ernie Ball Extra Slinky', 'thiago.barbosa@email.com', 'c', 'e', 1.5, 'Chegou tudo certo, obrigado!'),
    ('camila.rodrigues@email.com', 'Epiphone DR-100', 'diego.carvalho@email.com', 'c', 'p', 1, 'Pagamento feito. Obrigado!'),
    ('camila.rodrigues@email.com', 'Epiphone DR-100', 'diego.carvalho@email.com', 'v', 'x', 0.4, 'Postei agora pouco. Rastreio: BR195630847BR'),
    ('fernanda.gomes@email.com', 'Fender Rumble 100', 'diego.carvalho@email.com', 'c', 'p', 2, 'Paguei pelo site agora, fico no aguardo do envio.'),
    ('aline.freitas@email.com', 'Boss SD-1 Super Overdrive', 'carolina.pinto@email.com', 'c', 'p', 3, 'Pagamento confirmado, aguardando o envio.'),
    ('aline.freitas@email.com', 'Boss SD-1 Super Overdrive', 'carolina.pinto@email.com', 'v', 'x', 0.4, 'Despachei! O rastreio é BR462081735BR'),
    ('rafael.teixeira@email.com', 'Boss DD-8 Digital Delay', 'ana@email.com', 'c', 'p', 1, 'Acabei de pagar! Pode enviar quando puder.'),
    ('rafael.teixeira@email.com', 'Boss DD-8 Digital Delay', 'ana@email.com', 'v', 'x', 0.4, 'Enviei hoje! Código de rastreio: BR758241096BR'),
    ('rafael.teixeira@email.com', 'Boss DD-8 Digital Delay', 'ana@email.com', 'c', 'e', 1.5, 'Chegou tudo certo, obrigado!'),
    ('henrique.moreira@email.com', 'TC Electronic Flashback 2', 'gustavo.pereira@email.com', 'c', 'p', 2, 'Pagamento feito. Obrigado!'),
    ('henrique.moreira@email.com', 'TC Electronic Flashback 2', 'gustavo.pereira@email.com', 'v', 'x', 0.4, 'Postei agora pouco. Rastreio: BR314958270BR'),
    ('isabela.ramos@email.com', 'Squier Affinity Stratocaster', 'leonardo.ribeiro@email.com', 'c', 'p', 3, 'Paguei pelo site agora, fico no aguardo do envio.'),
    ('tatiane.cardoso@email.com', 'B.C. Rich Warlock Legacy Floyd Rose', 'eduardo.lopes@email.com', 'c', 'p', 1, 'Pagamento confirmado, aguardando o envio.'),
    ('tatiane.cardoso@email.com', 'B.C. Rich Warlock Legacy Floyd Rose', 'eduardo.lopes@email.com', 'v', 'x', 0.4, 'Despachei! O rastreio é BR603917284BR'),
    ('renato@email.com', 'Boss DS-1 Distortion', 'felipe.nogueira@email.com', 'c', 'p', 2, 'Acabei de pagar! Pode enviar quando puder.'),
    ('fernanda.gomes@email.com', 'Fender Rumble 100', 'diego.carvalho@email.com', 'c', 'p', 100, 'Oi Fernanda, conseguiu postar o amplificador?'),
    ('fernanda.gomes@email.com', 'Fender Rumble 100', 'diego.carvalho@email.com', 'c', 'p', 150, 'Já passou do prazo de envio e ainda não vi o rastreio. Pode me atualizar?'),
    ('renato@email.com', 'Boss DS-1 Distortion', 'felipe.nogueira@email.com', 'v', 'p', 20, 'Vou postar amanhã cedo, tudo bem?'),
    ('isabela.ramos@email.com', 'Squier Affinity Stratocaster', 'leonardo.ribeiro@email.com', 'c', 'p', 60, 'Oi Isabela! Já postou a guitarra?'),
    ('isabela.ramos@email.com', 'Squier Affinity Stratocaster', 'leonardo.ribeiro@email.com', 'c', 'p', 95, 'O prazo de envio acabou e não recebi nada. Vou pedir o cancelamento pela plataforma.'),
    ('tatiane.cardoso@email.com', 'B.C. Rich Warlock Legacy Floyd Rose', 'eduardo.lopes@email.com', 'c', 'x', 2, 'Obrigado! Fico no aguardo.'),
    ('henrique.moreira@email.com', 'TC Electronic Flashback 2', 'gustavo.pereira@email.com', 'c', 'e', 10, 'O pedal não liga. Testei com duas fontes diferentes e o LED não acende.'),
    ('henrique.moreira@email.com', 'TC Electronic Flashback 2', 'gustavo.pereira@email.com', 'v', 'e', 14, 'Estranho, testei antes de enviar e estava funcionando. Consegue me mandar um vídeo?'),
    ('henrique.moreira@email.com', 'TC Electronic Flashback 2', 'gustavo.pereira@email.com', 'c', 'e', 20, 'Mandei o vídeo, mas vou abrir a disputa mesmo.'),
    ('natalia.correia@email.com', 'Dunlop Fuzz Face Mini', 'mariana.duarte@email.com', 'c', 'e', 5, 'O pedal chegou com um ruído de fundo forte, diferente do anúncio.'),
    ('natalia.correia@email.com', 'Dunlop Fuzz Face Mini', 'mariana.duarte@email.com', 'v', 'e', 8, 'Todo fuzz desse tipo tem esse chiado, faz parte do circuito. Está funcionando como deveria.'),
    ('natalia.correia@email.com', 'Dunlop Fuzz Face Mini', 'mariana.duarte@email.com', 'c', 'e', 12, 'Não era isso que a descrição dava a entender. Vou abrir uma disputa.'),
    ('camila.rodrigues@email.com', 'Epiphone DR-100', 'diego.carvalho@email.com', 'c', 'e', 3, 'O violão chegou com o tampo trincado!'),
    ('camila.rodrigues@email.com', 'Epiphone DR-100', 'diego.carvalho@email.com', 'v', 'e', 6, 'Poxa, não saiu assim daqui. Vamos resolver pela plataforma.'),
    ('camila.rodrigues@email.com', 'Epiphone DR-100', 'diego.carvalho@email.com', 'c', 'e', 8, 'Abri a disputa e anexei as fotos.'),
    ('aline.freitas@email.com', 'Boss SD-1 Super Overdrive', 'carolina.pinto@email.com', 'c', 'e', 4, 'O pedal que chegou é um SD-1W, não o SD-1 do anúncio.'),
    ('aline.freitas@email.com', 'Boss SD-1 Super Overdrive', 'carolina.pinto@email.com', 'v', 'e', 9, 'Verdade, confundi o modelo. Perdão! Aceito a devolução.'),
    ('aline.freitas@email.com', 'Boss SD-1 Super Overdrive', 'carolina.pinto@email.com', 'c', 'e', 12, 'Obrigada, vou aguardar a autorização da moderação.'),
    ('cristiano.vaz@email.com', 'Fender Player Stratocaster', 'thiago.barbosa@email.com', 'c', 'a', 5, 'Oi! A Strat ainda está disponível? O preço está bem abaixo do mercado.'),
    ('cristiano.vaz@email.com', 'Fender Player Stratocaster', 'thiago.barbosa@email.com', 'v', 'a', 6, 'Está sim! Preciso vender rápido. Faço ainda mais barato se você pagar direto no meu Pix, fora do site.'),
    ('cristiano.vaz@email.com', 'Fender Player Stratocaster', 'thiago.barbosa@email.com', 'c', 'a', 7, 'Prefiro pagar pelo site, é mais seguro.'),
    ('cristiano.vaz@email.com', 'Fender Player Stratocaster', 'thiago.barbosa@email.com', 'v', 'a', 8, 'Aí não consigo manter esse preço. Me passa seu WhatsApp que a gente resolve por fora.')
    ) AS t(vendedor, titulo, comprador, dir, ancora, horas, texto)
  LOOP
    SELECT "idUsuario" INTO v_vendedor FROM "Usuario" WHERE "email" = r.vendedor;
    SELECT "idUsuario" INTO v_comprador FROM "Usuario" WHERE "email" = r.comprador;
    IF v_vendedor IS NULL OR v_comprador IS NULL THEN RAISE EXCEPTION 'Usuario nao encontrado: % / %', r.vendedor, r.comprador; END IF;

    v_anuncio := NULL;
    IF r.titulo IS NOT NULL THEN
      SELECT "idAnuncio" INTO v_anuncio FROM "Anuncio" WHERE "idVendedor" = v_vendedor AND "titulo" = r.titulo;
      IF v_anuncio IS NULL THEN RAISE EXCEPTION 'Anuncio nao encontrado: % / %', r.vendedor, r.titulo; END IF;
    END IF;

    v_base := CASE r.ancora
      WHEN 'a' THEN (SELECT "dataCriacao" FROM "Anuncio" WHERE "idAnuncio" = v_anuncio)
      WHEN 'o' THEN (SELECT min("dataCriacao") FROM "Oferta" WHERE "idAnuncio" = v_anuncio AND "idComprador" = v_comprador)
      WHEN 'p' THEN (SELECT "dataPagamento" FROM "Pedido" WHERE "idAnuncio" = v_anuncio)
      WHEN 'x' THEN (SELECT "dataEnvio" FROM "Pedido" WHERE "idAnuncio" = v_anuncio)
      WHEN 'e' THEN (SELECT "dataEntrega" FROM "Pedido" WHERE "idAnuncio" = v_anuncio)
      WHEN 'n' THEN v_agora
    END;
    IF v_base IS NULL THEN RAISE EXCEPTION 'Sem data de referencia (%): % / %', r.ancora, r.vendedor, r.titulo; END IF;

    INSERT INTO msgs (ts, remetente, destinatario, anuncio, conteudo)
    VALUES (
      CASE WHEN r.ancora = 'n' THEN v_base - r.horas * interval '1 hour' ELSE v_base + r.horas * interval '1 hour' END,
      CASE r.dir WHEN 'c' THEN v_comprador ELSE v_vendedor END,
      CASE r.dir WHEN 'c' THEN v_vendedor ELSE v_comprador END,
      v_anuncio, r.texto
    );
  END LOOP;
END $$;

-- 3) Grava tudo em ordem cronologica ----------------------------------------------------------------------------------
INSERT INTO "Mensagem" ("conteudo", "dataEnvio", "idRemetente", "idDestinatario", "idAnuncio")
SELECT conteudo, ts, remetente, destinatario, anuncio FROM msgs ORDER BY ts, seq;

-- 4) Denuncias --------------------------------------------------------------------------------------------------------
DO $$
DECLARE
  r record;
  v_agora timestamp := now() AT TIME ZONE 'UTC';
  v_admin integer;
  v_autor integer;
  v_vendedor integer;
  v_comprador integer;
  v_anuncio integer;
  v_usuario integer;
  v_mensagem integer;
  v_base timestamp;
BEGIN
  SELECT "idUsuario" INTO v_admin FROM "Usuario" WHERE "email" = 'admin@headstock.dev';
  FOR r IN
    SELECT * FROM (VALUES
    ('lucas@email.com', 'anuncio', 'gustavo.pereira@email.com', 'Ibanez RG550 Genesis Collection', NULL, NULL, NULL, 'Anúncio falso ou golpe', 'As fotos não parecem ser do instrumento anunciado: o acabamento da guitarra da foto é diferente do descrito.', 'resolvida', 'Anúncio removido pela moderação: as fotos eram de outro instrumento.', 'a', 20),
    ('thiago.barbosa@email.com', 'mensagem', 'cristiano.vaz@email.com', 'Fender Player Stratocaster', 'thiago.barbosa@email.com', 'v', 'Está sim! Preciso vender rápido. Faço ainda mais barato se você pagar direto no meu Pix, fora do site.', 'Anúncio falso ou golpe', 'O vendedor pediu para eu pagar por fora do site, direto no Pix dele, em troca de desconto.', 'resolvida', 'Usuário banido e anúncios pausados por tentar negociar fora da plataforma (RF15).', 'm', 3),
    ('thiago.barbosa@email.com', 'anuncio', 'cristiano.vaz@email.com', 'Fender Player Stratocaster', NULL, NULL, NULL, 'Informações enganosas', 'O preço está muito abaixo do mercado e o vendedor tenta fechar fora do site. Parece golpe.', 'resolvida', 'Anúncio pausado pela moderação junto com o banimento do vendedor.', 'a', 30),
    ('bruno.castro@email.com', 'usuario', 'cristiano.vaz@email.com', NULL, NULL, NULL, NULL, 'Outro', 'Fui contatado pelo vendedor, que ofereceu desconto para eu pagar direto no Pix dele, sem passar pela plataforma.', 'resolvida', 'Usuário banido por tentar negociar fora da plataforma.', 'n', 1000),
    ('rafael.teixeira@email.com', 'mensagem', 'rafael.teixeira@email.com', 'Giannini G-100 Standard Strato', 'bruno.castro@email.com', 'c', 'Esse lixo não vale nem isso. Vendedor trambiqueiro, vou espalhar que você vende porcaria.', 'Conteúdo ofensivo', 'O comprador me xingou e me ameaçou depois que recusei a proposta dele.', 'em_analise', NULL, 'm', 2),
    ('lucas@email.com', 'anuncio', 'beatriz.almeida@email.com', 'Gibson Les Paul Standard 60s', NULL, NULL, NULL, 'Informações enganosas', 'O anúncio diz que a guitarra tem certificado, mas nenhuma foto mostra o certificado.', 'aberta', NULL, 'n', 50),
    ('ana@email.com', 'anuncio', 'vinicius.martins@email.com', 'Strinberg EGS-216', NULL, NULL, NULL, 'Outro', 'A descrição não menciona que a saída de áudio tem mau contato, como vi nas fotos e no vídeo.', 'aberta', NULL, 'n', 20),
    ('gustavo.pereira@email.com', 'usuario', 'henrique.moreira@email.com', NULL, NULL, NULL, NULL, 'Anúncio falso ou golpe', 'Comprei um pedal que chegou sem funcionar e o vendedor não colabora para resolver.', 'em_analise', NULL, 'n', 20),
    ('mariana.duarte@email.com', 'anuncio', 'thiago.barbosa@email.com', 'Marshall JCM800 2203', NULL, NULL, NULL, 'Informações enganosas', 'O ano de fabricação (1989) parece improvável para esse número de série.', 'descartada', 'Denúncia descartada: o modelo 2203 foi fabricado até 1989 e o vendedor enviou fotos do número de série.', 'a', 100),
    ('carolina.pinto@email.com', 'anuncio', 'vinicius.martins@email.com', 'Meteoro Vulcano G200', NULL, NULL, NULL, 'Outro', 'Acho que o amplificador é uma réplica, o painel não parece original.', 'descartada', 'Denúncia descartada: não há indícios de falsificação; o vendedor comprovou a origem.', 'a', 200),
    ('diego.carvalho@email.com', 'anuncio', 'camila.rodrigues@email.com', 'Epiphone DR-100', NULL, NULL, NULL, 'Informações enganosas', 'O violão chegou com o tampo trincado e o anúncio dizia só "pequenas marcas".', 'resolvida', 'Disputa do pedido resolvida com estorno ao comprador; vendedora orientada a descrever danos nas próximas vendas.', 'n', 140),
    ('leonardo.ribeiro@email.com', 'anuncio', 'isabela.ramos@email.com', 'Squier Affinity Stratocaster', NULL, NULL, NULL, 'Outro', 'Paguei e a vendedora não postou o instrumento dentro de 3 dias úteis.', 'resolvida', 'Venda cancelada pela moderação: o prazo de envio não foi cumprido. O anúncio voltou a ficar ativo.', 'n', 60)
    ) AS t(autor, tipo, ref1, ref2, ref3, ref4, ref5, motivo, descricao, status, resolucao, ancora, horas)
  LOOP
    SELECT "idUsuario" INTO v_autor FROM "Usuario" WHERE "email" = r.autor;
    IF v_autor IS NULL THEN RAISE EXCEPTION 'Autor nao encontrado: %', r.autor; END IF;
    v_anuncio := NULL; v_usuario := NULL; v_mensagem := NULL; v_base := NULL;

    IF r.tipo = 'anuncio' THEN
      SELECT a."idAnuncio", a."dataCriacao" INTO v_anuncio, v_base
      FROM "Anuncio" a JOIN "Usuario" u ON u."idUsuario" = a."idVendedor" WHERE u."email" = r.ref1 AND a."titulo" = r.ref2;
      IF v_anuncio IS NULL THEN RAISE EXCEPTION 'Anuncio denunciado nao encontrado: % / %', r.ref1, r.ref2; END IF;
    ELSIF r.tipo = 'usuario' THEN
      SELECT "idUsuario" INTO v_usuario FROM "Usuario" WHERE "email" = r.ref1;
      IF v_usuario IS NULL THEN RAISE EXCEPTION 'Usuario denunciado nao encontrado: %', r.ref1; END IF;
    ELSE
      SELECT "idUsuario" INTO v_vendedor FROM "Usuario" WHERE "email" = r.ref1;
      SELECT "idUsuario" INTO v_comprador FROM "Usuario" WHERE "email" = r.ref3;
      SELECT m."idMensagem", m."dataEnvio" INTO v_mensagem, v_base
      FROM "Mensagem" m
      WHERE m."conteudo" = r.ref5
        AND m."idRemetente" = CASE r.ref4 WHEN 'c' THEN v_comprador ELSE v_vendedor END
        AND m."idDestinatario" = CASE r.ref4 WHEN 'c' THEN v_vendedor ELSE v_comprador END;
      IF v_mensagem IS NULL THEN RAISE EXCEPTION 'Mensagem denunciada nao encontrada: %', left(r.ref5, 40); END IF;
    END IF;

    INSERT INTO "Denuncia" ("motivo", "descricaoTextual", "status", "dataCriacao", "resolucao", "idAutor", "idAdministrador", "idAnuncio", "idUsuarioDenunciado", "idMensagem")
    VALUES (
      r.motivo, r.descricao, r.status,
      CASE WHEN r.ancora = 'n' THEN v_agora - r.horas * interval '1 hour' ELSE v_base + r.horas * interval '1 hour' END,
      r.resolucao, v_autor,
      CASE WHEN r.status = 'aberta' THEN NULL ELSE v_admin END,
      v_anuncio, v_usuario, v_mensagem
    );
  END LOOP;
END $$;

COMMIT;

-- Conferencia (rode separado):
-- SELECT count(*) FROM "Mensagem";                                             -- 152
-- SELECT "status", count(*) FROM "Denuncia" GROUP BY 1 ORDER BY 2 DESC;        -- total 12
-- SELECT m."dataEnvio", r."nome" AS de, d."nome" AS para, m."conteudo" FROM "Mensagem" m
--   JOIN "Usuario" r ON r."idUsuario" = m."idRemetente" JOIN "Usuario" d ON d."idUsuario" = m."idDestinatario" ORDER BY 1 DESC LIMIT 15;
