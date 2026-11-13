-- Headstock | Parte 3 de N: INSTRUMENTOS (catalogo mestre, RF14)
-- Requer a Parte 1. Nao depende da Parte 2.
--
-- Cria 131 modelos reais com "noCatalogo" = true. Eles aparecem em "Instrumento do catalogo mestre"
-- na tela de criar anuncio. Cada anuncio (Parte 4) ganha a sua propria copia do instrumento, com noCatalogo = false.
--
--   Guitarras        26
--   Baixos           7
--   Violões          8
--   Amplificadores   19
--   Pedais/Efeitos   36
--   Acessórios       35
--
-- ATENCAO: as especificacoes sao de referencia (fichas de fabricante e lojas). Quando uma ficha divergia entre
-- fontes ou eu nao tinha certeza, o campo foi OMITIDO em vez de chutado. O vendedor pode editar no proprio anuncio.
-- "especificacoes.subcategoria" guarda a escolha exata do formulario (ex.: amp de baixo x amp de guitarra).

BEGIN;

INSERT INTO "Instrumento"
  ("idInstrumento", "marca", "modelo", "categoria", "tipoCaptacao", "numeroCordas", "orientacao", "especificacoes", "noCatalogo")
VALUES
  -- GUITARRAS | Icônicas
  ('cat-fender-stratocaster-american-professional-ii', 'Fender', 'Stratocaster American Professional II', 'Guitarras', 'SSS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Estados Unidos","madeiraCorpo":"Alder","madeiraBraco":"Maple","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-fender-telecaster-american-professional-ii', 'Fender', 'Telecaster American Professional II', 'Guitarras', 'SS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Estados Unidos","madeiraCorpo":"Alder","madeiraBraco":"Maple","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-gibson-les-paul-standard-60s', 'Gibson', 'Les Paul Standard 60s', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Estados Unidos","madeiraCorpo":"Mogno","madeiraBraco":"Mogno","madeiraEscala":"Rosewood","tipoPonte":"Tune-o-Matic"}'::jsonb, true),
  ('cat-gibson-sg-standard', 'Gibson', 'SG Standard', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Estados Unidos","madeiraCorpo":"Mogno","madeiraBraco":"Mogno","madeiraEscala":"Rosewood","tipoPonte":"Tune-o-Matic"}'::jsonb, true),
  ('cat-gibson-es-335', 'Gibson', 'ES-335', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Semi-Hollow","paisOrigem":"Estados Unidos","tipoPonte":"Tune-o-Matic"}'::jsonb, true),
  ('cat-fender-player-jazzmaster', 'Fender', 'Player Jazzmaster', 'Guitarras', 'SS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"México","madeiraCorpo":"Alder","madeiraBraco":"Maple","madeiraEscala":"Pau-Ferro","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-fender-player-jaguar', 'Fender', 'Player Jaguar', 'Guitarras', 'SS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"México","madeiraCorpo":"Alder","madeiraBraco":"Maple","madeiraEscala":"Pau-Ferro","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-prs-se-custom-24', 'PRS', 'SE Custom 24', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Coreia do Sul","madeiraCorpo":"Mogno","madeiraBraco":"Maple","madeiraEscala":"Rosewood","tipoPonte":"Tremolo"}'::jsonb, true),

  -- GUITARRAS | Intermediárias
  ('cat-fender-player-stratocaster', 'Fender', 'Player Stratocaster', 'Guitarras', 'SSS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"México","madeiraCorpo":"Alder","madeiraBraco":"Maple","madeiraEscala":"Pau-Ferro","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-fender-player-telecaster', 'Fender', 'Player Telecaster', 'Guitarras', 'SS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"México","madeiraCorpo":"Alder","madeiraBraco":"Maple","madeiraEscala":"Pau-Ferro","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-epiphone-les-paul-standard-50s', 'Epiphone', 'Les Paul Standard 50s', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"China","madeiraCorpo":"Mogno","madeiraBraco":"Mogno","tipoPonte":"Tune-o-Matic"}'::jsonb, true),
  ('cat-epiphone-sg-standard', 'Epiphone', 'SG Standard', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"China","madeiraCorpo":"Mogno","tipoPonte":"Tune-o-Matic"}'::jsonb, true),
  ('cat-ibanez-rg550-genesis-collection', 'Ibanez', 'RG550 Genesis Collection', 'Guitarras', 'HSH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Japão","tipoPonte":"Floyd Rose"}'::jsonb, true),
  ('cat-cort-kx300', 'Cort', 'KX300', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","madeiraCorpo":"Mogno","madeiraBraco":"Maple","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-squier-classic-vibe-60s-jazzmaster', 'Squier', 'Classic Vibe 60s Jazzmaster', 'Guitarras', 'SS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-squier-classic-vibe-60s-stratocaster', 'Squier', 'Classic Vibe 60s Stratocaster', 'Guitarras', 'SSS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-b-c-rich-warlock-legacy-floyd-rose', 'B.C. Rich', 'Warlock Legacy Floyd Rose', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","madeiraCorpo":"Mogno","madeiraBraco":"Maple","madeiraEscala":"Ébano","tipoPonte":"Floyd Rose"}'::jsonb, true),

  -- GUITARRAS | Entrada
  ('cat-ibanez-rg421', 'Ibanez', 'RG421', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","madeiraBraco":"Maple","madeiraEscala":"Jatoba","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-squier-affinity-stratocaster', 'Squier', 'Affinity Stratocaster', 'Guitarras', 'SSS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-jackson-js22-dinky', 'Jackson', 'JS22 Dinky', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-b-c-rich-warlock-mk3', 'B.C. Rich', 'Warlock Mk3', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","madeiraBraco":"Maple","madeiraEscala":"Rosewood"}'::jsonb, true),

  -- GUITARRAS | Nacionais
  ('cat-giannini-g-100-standard-strato', 'Giannini', 'G-100 Standard Strato', 'Guitarras', 'SSS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Brasil","madeiraCorpo":"Poplar","madeiraBraco":"Maple","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-tagima-memphis-mg-30', 'Tagima', 'Memphis MG-30', 'Guitarras', 'SSS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Brasil","madeiraCorpo":"Basswood","madeiraBraco":"Maple","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-tagima-t-635-classic', 'Tagima', 'T-635 Classic', 'Guitarras', 'SSS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Brasil","madeiraCorpo":"Alder","tipoPonte":"Tremolo"}'::jsonb, true),
  ('cat-strinberg-egs-216', 'Strinberg', 'EGS-216', 'Guitarras', 'SSS', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Brasil","madeiraCorpo":"Basswood","madeiraBraco":"Maple","madeiraEscala":"Rosewood"}'::jsonb, true),
  ('cat-strinberg-lps230', 'Strinberg', 'LPS230', 'Guitarras', 'HH', 6, 'Destro', '{"subcategoria":"guitarra","tipoCorpo":"Solid Body","paisOrigem":"Brasil","madeiraCorpo":"Basswood","madeiraBraco":"Maple","tipoPonte":"Tune-o-Matic"}'::jsonb, true),

  -- BAIXOS
  ('cat-fender-player-precision-bass', 'Fender', 'Player Precision Bass', 'Baixos', 'P', 4, 'Destro', '{"subcategoria":"contrabaixo","tipoCorpo":"Solid Body","paisOrigem":"México","madeiraCorpo":"Alder","madeiraBraco":"Maple","madeiraEscala":"Pau-Ferro","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-fender-player-jazz-bass', 'Fender', 'Player Jazz Bass', 'Baixos', 'JJ', 4, 'Destro', '{"subcategoria":"contrabaixo","tipoCorpo":"Solid Body","paisOrigem":"México","madeiraCorpo":"Alder","madeiraBraco":"Maple","madeiraEscala":"Pau-Ferro","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-fender-jazz-bass-american-professional-ii', 'Fender', 'Jazz Bass American Professional II', 'Baixos', 'JJ', 4, 'Destro', '{"subcategoria":"contrabaixo","tipoCorpo":"Solid Body","paisOrigem":"Estados Unidos","madeiraCorpo":"Alder","madeiraBraco":"Maple","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-fender-precision-bass-american-professional-ii', 'Fender', 'Precision Bass American Professional II', 'Baixos', 'P', 4, 'Destro', '{"subcategoria":"contrabaixo","tipoCorpo":"Solid Body","paisOrigem":"Estados Unidos","madeiraCorpo":"Alder","madeiraBraco":"Maple","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-squier-affinity-precision-bass-pj', 'Squier', 'Affinity Precision Bass PJ', 'Baixos', 'PJ', 4, 'Destro', '{"subcategoria":"contrabaixo","tipoCorpo":"Solid Body","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-yamaha-trbx304', 'Yamaha', 'TRBX304', 'Baixos', 'PJ', 4, 'Destro', '{"subcategoria":"contrabaixo","tipoCorpo":"Solid Body","tipoPonte":"Fixa"}'::jsonb, true),
  ('cat-yamaha-trbx305', 'Yamaha', 'TRBX305', 'Baixos', 'PJ', 5, 'Destro', '{"subcategoria":"contrabaixo","tipoCorpo":"Solid Body","tipoPonte":"Fixa"}'::jsonb, true),

  -- VIOLÕES
  ('cat-martin-d-28', 'Martin', 'D-28', 'Violões', 'Acústico puro', 6, 'Destro', '{"subcategoria":"violao","paisOrigem":"Estados Unidos","formatoCorpo":"Dreadnought","madeiraTampo":"Spruce","fundoLaterais":"Rosewood","tipoCorda":"Aço"}'::jsonb, true),
  ('cat-gibson-j-45-standard', 'Gibson', 'J-45 Standard', 'Violões', 'Acústico puro', 6, 'Destro', '{"subcategoria":"violao","paisOrigem":"Estados Unidos","formatoCorpo":"Dreadnought","madeiraTampo":"Spruce","fundoLaterais":"Mogno","tipoCorda":"Aço"}'::jsonb, true),
  ('cat-taylor-214ce', 'Taylor', '214ce', 'Violões', 'Eletroacústico', 6, 'Destro', '{"subcategoria":"violao","paisOrigem":"Estados Unidos","formatoCorpo":"Grand Auditorium","madeiraTampo":"Spruce","fundoLaterais":"Rosewood","tipoCorda":"Aço"}'::jsonb, true),
  ('cat-yamaha-fg800', 'Yamaha', 'FG800', 'Violões', 'Acústico puro', 6, 'Destro', '{"subcategoria":"violao","formatoCorpo":"Dreadnought","madeiraTampo":"Spruce","tipoCorda":"Aço"}'::jsonb, true),
  ('cat-yamaha-c40', 'Yamaha', 'C40', 'Violões', 'Acústico puro', 6, 'Destro', '{"subcategoria":"violao","formatoCorpo":"Clássico","madeiraTampo":"Spruce","tipoCorda":"Nylon"}'::jsonb, true),
  ('cat-fender-cd-60s', 'Fender', 'CD-60S', 'Violões', 'Acústico puro', 6, 'Destro', '{"subcategoria":"violao","formatoCorpo":"Dreadnought","madeiraTampo":"Spruce","tipoCorda":"Aço"}'::jsonb, true),
  ('cat-epiphone-dr-100', 'Epiphone', 'DR-100', 'Violões', 'Acústico puro', 6, 'Destro', '{"subcategoria":"violao","formatoCorpo":"Dreadnought","tipoCorda":"Aço"}'::jsonb, true),
  ('cat-giannini-start-n14', 'Giannini', 'Start N14', 'Violões', 'Acústico puro', 6, 'Destro', '{"subcategoria":"violao","paisOrigem":"Brasil","formatoCorpo":"Clássico","tipoCorda":"Nylon"}'::jsonb, true),

  -- AMPLIFICADORES | Guitarra
  ('cat-fender-blues-junior-iv', 'Fender', 'Blues Junior IV', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Válvula","formatoAmplificador":"Combo","potenciaWatts":15,"configuracaoFalantes":"1x12\""}'::jsonb, true),
  ('cat-fender-deluxe-reverb', 'Fender', 'Deluxe Reverb', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Válvula","formatoAmplificador":"Combo","potenciaWatts":22,"configuracaoFalantes":"1x12\""}'::jsonb, true),
  ('cat-fender-twin-reverb', 'Fender', 'Twin Reverb', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Válvula","formatoAmplificador":"Combo","potenciaWatts":85,"configuracaoFalantes":"2x12\""}'::jsonb, true),
  ('cat-marshall-jcm800-2203', 'Marshall', 'JCM800 2203', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Válvula","formatoAmplificador":"Cabeçote (Head)","potenciaWatts":100,"configuracaoFalantes":"Sem falante (cabeçote)"}'::jsonb, true),
  ('cat-marshall-dsl40cr', 'Marshall', 'DSL40CR', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Válvula","formatoAmplificador":"Combo","potenciaWatts":40,"configuracaoFalantes":"1x12\""}'::jsonb, true),
  ('cat-marshall-mg30gfx', 'Marshall', 'MG30GFX', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Transistor / Solid State","formatoAmplificador":"Combo","potenciaWatts":30,"configuracaoFalantes":"1x10\""}'::jsonb, true),
  ('cat-vox-ac30c2', 'Vox', 'AC30C2', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Válvula","formatoAmplificador":"Combo","potenciaWatts":30,"configuracaoFalantes":"2x12\""}'::jsonb, true),
  ('cat-orange-rockerverb-50-mkiii', 'Orange', 'Rockerverb 50 MKIII', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Válvula","formatoAmplificador":"Cabeçote (Head)","potenciaWatts":50,"configuracaoFalantes":"Sem falante (cabeçote)"}'::jsonb, true),
  ('cat-orange-crush-20rt', 'Orange', 'Crush 20RT', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Transistor / Solid State","formatoAmplificador":"Combo","potenciaWatts":20,"configuracaoFalantes":"1x8\""}'::jsonb, true),
  ('cat-peavey-bandit-112', 'Peavey', 'Bandit 112', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Transistor / Solid State","formatoAmplificador":"Combo","potenciaWatts":80,"configuracaoFalantes":"1x12\""}'::jsonb, true),
  ('cat-peavey-6505-linha-5150', 'Peavey', '6505 (linha 5150)', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Válvula","formatoAmplificador":"Cabeçote (Head)","potenciaWatts":120,"configuracaoFalantes":"Sem falante (cabeçote)"}'::jsonb, true),
  ('cat-boss-katana-50-mkii', 'Boss', 'Katana-50 MkII', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Digital / Modeling","formatoAmplificador":"Combo","potenciaWatts":50,"configuracaoFalantes":"1x12\""}'::jsonb, true),
  ('cat-roland-jc-120', 'Roland', 'JC-120', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Transistor / Solid State","formatoAmplificador":"Combo","potenciaWatts":120,"configuracaoFalantes":"2x12\""}'::jsonb, true),
  ('cat-meteoro-vulcano-g200', 'Meteoro', 'Vulcano G200', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","tipoCircuito":"Híbrido","formatoAmplificador":"Combo","potenciaWatts":200,"configuracaoFalantes":"2x12\"","paisOrigem":"Brasil"}'::jsonb, true),
  ('cat-meteoro-atomic-drive-50', 'Meteoro', 'Atomic Drive 50', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-guitarra","formatoAmplificador":"Combo","potenciaWatts":50,"configuracaoFalantes":"1x12\"","paisOrigem":"Brasil"}'::jsonb, true),

  -- AMPLIFICADORES | Contrabaixo
  ('cat-ampeg-svt-cl', 'Ampeg', 'SVT-CL', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-contrabaixo","tipoCircuito":"Válvula","formatoAmplificador":"Cabeçote (Head)","potenciaWatts":300,"configuracaoFalantes":"Sem falante (cabeçote)"}'::jsonb, true),
  ('cat-fender-rumble-100', 'Fender', 'Rumble 100', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-contrabaixo","tipoCircuito":"Transistor / Solid State","formatoAmplificador":"Combo","potenciaWatts":100,"configuracaoFalantes":"1x12\""}'::jsonb, true),
  ('cat-borne-impact-bass-cb60', 'Borne', 'Impact Bass CB60', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-contrabaixo","tipoCircuito":"Transistor / Solid State","formatoAmplificador":"Combo","potenciaWatts":20,"paisOrigem":"Brasil"}'::jsonb, true),

  -- AMPLIFICADORES | Violão
  ('cat-fender-acoustasonic-40', 'Fender', 'Acoustasonic 40', 'Amplificadores', '', 0, '', '{"subcategoria":"amp-violao","formatoAmplificador":"Combo","potenciaWatts":40}'::jsonb, true),

  -- PEDAIS | Fuzz e drive (base do shoegaze)
  ('cat-electro-harmonix-big-muff-pi', 'Electro-Harmonix', 'Big Muff Pi', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Fuzz","sinal":"Analógico"}'::jsonb, true),
  ('cat-dunlop-fuzz-face-mini', 'Dunlop', 'Fuzz Face Mini', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Fuzz","sinal":"Analógico"}'::jsonb, true),
  ('cat-boss-fz-5-fuzz', 'Boss', 'FZ-5 Fuzz', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Fuzz","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-ibanez-tube-screamer-ts9', 'Ibanez', 'Tube Screamer TS9', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Overdrive / Distortion","sinal":"Analógico"}'::jsonb, true),
  ('cat-ibanez-tube-screamer-ts808-reissue', 'Ibanez', 'Tube Screamer TS808 Reissue', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Overdrive / Distortion","sinal":"Analógico"}'::jsonb, true),
  ('cat-boss-sd-1-super-overdrive', 'Boss', 'SD-1 Super Overdrive', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Overdrive / Distortion","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-boss-ds-1-distortion', 'Boss', 'DS-1 Distortion', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Overdrive / Distortion","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-boss-bd-2-blues-driver', 'Boss', 'BD-2 Blues Driver', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Overdrive / Distortion","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-proco-rat-2', 'ProCo', 'RAT 2', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Overdrive / Distortion","sinal":"Analógico"}'::jsonb, true),
  ('cat-fulltone-ocd', 'Fulltone', 'OCD', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Overdrive / Distortion","sinal":"Analógico"}'::jsonb, true),

  -- PEDAIS | Modulação
  ('cat-boss-sf-2-super-flanger', 'Boss', 'SF-2 Super Flanger', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Flanger","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-boss-ch-1-super-chorus', 'Boss', 'CH-1 Super Chorus', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Chorus","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-boss-ce-2w-waza-craft', 'Boss', 'CE-2W Waza Craft', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Chorus","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-boss-vb-2-vibrato', 'Boss', 'VB-2 Vibrato', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Vibrato","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-boss-tr-2-tremolo', 'Boss', 'TR-2 Tremolo', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Tremolo","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-boss-ph-3-phase-shifter', 'Boss', 'PH-3 Phase Shifter', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Phaser","sinal":"Digital","bypass":"Buffered"}'::jsonb, true),
  ('cat-electro-harmonix-small-clone', 'Electro-Harmonix', 'Small Clone', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Chorus","sinal":"Analógico"}'::jsonb, true),
  ('cat-mxr-phase-90', 'MXR', 'Phase 90', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Phaser","sinal":"Analógico"}'::jsonb, true),
  ('cat-strymon-mobius', 'Strymon', 'Mobius', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Modulation","sinal":"Digital"}'::jsonb, true),

  -- PEDAIS | Delay
  ('cat-boss-dd-8-digital-delay', 'Boss', 'DD-8 Digital Delay', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Delay","sinal":"Digital","bypass":"Buffered"}'::jsonb, true),
  ('cat-boss-dm-2w-waza-craft', 'Boss', 'DM-2W Waza Craft', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Delay","sinal":"Analógico","bypass":"Buffered"}'::jsonb, true),
  ('cat-mxr-carbon-copy', 'MXR', 'Carbon Copy', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Delay","sinal":"Analógico"}'::jsonb, true),
  ('cat-tc-electronic-flashback-2', 'TC Electronic', 'Flashback 2', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Delay","sinal":"Digital"}'::jsonb, true),
  ('cat-strymon-timeline', 'Strymon', 'Timeline', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Delay","sinal":"Digital"}'::jsonb, true),
  ('cat-strymon-el-capistan', 'Strymon', 'El Capistan', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Delay","sinal":"Digital"}'::jsonb, true),

  -- PEDAIS | Reverb e ambiência
  ('cat-strymon-bigsky', 'Strymon', 'BigSky', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Reverb","sinal":"Digital"}'::jsonb, true),
  ('cat-strymon-blue-sky', 'Strymon', 'Blue Sky', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Reverb","sinal":"Digital"}'::jsonb, true),
  ('cat-walrus-audio-slo-multi-texture-reverb', 'Walrus Audio', 'Slö Multi Texture Reverb', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Reverb","sinal":"Digital"}'::jsonb, true),
  ('cat-electro-harmonix-holy-grail-nano', 'Electro-Harmonix', 'Holy Grail Nano', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Reverb","sinal":"Analógico"}'::jsonb, true),
  ('cat-electro-harmonix-cathedral', 'Electro-Harmonix', 'Cathedral', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Reverb","sinal":"Digital"}'::jsonb, true),
  ('cat-tc-electronic-hall-of-fame-2', 'TC Electronic', 'Hall of Fame 2', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Reverb","sinal":"Digital"}'::jsonb, true),
  ('cat-boss-rv-6-reverb', 'Boss', 'RV-6 Reverb', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Reverb","sinal":"Digital","bypass":"Buffered"}'::jsonb, true),
  ('cat-meris-mercury7', 'Meris', 'Mercury7', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Reverb","sinal":"Digital"}'::jsonb, true),

  -- PEDAIS | Oitavas e pitch
  ('cat-electro-harmonix-pog2', 'Electro-Harmonix', 'POG2', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Octave","sinal":"Digital"}'::jsonb, true),
  ('cat-digitech-whammy-5', 'Digitech', 'Whammy 5', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Pitch Shifter","sinal":"Digital"}'::jsonb, true),
  ('cat-boss-oc-5-octave', 'Boss', 'OC-5 Octave', 'Pedais/Efeitos', '', 0, '', '{"subcategoria":"pedais","tipoEfeito":"Octave","sinal":"Digital","bypass":"Buffered"}'::jsonb, true),

  -- CORDAS | Guitarra: das finas (.008) até híbridas
  ('cat-ernie-ball-extra-slinky', 'Ernie Ball', 'Extra Slinky', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".008-.038","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-d-addario-exl130-extra-super-light', 'D''Addario', 'EXL130 Extra Super Light', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".008-.038","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-ernie-ball-super-slinky', 'Ernie Ball', 'Super Slinky', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".009-.042","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-d-addario-exl120-super-light', 'D''Addario', 'EXL120 Super Light', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".009-.042","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-elixir-nanoweb-super-light-12002', 'Elixir', 'Nanoweb Super Light 12002', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".009-.042","materialCordas":"Níquel","revestimento":"Nanoweb"}'::jsonb, true),
  ('cat-elixir-optiweb-light-19002', 'Elixir', 'Optiweb Light 19002', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".009-.042","materialCordas":"Níquel","revestimento":"Optiweb"}'::jsonb, true),
  ('cat-ernie-ball-hybrid-slinky', 'Ernie Ball', 'Hybrid Slinky', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".009-.046","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-elixir-nanoweb-custom-light-12027', 'Elixir', 'Nanoweb Custom Light 12027', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".009-.046","materialCordas":"Níquel","revestimento":"Nanoweb"}'::jsonb, true),
  ('cat-ernie-ball-regular-slinky', 'Ernie Ball', 'Regular Slinky', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.046","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-d-addario-exl110-regular-light', 'D''Addario', 'EXL110 Regular Light', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.046","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-elixir-nanoweb-light-12052', 'Elixir', 'Nanoweb Light 12052', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.046","materialCordas":"Níquel","revestimento":"Nanoweb"}'::jsonb, true),
  ('cat-ernie-ball-skinny-top-heavy-bottom', 'Ernie Ball', 'Skinny Top Heavy Bottom', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.052","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-d-addario-exl140-light-top-heavy-bottom', 'D''Addario', 'EXL140 Light Top Heavy Bottom', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.052","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-elixir-nanoweb-light-heavy-12077', 'Elixir', 'Nanoweb Light-Heavy 12077', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.052","materialCordas":"Níquel","revestimento":"Nanoweb"}'::jsonb, true),
  ('cat-d-addario-exl115-medium', 'D''Addario', 'EXL115 Medium', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".011-.049","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-ernie-ball-power-slinky', 'Ernie Ball', 'Power Slinky', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".011-.048","materialCordas":"Níquel"}'::jsonb, true),

  -- CORDAS | Guitarra 7 e 8 cordas
  ('cat-ernie-ball-super-slinky-7-string', 'Ernie Ball', 'Super Slinky 7-String', 'Acessórios', '', 7, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".009-.052","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-d-addario-exl110-7', 'D''Addario', 'EXL110-7', 'Acessórios', '', 7, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.059","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-elixir-nanoweb-7-string-light-12057', 'Elixir', 'Nanoweb 7-String Light 12057', 'Acessórios', '', 7, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.056","materialCordas":"Níquel","revestimento":"Nanoweb"}'::jsonb, true),
  ('cat-d-addario-exl110-8', 'D''Addario', 'EXL110-8', 'Acessórios', '', 8, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.074","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-elixir-nanoweb-8-string-light-12062', 'Elixir', 'Nanoweb 8-String Light 12062', 'Acessórios', '', 8, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.074","materialCordas":"Níquel","revestimento":"Nanoweb"}'::jsonb, true),

  -- CORDAS | Nacionais
  ('cat-solez-slg9-tensao-leve', 'Solez', 'SLG9 Tensão Leve', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".009-.042","materialCordas":"Níquel","paisOrigem":"Brasil"}'::jsonb, true),
  ('cat-solez-guitarra-010', 'Solez', 'Guitarra 010', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.046","materialCordas":"Níquel","paisOrigem":"Brasil"}'::jsonb, true),
  ('cat-giannini-nickel-round-wound-010', 'Giannini', 'Nickel Round Wound 010', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".010-.046","materialCordas":"Níquel","paisOrigem":"Brasil"}'::jsonb, true),

  -- CORDAS | Baixo, violão e nylon
  ('cat-ernie-ball-super-slinky-bass', 'Ernie Ball', 'Super Slinky Bass', 'Acessórios', '', 4, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".045-.100","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-d-addario-exl170-regular-light-bass', 'D''Addario', 'EXL170 Regular Light Bass', 'Acessórios', '', 4, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".045-.100","materialCordas":"Níquel"}'::jsonb, true),
  ('cat-elixir-nanoweb-bass-light', 'Elixir', 'Nanoweb Bass Light', 'Acessórios', '', 4, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".045-.105","materialCordas":"Níquel","revestimento":"Nanoweb"}'::jsonb, true),
  ('cat-ernie-ball-earthwood-80-20-light', 'Ernie Ball', 'Earthwood 80/20 Light', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".011-.052","materialCordas":"Bronze 80/20"}'::jsonb, true),
  ('cat-d-addario-ej16-phosphor-bronze-light', 'D''Addario', 'EJ16 Phosphor Bronze Light', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".012-.053","materialCordas":"Bronze fosforoso"}'::jsonb, true),
  ('cat-elixir-nanoweb-phosphor-bronze-light-16052', 'Elixir', 'Nanoweb Phosphor Bronze Light 16052', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":".012-.053","materialCordas":"Bronze fosforoso","revestimento":"Nanoweb"}'::jsonb, true),
  ('cat-d-addario-ej45-pro-arte-nylon-normal-tension', 'D''Addario', 'EJ45 Pro-Arté Nylon Normal Tension', 'Acessórios', '', 6, '', '{"subcategoria":"acessorios","tipoAcessorio":"Encordoamento","calibreCordas":"Tensão normal","materialCordas":"Nylon"}'::jsonb, true),

  -- ACESSÓRIOS | Cabos, correias, cases e bags
  ('cat-d-addario-american-stage-cabo-de-instrumento-6-m', 'D''Addario', 'American Stage Cabo de Instrumento 6 m', 'Acessórios', '', 0, '', '{"subcategoria":"acessorios","tipoAcessorio":"Cabos"}'::jsonb, true),
  ('cat-ernie-ball-polypro-strap', 'Ernie Ball', 'Polypro Strap', 'Acessórios', '', 0, '', '{"subcategoria":"acessorios","tipoAcessorio":"Correia"}'::jsonb, true),
  ('cat-gator-gc-electric-a-case-moldado-para-guitarra', 'Gator', 'GC-ELECTRIC-A Case Moldado para Guitarra', 'Acessórios', '', 0, '', '{"subcategoria":"acessorios","tipoAcessorio":"Case rígido"}'::jsonb, true),
  ('cat-fender-fe610-gig-bag-para-guitarra', 'Fender', 'FE610 Gig Bag para Guitarra', 'Acessórios', '', 0, '', '{"subcategoria":"acessorios","tipoAcessorio":"Bag"}'::jsonb, true);

COMMIT;

-- Conferencia (rode separado): deve retornar 131 linhas no total
-- SELECT "categoria", count(*) FROM "Instrumento" WHERE "noCatalogo" GROUP BY 1 ORDER BY 2 DESC;
