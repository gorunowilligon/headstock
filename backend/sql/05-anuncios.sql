-- Headstock | Parte 4 de N: ANUNCIOS (e a copia do instrumento de cada um)
-- Requer as Partes 1, 2, 3, 3b (03b-ids-numericos) e 3c (03c-ids-numericos-restante). Rode UMA vez.
--
-- Cria 87 anuncios. Para cada um, o script:
--   1) copia o modelo do catalogo mestre ("Instrumento" com noCatalogo = true) para uma linha NOVA, com noCatalogo = false
--      (cada anuncio tem o seu proprio instrumento, que o vendedor pode editar sem mexer no catalogo);
--   2) acrescenta a essa copia o ano de fabricacao e o acabamento (campos especificos daquele exemplar);
--   3) cria o anuncio apontando para o vendedor (pelo e-mail) e para a copia do instrumento.
-- Os ids sao numericos e gerados pelo banco. Se algum modelo ou e-mail nao existir, o script para e nada e gravado.
--
-- Titulo = "marca modelo" (como a API faz). Precos em reais, datas entre agosto e novembro de 2026,
-- sempre depois do cadastro do vendedor.
--
-- Situacoes incluidas: ativo: 75 | pausado: 4 | removido: 1 | vendido: 7
--   vendido  -> serao usados como base dos pedidos na Parte 7
--   pausado  -> inclui os 2 anuncios do usuario banido (a moderacao pausa os anuncios dele, RF15)
--   removido -> anuncio retirado pela moderacao (nao aparece em nenhuma listagem)
--
-- ATENCAO: ainda sem fotos. A Parte 5 inclui as fotos (a API aceita anuncios sem fotos, mas o RF02 pede no minimo 3).
--
-- Por categoria: Guitarras: 26 | Baixos: 6 | Violões: 7 | Amplificadores: 15 | Pedais/Efeitos: 23 | Acessórios: 10

BEGIN;

DO $$
DECLARE
  r record;
  v_vendedor integer;
  v_instrumento integer;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
    ('marcos@email.com', 'Fender', 'Player Stratocaster', 6800, 'Usado · Excelente', 'São Paulo, SP', 'Sunburst de 3 cores, regulada pelo luthier no mês passado. Acompanha gig bag original e a alavanca.', true, 'ativo', '2026-08-01 00:00:00', '{"anoFabricacao":2022,"corAcabamento":"3-Color Sunburst"}'::jsonb),
    ('marcos@email.com', 'Fender', 'Player Jazzmaster', 7400, 'Seminovo', 'São Paulo, SP', 'Perfeita para shoegaze: o tremolo funciona liso e a afinação não foge. Pouquíssimo uso, só toquei em casa.', true, 'ativo', '2026-11-03 15:46:04', '{"anoFabricacao":2023,"corAcabamento":"Capri Orange"}'::jsonb),
    ('marcos@email.com', 'Squier', 'Classic Vibe 60s Jazzmaster', 3900, 'Usado · Muito bom', 'São Paulo, SP', 'Ótimo custo-benefício para quem quer o timbre de Jazzmaster. Alguns arranhões leves no verniz, nada que afete o som.', true, 'ativo', '2026-10-26 07:32:09', '{"anoFabricacao":2021,"corAcabamento":"Surf Green"}'::jsonb),
    ('felipe.nogueira@email.com', 'Ibanez', 'RG421', 2400, 'Usado · Muito bom', 'Campinas, SP', 'Tocada em ensaios, sempre cuidada. Braço rápido, trastes com bastante vida. Troco por pedal se for interessante.', true, 'ativo', '2026-10-17 23:18:14', '{"anoFabricacao":2021,"corAcabamento":"Preta"}'::jsonb),
    ('renato@email.com', 'Cort', 'KX300', 3100, 'Usado · Excelente', 'Porto Alegre, RS', 'Captadores EMG, ponte fixa que segura afinação o dia todo. Estou vendendo para fechar a compra de uma 7 cordas.', true, 'ativo', '2026-10-09 15:04:19', '{"anoFabricacao":2020,"corAcabamento":"Open Pore Raw Burst"}'::jsonb),
    ('camila.rodrigues@email.com', 'B.C. Rich', 'Warlock Mk3', 2100, 'Usado · Bom', 'Rio de Janeiro, RJ', 'Visual agressivo e som pesado. Tem marcas de uso no corpo, mas está toda funcional. Cordas novas.', true, 'ativo', '2026-10-01 06:50:24', '{"anoFabricacao":2019,"corAcabamento":"Preta"}'::jsonb),
    ('rafael.teixeira@email.com', 'Giannini', 'G-100 Standard Strato', 700, 'Usado · Bom', 'Recife, PE', 'Minha primeira guitarra, ótima para começar. Eletrônica toda funcionando, só precisa de uma regulagem simples.', true, 'ativo', '2026-09-22 22:36:28', '{"anoFabricacao":2015,"corAcabamento":"Preta"}'::jsonb),
    ('thiago.barbosa@email.com', 'Tagima', 'Memphis MG-30', 950, 'Usado · Muito bom', 'Goiânia, GO', 'Guitarra de entrada, em bom estado. Acompanha capa simples e cabo.', true, 'ativo', '2026-09-14 14:22:33', '{"anoFabricacao":2020,"corAcabamento":"Branca"}'::jsonb),
    ('beatriz.almeida@email.com', 'Gibson', 'Les Paul Standard 60s', 21500, 'Usado · Excelente', 'Florianópolis, SC', 'Les Paul impecável, com case rígido original e certificado. Sem retoques, sem trincas. Aceito visita para testar.', false, 'ativo', '2026-09-06 06:08:38', '{"anoFabricacao":2021,"corAcabamento":"Iced Tea"}'::jsonb),
    ('larissa.monteiro@email.com', 'Epiphone', 'Les Paul Standard 50s', 3600, 'Usado · Muito bom', 'Brasília, DF', 'Cuidada, com os trastes recém-nivelados. Captadores originais, timbre cheio.', true, 'ativo', '2026-08-28 21:54:43', '{"anoFabricacao":2022,"corAcabamento":"Heritage Cherry Sunburst"}'::jsonb),
    ('diego.carvalho@email.com', 'Epiphone', 'SG Standard', 2900, 'Seminovo', 'Fortaleza, CE', 'Quase sem uso. Leve e confortável, ótima para quem toca por horas.', true, 'pausado', '2026-08-20 13:40:48', '{"anoFabricacao":2023,"corAcabamento":"Heritage Cherry"}'::jsonb),
    ('gustavo.pereira@email.com', 'Ibanez', 'RG550 Genesis Collection', 7800, 'Usado · Excelente', 'Santos, SP', 'Reedição da lendária RG550, Floyd Rose funcionando perfeitamente. Estado de colecionador.', true, 'removido', '2026-08-12 05:26:52', '{"anoFabricacao":2019,"corAcabamento":"Desert Sun Yellow"}'::jsonb),
    ('mariana.duarte@email.com', 'Fender', 'Telecaster American Professional II', 14900, 'Seminovo', 'Vitória, ES', 'Americana, comprada em viagem. Usada em poucos ensaios. Acompanha case e papelada.', true, 'ativo', '2026-08-03 21:12:57', '{"anoFabricacao":2023,"corAcabamento":"Miami Blue"}'::jsonb),
    ('bruno.castro@email.com', 'Jackson', 'JS22 Dinky', 1800, 'Usado · Bom', 'Belém, PA', 'Boa para metal e hard rock. Tem o verniz marcado perto do braço, mas funciona perfeitamente.', true, 'ativo', '2026-11-06 12:59:02', '{"anoFabricacao":2018,"corAcabamento":"Preta"}'::jsonb),
    ('isabela.ramos@email.com', 'Squier', 'Affinity Stratocaster', 1400, 'Usado · Muito bom', 'Londrina, PR', 'Estratocaster de entrada, bem conservada. Troquei as cordas na semana passada.', true, 'ativo', '2026-10-29 04:45:07', '{"anoFabricacao":2022,"corAcabamento":"Olympic White"}'::jsonb),
    ('eduardo.lopes@email.com', 'PRS', 'SE Custom 24', 5900, 'Usado · Excelente', 'Ribeirão Preto, SP', 'Acabamento lindo, tocar nela é um prazer. Tremolo estável e captadores muito versáteis.', true, 'ativo', '2026-10-20 20:31:12', '{"anoFabricacao":2021,"corAcabamento":"Whale Blue"}'::jsonb),
    ('fernanda.gomes@email.com', 'Tagima', 'T-635 Classic', 1500, 'Usado · Muito bom', 'Niterói, RJ', 'Clássica da marca nacional, com braço confortável. Pequenos riscos de uso, nada estrutural.', true, 'ativo', '2026-10-12 12:17:16', '{"anoFabricacao":2019,"corAcabamento":"Sunburst"}'::jsonb),
    ('vinicius.martins@email.com', 'Strinberg', 'EGS-216', 650, 'Usado · Regular', 'Joinville, SC', 'Barata e funcional, ideal para estudo. Tem desgaste visível, mas não tem nenhum defeito de som.', true, 'ativo', '2026-10-04 04:03:21', '{"anoFabricacao":2016,"corAcabamento":"Vermelha"}'::jsonb),
    ('aline.freitas@email.com', 'Gibson', 'SG Standard', 13800, 'Usado · Muito bom', 'Uberlândia, MG', 'SG clássica, timbre rock de verdade. Vai com case. Um pequeno retoque no verniz da parte de trás.', true, 'ativo', '2026-09-25 19:49:26', '{"anoFabricacao":2020,"corAcabamento":"Heritage Cherry"}'::jsonb),
    ('henrique.moreira@email.com', 'Fender', 'Player Telecaster', 5900, 'Usado · Excelente', 'Natal, RN', 'Telecaster Butterscotch, impecável. Excelente para country, blues e indie.', true, 'vendido', '2026-09-17 11:35:31', '{"anoFabricacao":2022,"corAcabamento":"Butterscotch Blonde"}'::jsonb),
    ('carolina.pinto@email.com', 'Fender', 'Player Jaguar', 6500, 'Seminovo', 'Cuiabá, MT', 'Jaguar de uso leve, perfeita para surf e shoegaze. Todos os controles funcionando.', true, 'ativo', '2026-09-11 23:05:04', '{"anoFabricacao":2023,"corAcabamento":"Sonic Red"}'::jsonb),
    ('leonardo.ribeiro@email.com', 'Squier', 'Classic Vibe 60s Stratocaster', 3500, 'Usado · Muito bom', 'São José dos Campos, SP', 'Série Classic Vibe, com um visual vintage bonito. Anúncio pausado enquanto eu resolvo a viagem.', true, 'pausado', '2026-09-08 22:22:05', '{"anoFabricacao":2021,"corAcabamento":"3-Color Sunburst"}'::jsonb),
    ('natalia.correia@email.com', 'Gibson', 'ES-335', 29900, 'Usado · Excelente', 'Maceió, AL', 'Semi-acústica americana, em perfeito estado. Vai com case original. Aceito conversa sobre valor.', true, 'ativo', '2026-09-07 01:04:32', '{"anoFabricacao":2020,"corAcabamento":"Cherry"}'::jsonb),
    ('rodrigo.mendes@email.com', 'Strinberg', 'LPS230', 1100, 'Usado · Bom', 'Sorocaba, SP', 'Estilo Les Paul, ótima para começar no rock. Vendida a um amigo, anúncio mantido para histórico.', true, 'vendido', '2026-09-06 06:20:38', '{"anoFabricacao":2017,"corAcabamento":"Sunburst"}'::jsonb),
    ('tatiane.cardoso@email.com', 'B.C. Rich', 'Warlock Legacy Floyd Rose', 6900, 'Seminovo', 'Caxias do Sul, RS', 'Neck-through, Floyd Rose e captadores Seymour Duncan. Peça de metal séria.', true, 'vendido', '2026-09-06 15:49:05', '{"anoFabricacao":2022,"corAcabamento":"Preta"}'::jsonb),
    ('marcos@email.com', 'Fender', 'Player Jazz Bass', 7200, 'Seminovo', 'São Paulo, SP', 'Jazz Bass versátil, ótimo para estúdio. Cordas Ernie Ball novas.', true, 'ativo', '2026-11-09 10:12:00', '{"anoFabricacao":2022,"corAcabamento":"Sunburst"}'::jsonb),
    ('lucas@email.com', 'Fender', 'Player Precision Bass', 6600, 'Usado · Excelente', 'Curitiba, PR', 'Timbre clássico, muito bem cuidado. Vendo porque migrei para o baixo de 5 cordas.', true, 'ativo', '2026-11-01 01:58:04', '{"anoFabricacao":2021,"corAcabamento":"Black"}'::jsonb),
    ('ana@email.com', 'Yamaha', 'TRBX304', 2700, 'Usado · Muito bom', 'Belo Horizonte, MG', 'Baixo ativo versátil, ótimo custo-benefício. Acompanha capa.', true, 'ativo', '2026-10-23 17:44:09', '{"anoFabricacao":2020,"corAcabamento":"Preto"}'::jsonb),
    ('renato@email.com', 'Squier', 'Affinity Precision Bass PJ', 1900, 'Usado · Bom', 'Porto Alegre, RS', 'Baixo de entrada com captadores P e J. Funciona perfeitamente.', true, 'ativo', '2026-10-15 09:30:14', '{"anoFabricacao":2018,"corAcabamento":"Preto"}'::jsonb),
    ('juliana.matos@email.com', 'Fender', 'Precision Bass American Professional II', 15900, 'Seminovo', 'Salvador, BA', 'Americano, quase novo. Acompanha case rígido.', true, 'ativo', '2026-10-07 01:16:19', '{"anoFabricacao":2023,"corAcabamento":"Olympic White"}'::jsonb),
    ('tatiane.cardoso@email.com', 'Yamaha', 'TRBX305', 3300, 'Usado · Excelente', 'Caxias do Sul, RS', 'Cinco cordas, muito confortável. Eletrônica ativa funcionando perfeitamente.', true, 'ativo', '2026-10-12 18:44:51', '{"anoFabricacao":2021,"corAcabamento":"Vermelho"}'::jsonb),
    ('ana@email.com', 'Yamaha', 'FG800', 1400, 'Usado · Muito bom', 'Belo Horizonte, MG', 'Violão de aço excelente para quem está começando a gravar. Som aberto e equilibrado.', true, 'vendido', '2026-09-20 08:48:28', '{"anoFabricacao":2021,"corAcabamento":"Natural"}'::jsonb),
    ('juliana.matos@email.com', 'Martin', 'D-28', 25900, 'Usado · Excelente', 'Salvador, BA', 'Dreadnought clássico, timbre inconfundível. Acompanha case original.', false, 'ativo', '2026-09-12 00:34:33', '{"anoFabricacao":2018,"corAcabamento":"Natural"}'::jsonb),
    ('patricia.souza@email.com', 'Yamaha', 'C40', 650, 'Usado · Bom', 'Manaus, AM', 'Violão clássico de nylon, ótimo para estudo. Cordas novas.', true, 'ativo', '2026-09-03 16:20:38', '{"anoFabricacao":2019,"corAcabamento":"Natural"}'::jsonb),
    ('gustavo.pereira@email.com', 'Taylor', '214ce', 9800, 'Seminovo', 'Santos, SP', 'Eletroacústico americano, som lindo e captação muito fiel. Acompanha case.', true, 'ativo', '2026-08-26 08:06:43', '{"anoFabricacao":2022,"corAcabamento":"Natural"}'::jsonb),
    ('mariana.duarte@email.com', 'Giannini', 'Start N14', 480, 'Usado · Muito bom', 'Vitória, ES', 'Violão nylon nacional, muito bom para iniciantes. Sem rachaduras.', true, 'ativo', '2026-08-17 23:52:48', '{"anoFabricacao":2020,"corAcabamento":"Natural"}'::jsonb),
    ('isabela.ramos@email.com', 'Gibson', 'J-45 Standard', 22900, 'Usado · Excelente', 'Londrina, PR', 'Round-shoulder dreadnought com timbre quente. Vai com case rígido.', true, 'ativo', '2026-08-09 15:38:52', '{"anoFabricacao":2021,"corAcabamento":"Vintage Sunburst"}'::jsonb),
    ('camila.rodrigues@email.com', 'Epiphone', 'DR-100', 1100, 'Usado · Bom', 'Rio de Janeiro, RJ', 'Violão de aço de entrada, funcional. Pequenas marcas no tampo.', true, 'ativo', '2026-08-01 07:24:57', '{"anoFabricacao":2017,"corAcabamento":"Natural"}'::jsonb),
    ('marcos@email.com', 'Fender', 'Blues Junior IV', 4200, 'Usado · Excelente', 'São Paulo, SP', 'Valvulado de 15W, perfeito para casa e estúdio. Timbre cristalino.', true, 'ativo', '2026-11-03 23:11:02', '{"anoFabricacao":2022}'::jsonb),
    ('felipe.nogueira@email.com', 'Peavey', 'Bandit 112', 1500, 'Usado · Muito bom', 'Campinas, SP', 'Clássico e à prova de bala. Dois canais, reverb e loop de efeitos.', true, 'ativo', '2026-10-26 14:57:07', '{"anoFabricacao":2012}'::jsonb),
    ('renato@email.com', 'Peavey', '6505 (linha 5150)', 9800, 'Usado · Excelente', 'Porto Alegre, RS', 'Cabeçote de 120W valvulado, o som do metal moderno. Com válvulas revisadas.', false, 'ativo', '2026-10-18 06:43:12', '{"anoFabricacao":2017}'::jsonb),
    ('thiago.barbosa@email.com', 'Marshall', 'JCM800 2203', 14500, 'Usado · Muito bom', 'Goiânia, GO', 'Cabeçote de 100W, o timbre do rock clássico. Mantenho revisado, sem ruídos.', true, 'ativo', '2026-10-09 22:29:16', '{"anoFabricacao":1989}'::jsonb),
    ('rafael.teixeira@email.com', 'Marshall', 'MG30GFX', 800, 'Usado · Bom', 'Recife, PE', 'Combo de estudo com efeitos embutidos. Funciona direitinho.', true, 'vendido', '2026-10-01 14:15:21', '{"anoFabricacao":2014}'::jsonb),
    ('beatriz.almeida@email.com', 'Vox', 'AC30C2', 7900, 'Usado · Excelente', 'Florianópolis, SC', 'O som de Kevin Shields e dos Beatles. Dois falantes, reverb de mola.', true, 'ativo', '2026-09-23 06:01:26', '{"anoFabricacao":2020}'::jsonb),
    ('larissa.monteiro@email.com', 'Boss', 'Katana-50 MkII', 2200, 'Seminovo', 'Brasília, DF', 'Versátil, com vários timbres e loop. Uso leve, em casa.', true, 'ativo', '2026-09-14 21:47:31', '{"anoFabricacao":2023}'::jsonb),
    ('diego.carvalho@email.com', 'Roland', 'JC-120', 4900, 'Usado · Muito bom', 'Fortaleza, CE', 'O som cristalino e o chorus lendário. Pesado, mas insuperável no clean.', true, 'ativo', '2026-09-06 13:33:36', '{"anoFabricacao":2005}'::jsonb),
    ('bruno.castro@email.com', 'Fender', 'Twin Reverb', 9500, 'Usado · Excelente', 'Belém, PA', 'Valvulado, com 85W e dois falantes de 12". O padrão de limpidez.', true, 'ativo', '2026-08-29 05:19:40', '{"anoFabricacao":2019}'::jsonb),
    ('eduardo.lopes@email.com', 'Orange', 'Crush 20RT', 1200, 'Usado · Muito bom', 'Ribeirão Preto, SP', 'Combo pequeno com reverb. Timbre de overdrive muito bom pelo preço.', true, 'ativo', '2026-08-20 21:05:45', '{"anoFabricacao":2021}'::jsonb),
    ('fernanda.gomes@email.com', 'Fender', 'Rumble 100', 1900, 'Usado · Bom', 'Niterói, RJ', 'Amplificador de baixo com potência de sobra para ensaios.', true, 'ativo', '2026-08-12 12:51:50', '{"anoFabricacao":2018}'::jsonb),
    ('vinicius.martins@email.com', 'Meteoro', 'Vulcano G200', 1800, 'Usado · Bom', 'Joinville, SC', 'Combo nacional de 200W, com pré valvulado. Pesado e barulhento do bom jeito.', true, 'ativo', '2026-08-04 04:37:55', '{"anoFabricacao":2010}'::jsonb),
    ('aline.freitas@email.com', 'Ampeg', 'SVT-CL', 12900, 'Usado · Excelente', 'Uberlândia, MG', 'Cabeçote valvulado de 300W, o clássico dos palcos. Revisado.', true, 'ativo', '2026-11-06 20:24:00', '{"anoFabricacao":2019}'::jsonb),
    ('henrique.moreira@email.com', 'Fender', 'Deluxe Reverb', 8900, 'Usado · Excelente', 'Natal, RN', 'Valvulado de 22W, com o reverb mais bonito do mercado.', true, 'ativo', '2026-10-29 12:10:04', '{"anoFabricacao":2021}'::jsonb),
    ('rodrigo.mendes@email.com', 'Marshall', 'DSL40CR', 5200, 'Seminovo', 'Sorocaba, SP', 'Combo valvulado de 40W com dois canais. Muito pouco uso.', true, 'ativo', '2026-10-26 14:32:44', '{"anoFabricacao":2022}'::jsonb),
    ('marcos@email.com', 'Boss', 'SF-2 Super Flanger', 1100, 'Usado · Muito bom', 'São Paulo, SP', 'Flanger analógico clássico, difícil de achar. Perfeito para shoegaze e rock dos anos 80.', true, 'ativo', '2026-10-12 19:42:14', '{"anoFabricacao":1990}'::jsonb),
    ('marcos@email.com', 'Ibanez', 'Tube Screamer TS9', 800, 'Usado · Excelente', 'São Paulo, SP', 'O overdrive que todo mundo conhece. Estado impecável, com a caixa original.', true, 'ativo', '2026-10-04 11:28:19', '{"anoFabricacao":2018}'::jsonb),
    ('felipe.nogueira@email.com', 'Electro-Harmonix', 'Big Muff Pi', 650, 'Usado · Excelente', 'Campinas, SP', 'A parede de som do shoegaze. Sustain infinito, sem ruído.', true, 'ativo', '2026-09-26 03:14:24', '{"anoFabricacao":2020}'::jsonb),
    ('renato@email.com', 'Boss', 'DS-1 Distortion', 350, 'Usado · Muito bom', 'Porto Alegre, RS', 'Distorção clássica, funcionando perfeitamente. Alguns arranhões na pintura.', true, 'ativo', '2026-09-17 19:00:28', '{"anoFabricacao":2016}'::jsonb),
    ('camila.rodrigues@email.com', 'Strymon', 'BigSky', 3900, 'Usado · Excelente', 'Rio de Janeiro, RJ', 'Reverb de estúdio no pedal. Com fonte e caixa originais.', true, 'ativo', '2026-09-09 10:46:33', '{"anoFabricacao":2021}'::jsonb),
    ('juliana.matos@email.com', 'Walrus Audio', 'Slö Multi Texture Reverb', 2400, 'Seminovo', 'Salvador, BA', 'Reverbs ambientes lindos, perfeito para shoegaze e post-rock.', true, 'ativo', '2026-09-01 02:32:38', '{"anoFabricacao":2022}'::jsonb),
    ('rafael.teixeira@email.com', 'Boss', 'DD-8 Digital Delay', 950, 'Usado · Muito bom', 'Recife, PE', 'Delay digital completo, com tap tempo e 11 modos.', true, 'vendido', '2026-08-23 18:18:43', '{"anoFabricacao":2019}'::jsonb),
    ('beatriz.almeida@email.com', 'Boss', 'CE-2W Waza Craft', 1150, 'Usado · Excelente', 'Florianópolis, SC', 'O chorus clássico, versão Waza Craft. Quase sem uso.', true, 'ativo', '2026-08-15 10:04:48', '{"anoFabricacao":2021}'::jsonb),
    ('larissa.monteiro@email.com', 'Boss', 'VB-2 Vibrato', 780, 'Usado · Muito bom', 'Brasília, DF', 'Vibrato de aparência vintage, usado nos pedalboards de shoegaze.', true, 'ativo', '2026-08-07 01:50:52', '{"anoFabricacao":2017}'::jsonb),
    ('diego.carvalho@email.com', 'Strymon', 'Timeline', 3600, 'Usado · Excelente', 'Fortaleza, CE', 'Delay de alto nível, com 12 tipos e presets. Com a caixa.', true, 'ativo', '2026-11-09 17:36:57', '{"anoFabricacao":2020}'::jsonb),
    ('gustavo.pereira@email.com', 'MXR', 'Phase 90', 480, 'Usado · Excelente', 'Santos, SP', 'O phaser clássico. Um parafuso, um som.', true, 'ativo', '2026-11-01 09:23:02', '{"anoFabricacao":2020}'::jsonb),
    ('mariana.duarte@email.com', 'Meris', 'Mercury7', 3200, 'Seminovo', 'Vitória, ES', 'Reverb cósmico, ótimo para ambientes. Quase novo.', true, 'ativo', '2026-10-24 01:09:07', '{"anoFabricacao":2022}'::jsonb),
    ('isabela.ramos@email.com', 'Electro-Harmonix', 'POG2', 1400, 'Usado · Excelente', 'Londrina, PR', 'Gerador polifônico de oitavas, com timbres de órgão. Funciona perfeitamente.', true, 'ativo', '2026-10-15 16:55:12', '{"anoFabricacao":2021}'::jsonb),
    ('eduardo.lopes@email.com', 'Fulltone', 'OCD', 1100, 'Usado · Muito bom', 'Ribeirão Preto, SP', 'Overdrive transparente. Com a caixa e o manual.', true, 'ativo', '2026-10-07 08:41:16', '{"anoFabricacao":2019}'::jsonb),
    ('fernanda.gomes@email.com', 'ProCo', 'RAT 2', 550, 'Usado · Muito bom', 'Niterói, RJ', 'Distorção clássica. Funcionando e sem ruído.', true, 'ativo', '2026-09-29 00:27:21', '{"anoFabricacao":2018}'::jsonb),
    ('aline.freitas@email.com', 'Boss', 'SD-1 Super Overdrive', 380, 'Usado · Excelente', 'Uberlândia, MG', 'Overdrive básico e confiável. Estado impecável.', true, 'ativo', '2026-09-20 16:13:26', '{"anoFabricacao":2021}'::jsonb),
    ('henrique.moreira@email.com', 'TC Electronic', 'Flashback 2', 650, 'Usado · Excelente', 'Natal, RN', 'Delay com TonePrint. Funcionando perfeitamente.', true, 'vendido', '2026-09-12 07:59:31', '{"anoFabricacao":2020}'::jsonb),
    ('carolina.pinto@email.com', 'Strymon', 'Mobius', 2900, 'Seminovo', 'Cuiabá, MT', 'Modulação para tudo: chorus, flanger, tremolo e muito mais. Quase sem uso.', true, 'ativo', '2026-09-07 00:56:46', '{"anoFabricacao":2022}'::jsonb),
    ('natalia.correia@email.com', 'Dunlop', 'Fuzz Face Mini', 520, 'Usado · Muito bom', 'Maceió, AL', 'Fuzz vintage em tamanho pequeno. Timbre sujo e gostoso.', true, 'ativo', '2026-09-09 15:49:32', '{"anoFabricacao":2019}'::jsonb),
    ('rodrigo.mendes@email.com', 'Electro-Harmonix', 'Holy Grail Nano', 480, 'Usado · Muito bom', 'Sorocaba, SP', 'Reverb de mola, em tamanho compacto.', true, 'ativo', '2026-09-08 15:52:38', '{"anoFabricacao":2018}'::jsonb),
    ('tatiane.cardoso@email.com', 'Boss', 'BD-2 Blues Driver', 560, 'Usado · Excelente', 'Caxias do Sul, RS', 'Overdrive que responde à dinâmica. Com a caixa original.', true, 'ativo', '2026-09-08 20:06:13', '{"anoFabricacao":2021}'::jsonb),
    ('alexandre.fonseca@email.com', 'Boss', 'TR-2 Tremolo', 620, 'Usado · Bom', 'São Luís, MA', 'Tremolo analógico. Anúncio criado antes da minha conta ser suspensa.', true, 'ativo', '2026-09-09 18:48:29', '{"anoFabricacao":2015}'::jsonb),
    ('mariana.duarte@email.com', 'Ernie Ball', 'Hybrid Slinky', 45, 'Novo', 'Vitória, ES', 'Jogo de cordas 009-046, lacrado. Ótimo para quem quer agudos fáceis e graves firmes.', true, 'ativo', '2026-11-04 06:36:00', '{}'::jsonb),
    ('gustavo.pereira@email.com', 'D''Addario', 'EXL110 Regular Light', 38, 'Novo', 'Santos, SP', 'Jogo de cordas 010-046, lacrado.', true, 'ativo', '2026-10-26 22:22:04', '{}'::jsonb),
    ('camila.rodrigues@email.com', 'Elixir', 'Nanoweb Light 12052', 95, 'Novo', 'Rio de Janeiro, RJ', 'Cordas revestidas, de longa duração. 010-046, lacrado.', true, 'ativo', '2026-10-18 14:08:09', '{}'::jsonb),
    ('felipe.nogueira@email.com', 'Ernie Ball', 'Extra Slinky', 42, 'Novo', 'Campinas, SP', 'Jogo de cordas 008-038, lacrado. Para quem quer bends fáceis.', true, 'ativo', '2026-10-10 05:54:14', '{}'::jsonb),
    ('thiago.barbosa@email.com', 'D''Addario', 'EXL110-8', 85, 'Novo', 'Goiânia, GO', 'Jogo de 8 cordas, 010-074, lacrado.', true, 'ativo', '2026-10-01 21:40:19', '{}'::jsonb),
    ('rafael.teixeira@email.com', 'Solez', 'SLG9 Tensão Leve', 22, 'Novo', 'Recife, PE', 'Jogo 009, tensão leve, lacrado. Boa opção barata.', true, 'ativo', '2026-09-23 13:26:24', '{}'::jsonb),
    ('juliana.matos@email.com', 'Elixir', 'Nanoweb Custom Light 12027', 98, 'Novo', 'Salvador, BA', 'Cordas 009-046, com revestimento Nanoweb. Lacrado.', true, 'ativo', '2026-09-15 05:12:28', '{}'::jsonb),
    ('marcos@email.com', 'Ernie Ball', 'Super Slinky Bass', 130, 'Novo', 'São Paulo, SP', 'Jogo de cordas de baixo, 045-100, lacrado.', true, 'ativo', '2026-09-06 20:58:33', '{}'::jsonb),
    ('beatriz.almeida@email.com', 'Gator', 'GC-ELECTRIC-A Case Moldado para Guitarra', 690, 'Usado · Excelente', 'Florianópolis, SC', 'Case rígido moldado para guitarras de corpo sólido. Fechos e travas perfeitos.', true, 'ativo', '2026-08-29 12:44:38', '{}'::jsonb),
    ('larissa.monteiro@email.com', 'Ernie Ball', 'Polypro Strap', 85, 'Novo', 'Brasília, DF', 'Correia leve e resistente, nova, na embalagem.', true, 'ativo', '2026-08-21 04:30:43', '{}'::jsonb),
    ('cristiano.vaz@email.com', 'Fender', 'Player Stratocaster', 4200, 'Seminovo', 'Teresina, PI', 'Preço muito abaixo do mercado. Anúncio pausado pela moderação.', true, 'pausado', '2026-09-22 22:59:45', '{"anoFabricacao":2022,"corAcabamento":"Black"}'::jsonb),
    ('cristiano.vaz@email.com', 'Electro-Harmonix', 'Big Muff Pi', 300, 'Usado · Muito bom', 'Teresina, PI', 'Anúncio pausado pela moderação.', true, 'pausado', '2026-09-18 09:04:24', '{"anoFabricacao":2020}'::jsonb)
    ) AS t(email, marca, modelo, preco, condicao, localizacao, descricao, aceita, status, criado_em, extras)
  LOOP
    SELECT "idUsuario" INTO v_vendedor FROM "Usuario" WHERE "email" = r.email;
    IF v_vendedor IS NULL THEN
      RAISE EXCEPTION 'Vendedor nao encontrado: %', r.email;
    END IF;

    INSERT INTO "Instrumento" ("marca", "modelo", "categoria", "tipoCaptacao", "numeroCordas", "orientacao", "especificacoes", "noCatalogo")
    SELECT c."marca", c."modelo", c."categoria", c."tipoCaptacao", c."numeroCordas", c."orientacao", c."especificacoes" || r.extras, false
    FROM "Instrumento" c
    WHERE c."noCatalogo" AND c."marca" = r.marca AND c."modelo" = r.modelo
    RETURNING "idInstrumento" INTO v_instrumento;

    IF v_instrumento IS NULL THEN
      RAISE EXCEPTION 'Modelo nao encontrado no catalogo: % %', r.marca, r.modelo;
    END IF;

    INSERT INTO "Anuncio" ("titulo", "preco", "condicao", "status", "dataCriacao", "localizacao", "descricao", "aceitaPropostas", "idVendedor", "idInstrumento")
    VALUES (r.marca || ' ' || r.modelo, r.preco, r.condicao, r.status, r.criado_em::timestamp, r.localizacao, r.descricao, r.aceita, v_vendedor, v_instrumento);
  END LOOP;
END $$;

COMMIT;

-- Conferencia (rode separado):
-- SELECT "status", count(*) FROM "Anuncio" GROUP BY 1 ORDER BY 2 DESC;                     -- total 87
-- SELECT count(*) FROM "Instrumento" WHERE NOT "noCatalogo";                                -- 87
-- SELECT a."idAnuncio", a."titulo", a."preco", u."nome" FROM "Anuncio" a JOIN "Usuario" u ON u."idUsuario" = a."idVendedor" ORDER BY 1 LIMIT 10;
