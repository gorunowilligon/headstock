-- Headstock | Parte 2 de N: USUARIOS
-- Requer a Parte 1. Cria 1 administrador + 29 usuarios comuns.
--
-- SENHA DE TODOS OS USUARIOS: headstock123
-- (a coluna "senhaHash" guarda o hash bcrypt, nunca a senha em texto)
--
-- Logins uteis:
--   admin@headstock.dev          administrador (modera denuncias e disputas)
--   marcos@email.com             vendedor com varios anuncios
--   lucas@email.com              comprador
--   alexandre.fonseca@email.com  SUSPENSO: nao consegue criar anuncios (RN07)
--   cristiano.vaz@email.com      BANIDO: nao consegue entrar (RF15)
--
-- Obs.: "reputacaoMedia" e uma foto inicial; a Parte 7 (avaliacoes) a recalcula.

BEGIN;

INSERT INTO "Usuario"
  ("idUsuario", "tipo", "nome", "email", "senhaHash", "dataCadastro", "reputacaoMedia", "suspenso", "banido", "chavePix", "enderecoCompleto", "nivelAcesso")
VALUES
  ('admin', 'administrador', 'Moderação Headstock', 'admin@headstock.dev', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-02-15 10:00:00', 0, false, false, NULL, NULL, 1),
  ('u01', 'comum', 'Marcos Cavalcanti', 'marcos@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-03-03 09:00:00', 4.9, false, false, 'marcos@email.com', 'Av. Paulista, 1500, São Paulo, SP', NULL),
  ('u02', 'comum', 'Lucas Ferreira', 'lucas@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-03-10 10:17:00', 4.7, false, false, NULL, 'Rua XV de Novembro, 820, Curitiba, PR', NULL),
  ('u03', 'comum', 'Ana Beatriz Lima', 'ana@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-03-17 11:34:00', 5, false, false, 'ana@email.com', 'Av. Afonso Pena, 2100, Belo Horizonte, MG', NULL),
  ('u04', 'comum', 'Renato Azevedo', 'renato@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-03-24 12:51:00', 4.8, false, false, '+5551987654321', 'Rua dos Andradas, 455, Porto Alegre, RS', NULL),
  ('u05', 'comum', 'Camila Rodrigues', 'camila.rodrigues@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-03-31 13:08:00', 4.6, false, false, 'camila.rodrigues@email.com', 'Rua Voluntários da Pátria, 301, Rio de Janeiro, RJ', NULL),
  ('u06', 'comum', 'Felipe Nogueira', 'felipe.nogueira@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-04-07 14:25:00', 4.4, false, false, '+5519991234567', 'Rua Barão de Jaguara, 990, Campinas, SP', NULL),
  ('u07', 'comum', 'Juliana Matos', 'juliana.matos@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-04-14 15:42:00', 4.9, false, false, 'juliana.matos@email.com', 'Av. Sete de Setembro, 1800, Salvador, BA', NULL),
  ('u08', 'comum', 'Rafael Teixeira', 'rafael.teixeira@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-04-21 16:59:00', 4.2, false, false, NULL, 'Rua da Aurora, 512, Recife, PE', NULL),
  ('u09', 'comum', 'Beatriz Almeida', 'beatriz.almeida@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-04-28 17:16:00', 5, false, false, 'beatriz.almeida@email.com', 'Rua Felipe Schmidt, 77, Florianópolis, SC', NULL),
  ('u10', 'comum', 'Thiago Barbosa', 'thiago.barbosa@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-05-05 09:33:00', 3.9, false, false, '+5562988776655', 'Av. Goiás, 1230, Goiânia, GO', NULL),
  ('u11', 'comum', 'Larissa Monteiro', 'larissa.monteiro@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-05-12 10:50:00', 4.7, false, false, 'larissa.monteiro@email.com', 'SQS 308 Bloco C, ap. 204, Brasília, DF', NULL),
  ('u12', 'comum', 'Diego Carvalho', 'diego.carvalho@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-05-19 11:07:00', 4.5, false, false, '+5585991122334', 'Rua Barão de Studart, 1410, Fortaleza, CE', NULL),
  ('u13', 'comum', 'Patrícia Souza', 'patricia.souza@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-05-26 12:24:00', 4.8, false, false, NULL, 'Av. Djalma Batista, 600, Manaus, AM', NULL),
  ('u14', 'comum', 'Gustavo Pereira', 'gustavo.pereira@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-06-02 13:41:00', 4.3, false, false, 'gustavo.pereira@email.com', 'Av. Ana Costa, 330, Santos, SP', NULL),
  ('u15', 'comum', 'Mariana Duarte', 'mariana.duarte@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-06-09 14:58:00', 4.9, false, false, 'mariana.duarte@email.com', 'Av. Jerônimo Monteiro, 250, Vitória, ES', NULL),
  ('u16', 'comum', 'Bruno Castro', 'bruno.castro@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-06-16 15:15:00', 4.1, false, false, '+5591987001122', 'Av. Nazaré, 780, Belém, PA', NULL),
  ('u17', 'comum', 'Isabela Ramos', 'isabela.ramos@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-06-23 16:32:00', 4.6, false, false, 'isabela.ramos@email.com', 'Av. Higienópolis, 1020, Londrina, PR', NULL),
  ('u18', 'comum', 'Eduardo Lopes', 'eduardo.lopes@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-06-30 17:49:00', 4, false, false, NULL, 'Rua Duque de Caxias, 615, Ribeirão Preto, SP', NULL),
  ('u19', 'comum', 'Fernanda Gomes', 'fernanda.gomes@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-07-07 09:06:00', 4.8, false, false, 'fernanda.gomes@email.com', 'Rua Moreira César, 188, Niterói, RJ', NULL),
  ('u20', 'comum', 'Vinícius Martins', 'vinicius.martins@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-07-14 10:23:00', 4.5, false, false, '+5547991560987', 'Rua do Príncipe, 410, Joinville, SC', NULL),
  ('u21', 'comum', 'Aline Freitas', 'aline.freitas@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-07-21 11:40:00', 4.7, false, false, 'aline.freitas@email.com', 'Av. João Naves de Ávila, 2800, Uberlândia, MG', NULL),
  ('u22', 'comum', 'Henrique Moreira', 'henrique.moreira@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-07-28 12:57:00', 4.3, false, false, '+5584988112233', 'Av. Hermes da Fonseca, 905, Natal, RN', NULL),
  ('u23', 'comum', 'Carolina Pinto', 'carolina.pinto@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-08-04 13:14:00', 4.9, false, false, 'carolina.pinto@email.com', 'Av. Getúlio Vargas, 1150, Cuiabá, MT', NULL),
  ('u24', 'comum', 'Leonardo Ribeiro', 'leonardo.ribeiro@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-08-11 14:31:00', 3.7, false, false, NULL, 'Rua Sebastião Humel, 120, São José dos Campos, SP', NULL),
  ('u25', 'comum', 'Natália Correia', 'natalia.correia@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-08-18 15:48:00', 4.6, false, false, 'natalia.correia@email.com', 'Av. Fernandes Lima, 1600, Maceió, AL', NULL),
  ('u26', 'comum', 'Rodrigo Mendes', 'rodrigo.mendes@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-08-25 16:05:00', 4.4, false, false, '+5515991778899', 'Rua da Penha, 275, Sorocaba, SP', NULL),
  ('u27', 'comum', 'Tatiane Cardoso', 'tatiane.cardoso@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-09-01 17:22:00', 5, false, false, 'tatiane.cardoso@email.com', 'Rua Sinimbu, 1230, Caxias do Sul, RS', NULL),
  ('u28', 'comum', 'Alexandre Fonseca', 'alexandre.fonseca@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-09-08 09:39:00', 1.6, true, false, NULL, 'Av. dos Holandeses, 90, São Luís, MA', NULL),
  ('u29', 'comum', 'Cristiano Vaz', 'cristiano.vaz@email.com', '$2b$10$D9RhrhJQD/38q/GYoGxrCO2QEZNujtcpc1LMes.ON15kTKtarhHBy', '2026-09-15 10:56:00', 1.2, true, true, NULL, 'Rua Areolino de Abreu, 330, Teresina, PI', NULL);

COMMIT;

-- Conferencia (rode separado): deve retornar 30 linhas, 1 admin, 1 suspenso, 1 banido
-- SELECT count(*) total, count(*) FILTER (WHERE tipo='administrador') admins,
--        count(*) FILTER (WHERE suspenso) suspensos, count(*) FILTER (WHERE banido) banidos
-- FROM "Usuario";
