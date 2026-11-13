# Headstock API

Backend REST do Headstock: Node.js + Express 5 em JavaScript (RNF01), PostgreSQL via Prisma (RNF02), senhas com bcrypt (RNF03), comunicação somente por JSON (RNF05), deploy na Vercel (RNF09) e documentação Swagger gerada automaticamente (RNF11).

## Como rodar localmente

Requisitos: Node.js 20.6 ou superior e um PostgreSQL. O `docker-compose.yml` sobe um PostgreSQL local.

```bash
cd backend
cp .env.example .env              # ajuste DATABASE_URL e JWT_SECRET
docker compose up -d              # opcional: PostgreSQL local
npm install                       # também roda "prisma generate"
npx prisma migrate dev --name init
npm run db:seed                   # mesmos dados do lib/mock-data.ts do frontend
npm run dev
```

Use **npm** nesta pasta. O frontend usa pnpm com um `pnpm-workspace.yaml` na raiz, que não inclui o backend.

- API: http://localhost:3333
- Documentação interativa: http://localhost:3333/docs
- Especificação OpenAPI: http://localhost:3333/openapi.json

Usuários do seed (senha `headstock123`): `marcos@email.com` (u1), `lucas@email.com`, `ana@email.com`, `renato@email.com` e o administrador `admin@headstock.dev`.

## Estrutura

```
prisma/schema.prisma   modelo relacional derivado do diagrama de classes
prisma/seed.js         dados iniciais
src/app.js             app Express (CORS, JSON, rotas, docs, erros)
src/regras.js          constantes das regras de negócio (RN01–RN08, RNF08, RNF10)
src/http/rota.js       registro de rotas: autenticação + validação Zod + documentação
src/http/serializar.js formato JSON das respostas (mesmos nomes de lib/models.ts)
src/rotas/*.js         endpoints por recurso
src/services/*.js      frete e pagamento (sandbox), reputação, prazos de pedidos
api/index.js           entrada da função serverless na Vercel
```

## Do diagrama para o banco

| Classe do diagrama | Tabela | Observações |
|---|---|---|
| Usuario, UsuarioComum, Administrador | `Usuario` | Herança em tabela única com a coluna `tipo` (`comum` ou `administrador`) |
| Anuncio | `Anuncio` | `status`: ativo, pausado, vendido ou removido |
| FotoAnuncio | `FotoAnuncio` | Composição 3..* validada na API; a imagem fica no próprio banco (bytea) |
| Instrumento | `Instrumento` | `noCatalogo = true` forma o catálogo mestre; cada anúncio guarda sua própria cópia (1:1) |
| Pedido | `Pedido` | Mais as datas de pagamento, envio e entrega, usadas nos prazos das RNs |
| Avaliacao | `Avaliacao` | No máximo 2 por pedido (vendedor e produto) |
| Mensagem | `Mensagem` | Mais destinatário e anúncio, necessários para montar as conversas |
| Denuncia | `Denuncia` | Alvo: anúncio, usuário ou mensagem; `idAdministrador` registra quem analisou |
| associação "favorita" | `Favorito` | Tabela de junção |

## Requisitos e endpoints

| Requisito | Endpoint |
|---|---|
| RF01 cadastro e recuperação de senha | `POST /auth/cadastro`, `/auth/recuperar-senha`, `/auth/redefinir-senha` |
| RF02 anúncio com no mínimo 3 fotos | `POST /fotos` (upload) e depois `POST /anuncios` com os `idFoto` |
| RF03 editar especificações | `PATCH /anuncios/{id}` (campo `instrumento`) |
| RF04 preenchimento manual | `POST /anuncios` com `instrumento` no lugar de `idInstrumentoCatalogo` |
| RF05 excluir, pausar e editar | `DELETE /anuncios/{id}`, `POST /anuncios/{id}/pausar` e `/reativar`, `PATCH /anuncios/{id}` |
| RF06 busca com filtros | `GET /anuncios?q=&marca=&categoria=&tipoCaptacao=&condicao=&precoMin=&precoMax=&localizacao=&ordenar=` (marca, categoria, tipoCaptacao e condicao aceitam vários valores separados por vírgula) |
| RF07 login obrigatório | Middleware `autenticar` (401 sem token) |
| RF08 propostas de preço | `POST /ofertas`, `GET /ofertas`, `POST /ofertas/{id}/aceitar`, `/recusar` e `/contraproposta`; a proposta aceita vale 24h e é usada em `POST /pedidos` (`idOferta`) |
| RF09 checkout e frete | `POST /frete/cotacao`, `POST /pedidos` |
| RF10 chat | `POST /mensagens`, `GET /mensagens/conversas`, `GET /mensagens?com=` |
| RF11 avaliações | `POST /pedidos/{id}/avaliacoes`, `GET /usuarios/{id}/avaliacoes` |
| RF12 favoritos | `GET /favoritos`, `PUT` e `DELETE /favoritos/{idAnuncio}` |
| RF13 denúncias | `POST /denuncias` |
| RF14 catálogo mestre | `POST`, `PATCH` e `DELETE /instrumentos` (admin) |
| RF15 remoção e banimento | `POST /admin/anuncios/{id}/remover`, `POST /admin/usuarios/{id}/banimento` |
| RF16 disputas | `GET /admin/disputas`, `POST /admin/pedidos/{id}/resolucao` |
| RN01 taxa de 7% | Calculada no checkout (`taxaPlataforma`, `valorRepasseVendedor`) |
| RN02 liberação em 48h | Pedido `entregue` passa a `concluido` 48h após a entrega |
| RN03 rastreio em 3 dias úteis | `prazoRastreio` e `rastreioAtrasado` no pedido; `POST /pedidos/{id}/rastreio` |
| RN04 disputa em até 48h | `POST /pedidos/{id}/disputa` recusa pedidos fora do prazo |
| RN07 suspensão abaixo de 2 estrelas | Recalculada a cada avaliação do vendedor; bloqueia `POST /anuncios` |
| RN08 / RNF08 fotos de até 5 MB | Multer limita o tamanho e o sharp redimensiona para no máximo 1200 px (JPEG) |
| RN09 recibo da taxa | `GET /pedidos/{id}/recibo` |
| RNF06 HTTPS | Redireciona para HTTPS em produção; a Vercel fornece o certificado |
| RNF10 10 logins por minuto | `express-rate-limit` em login e recuperação de senha |

Fluxo de um pedido: `pago` → `enviado` (rastreio) → `entregue` (confirmação do comprador) → `concluido` (após 48h). A partir de `entregue`, o comprador pode abrir disputa (`em_disputa`). O administrador resolve com `cancelado`, `devolucao_autorizada`, `reembolsado` ou `concluido`.

## Decisões e limitações

- **RF08 (propostas de preço)** não tem classe no diagrama; foi criada a classe `Oferta` (valor, status, expiraEm, comprador, autor, anúncio). Propostas pendentes e aceitas expiram em 24h. O vendedor pode desativar propostas no anúncio (`aceitaPropostas`).
- **RN04 (segunda linha, "Lojas Profissionais")** contradiz a seção 2.4 (somente C2C) e foi ignorada.
- **Pagamento, Pix e frete** funcionam em sandbox, como permite a seção 2.4. Para integrar de verdade, troque `src/services/pagamento.js` e `src/services/frete.js`.
- **E-mail** (recuperação de senha, recibo) é simulado: fora de produção, o token volta na resposta.

## Deploy na Vercel

1. Crie um projeto na Vercel apontando para este repositório com **Root Directory = `backend`**.
2. Defina as variáveis `DATABASE_URL` (PostgreSQL com pooling, como Neon ou Supabase), `JWT_SECRET`, `PUBLIC_URL` e `CORS_ORIGINS` (a URL do frontend).
3. O banco do Supabase foi criado pelos scripts de `backend/sql/` (veja abaixo), então o build da Vercel só gera o cliente Prisma (`vercel-build` = `prisma generate`) e **não** roda migrações: `prisma migrate deploy` falharia, pois as tabelas já existem.

### Banco de dados

Todas as chaves primárias são **números inteiros auto-incrementados** (`idUsuario`, `idAnuncio`...). Só `Pedido.idTransacao` é texto (código do gateway de pagamento).

- **Desenvolvimento local:** `npm run db:migrate` cria as tabelas a partir de `prisma/schema.prisma`.
- **Supabase (produção):** rode os scripts de `backend/sql/` no SQL Editor, nesta ordem: `01-estrutura`, `02-usuarios`, `03-instrumentos`, `03b-ids-numericos`, `03c-ids-numericos-restante`. Os dois últimos convertem os ids de texto para número; o resultado é igual ao do schema atual.
- Se um dia quiser usar `prisma migrate` nesse mesmo banco, registre a migração inicial como já aplicada: `npx prisma migrate resolve --applied 20261113190000_init`.

Limitações da Vercel:

- Cada requisição aceita no máximo 4,5 MB. Fotos de até 5 MB passam no servidor local, mas na Vercel precisam ser enviadas reduzidas (o frontend já redimensiona antes do upload).
- O limite de login (RNF10) é mantido na memória de cada instância. Para um limite global, use um store compartilhado, como o Upstash Redis.
