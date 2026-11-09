import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { config } from '../config.js'
import { prisma } from '../db.js'
import { gerarToken } from '../http/auth.js'
import { HttpError } from '../http/erros.js'
import { criarRouter } from '../http/rota.js'
import { serializarUsuarioPrivado } from '../http/serializar.js'
import { TENTATIVAS_LOGIN_POR_MINUTO } from '../regras.js'

const CUSTO_BCRYPT = 10 // RNF03
const MINUTOS_VALIDADE_RECUPERACAO = 60

// RNF10: no máximo 10 tentativas por minuto por IP.
// Na Vercel cada instância tem sua própria memória; para um limite global use um store como Redis/Upstash.
const limitarTentativas = rateLimit({
  windowMs: 60_000,
  limit: TENTATIVAS_LOGIN_POR_MINUTO,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.' },
})

// Hash usado quando o e-mail não existe, para o tempo de resposta não revelar contas cadastradas.
const HASH_FICTICIO = bcrypt.hashSync('senha-ficticia-para-tempo-constante', CUSTO_BCRYPT)

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

const email = z.string().trim().toLowerCase().email('E-mail inválido')
const senha = z.string().min(8, 'A senha deve ter pelo menos 8 caracteres').max(72, 'A senha deve ter no máximo 72 caracteres')

const rotas = criarRouter('/auth', 'Autenticação')

rotas.post('/cadastro', {
  resumo: 'Cadastrar usuário (RF01)',
  status: 201,
  body: z.object({
    nome: z.string().trim().min(2).max(120),
    email,
    senha,
    chavePix: z.string().trim().max(140).optional(),
    enderecoCompleto: z.string().trim().max(300).optional(),
  }),
  handler: async ({ body }) => {
    const existente = await prisma.usuario.findUnique({ where: { email: body.email } })
    if (existente) throw new HttpError(409, 'Já existe uma conta com este e-mail')

    const usuario = await prisma.usuario.create({
      data: {
        nome: body.nome,
        email: body.email,
        senhaHash: await bcrypt.hash(body.senha, CUSTO_BCRYPT),
        chavePix: body.chavePix,
        enderecoCompleto: body.enderecoCompleto,
      },
    })
    return { token: gerarToken(usuario), usuario: serializarUsuarioPrivado(usuario) }
  },
})

rotas.post('/login', {
  resumo: 'Efetuar login (RF07, RNF10: 10 tentativas/minuto)',
  antes: [limitarTentativas],
  body: z.object({ email, senha: z.string().min(1) }),
  handler: async ({ body }) => {
    const usuario = await prisma.usuario.findUnique({ where: { email: body.email } })
    const senhaConfere = await bcrypt.compare(body.senha, usuario?.senhaHash ?? HASH_FICTICIO)
    if (!usuario || !senhaConfere) throw new HttpError(401, 'E-mail ou senha incorretos')
    if (usuario.banido) throw new HttpError(403, 'Esta conta foi banida pela moderação')
    return { token: gerarToken(usuario), usuario: serializarUsuarioPrivado(usuario) }
  },
})

rotas.post('/recuperar-senha', {
  resumo: 'Solicitar recuperação de senha (RF01)',
  descricao: 'Sempre responde 200 para não revelar quais e-mails existem. O envio de e-mail é simulado: fora de produção o token volta na resposta (campo tokenDesenvolvimento).',
  antes: [limitarTentativas],
  body: z.object({ email }),
  handler: async ({ body }) => {
    const resposta = { mensagem: 'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.' }
    const usuario = await prisma.usuario.findUnique({ where: { email: body.email } })
    if (!usuario) return resposta

    const token = crypto.randomBytes(32).toString('hex')
    await prisma.usuario.update({
      where: { idUsuario: usuario.idUsuario },
      data: {
        tokenRecuperacaoHash: hashToken(token),
        tokenRecuperacaoExpira: new Date(Date.now() + MINUTOS_VALIDADE_RECUPERACAO * 60_000),
      },
    })
    console.info(`[e-mail simulado] Recuperação de senha para ${usuario.email}: token ${token}`)
    return config.producao ? resposta : { ...resposta, tokenDesenvolvimento: token }
  },
})

rotas.post('/redefinir-senha', {
  resumo: 'Redefinir senha com o token recebido (RF01)',
  antes: [limitarTentativas],
  body: z.object({ token: z.string().min(1), novaSenha: senha }),
  handler: async ({ body }) => {
    const usuario = await prisma.usuario.findFirst({
      where: { tokenRecuperacaoHash: hashToken(body.token), tokenRecuperacaoExpira: { gt: new Date() } },
    })
    if (!usuario) throw new HttpError(400, 'Token inválido ou expirado')

    await prisma.usuario.update({
      where: { idUsuario: usuario.idUsuario },
      data: {
        senhaHash: await bcrypt.hash(body.novaSenha, CUSTO_BCRYPT),
        tokenRecuperacaoHash: null,
        tokenRecuperacaoExpira: null,
      },
    })
    return { mensagem: 'Senha redefinida com sucesso' }
  },
})

export default rotas
