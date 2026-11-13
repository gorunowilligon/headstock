# Headstock

Marketplace C2C de instrumentos de cordas, amplificadores, pedais e acessórios.

| Pasta | Conteúdo |
|---|---|
| `/` (raiz) | Frontend em Next.js + React + Tailwind |
| `backend/` | API REST em JavaScript (Express) com banco relacional PostgreSQL via Prisma. Veja [backend/README.md](backend/README.md) |

O frontend conversa com o backend apenas pela API REST com JSON (RNF05). Anúncios, fotos, favoritos, usuários, propostas, mensagens, pedidos e denúncias ficam no banco de dados (RNF01, RNF02). O navegador guarda só o token de login.

## Como rodar localmente

1. Suba o banco e a API (detalhes em [backend/README.md](backend/README.md)):

   ```bash
   cd backend
   docker compose up -d          # PostgreSQL local
   cp .env.example .env
   npm install
   npm run db:migrate            # cria as tabelas
   npm run db:seed               # dados de exemplo (senha: headstock123)
   npm run dev                   # http://localhost:3333 (documentação em /docs)
   ```

2. Rode o frontend na raiz:

   ```bash
   cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:3333
   npm install
   npm run dev                   # http://localhost:3000
   ```

## Deploy na Vercel

São dois projetos na Vercel, ligados ao mesmo repositório:

| Projeto | Root Directory | Variáveis de ambiente |
|---|---|---|
| API | `backend` | `DATABASE_URL` (PostgreSQL, ex.: Neon ou Supabase), `JWT_SECRET`, `PUBLIC_URL`, `CORS_ORIGINS` |
| Frontend | `/` | `NEXT_PUBLIC_API_URL` (URL da API) |

O banco (Supabase) é criado pelos scripts SQL de `backend/sql/`, rodados no SQL Editor; o build da API só gera o cliente Prisma. A ordem dos scripts está em [backend/README.md](backend/README.md).

## Funcionalidades

- Cadastro, login e recuperação de senha (RF01, RF07)
- Publicação com no mínimo 3 fotos de até 5 MB, catálogo mestre ou preenchimento manual com especificações por categoria (RF02, RF03, RF04, RN08)
- Edição, pausa e exclusão de anúncios (RF05)
- Busca com filtros de categoria, marca, captação, condição, preço e localização (RF06)
- Propostas de preço com aceite, recusa e contraproposta, válidas por 24h (RF08)
- Checkout com cotação de frete e pagamento por Pix ou cartão em sandbox (RF09, RN01)
- Chat entre comprador e vendedor (RF10)
- Acompanhamento de pedidos: rastreio, confirmação de entrega, disputa, avaliações e recibo (RF11, RN02, RN03, RN04, RN09)
- Favoritos (RF12) e denúncias (RF13)

## Uso de ferramentas de IA

Declaramos o uso das seguintes ferramentas de inteligência artificial no desenvolvimento:

- **v0 (Vercel):** gerou a estrutura inicial do frontend (layout das telas e componentes visuais), no commit `d042061` ("initial headstock SPA generated via v0"). Depois disso, o código foi reorganizado pela equipe para seguir o diagrama de classes e integrado ao backend.
- **Claude Code (Anthropic):** usado como assistente de programação na integração do frontend com a API, nas propostas de preço, no chat, no checkout e nos pedidos. Os commits em que ele participou têm a linha `Co-Authored-By: Claude` na mensagem.
