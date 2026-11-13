'use client'

import { useState, type FormEvent } from 'react'
import { Guitar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DadosCadastro } from '@/hooks/use-session'
import { api, mensagemDeErro } from '@/lib/api'

type Modo = 'login' | 'cadastro' | 'recuperar' | 'redefinir'

const titulos: Record<Modo, string> = {
  login: 'Entrar na sua conta',
  cadastro: 'Criar sua conta',
  recuperar: 'Recuperar senha',
  redefinir: 'Definir nova senha',
}

const inputClass = 'mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal outline-none focus:border-red-600'

export function AuthForm({ entrar, cadastrar, onSucesso, motivo }: {
  entrar: (email: string, senha: string) => Promise<void>
  cadastrar: (dados: DadosCadastro) => Promise<void>
  onSucesso: () => void
  motivo?: string
}) {
  const [modo, setModo] = useState<Modo>('login')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [info, setInfo] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')

  const mudarModo = (novo: Modo) => { setModo(novo); setErro(''); setInfo('') }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const campo = (nome: string) => String(data.get(nome) ?? '').trim()
    setEnviando(true)
    setErro('')
    try {
      if (modo === 'login') {
        await entrar(campo('email'), String(data.get('senha') ?? ''))
        onSucesso()
      } else if (modo === 'cadastro') {
        await cadastrar({ nome: campo('nome'), email: campo('email'), senha: String(data.get('senha') ?? '') })
        onSucesso()
      } else if (modo === 'recuperar') {
        const resposta = await api<{ mensagem: string, tokenDesenvolvimento?: string }>('/auth/recuperar-senha', { method: 'POST', body: { email: campo('email') } })
        setEmail(campo('email'))
        // Fora de produção a API devolve o token, já que o envio de e-mail é simulado.
        setToken(resposta.tokenDesenvolvimento ?? '')
        setModo('redefinir')
        setInfo(resposta.tokenDesenvolvimento ? 'Ambiente de desenvolvimento: o código de recuperação já foi preenchido.' : resposta.mensagem)
      } else {
        await api('/auth/redefinir-senha', { method: 'POST', body: { token: campo('token'), novaSenha: String(data.get('novaSenha') ?? '') } })
        setModo('login')
        setToken('')
        setInfo('Senha redefinida. Entre com a nova senha.')
      }
    } catch (error) {
      setErro(mensagemDeErro(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="grid min-h-[70vh] place-items-center bg-gray-50 px-5 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-red-600 text-white"><Guitar /></span>
          <h1 className="text-2xl font-extrabold">{titulos[modo]}</h1>
        </div>
        {motivo && modo === 'login' && <p className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{motivo}</p>}
        {info && <p role="status" className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">{info}</p>}

        <div className="flex flex-col gap-4">
          {modo === 'cadastro' && (
            <label className="block text-sm font-semibold">Nome completo<input name="nome" required minLength={2} autoComplete="name" className={inputClass} /></label>
          )}
          {(modo === 'login' || modo === 'cadastro' || modo === 'recuperar') && (
            <label className="block text-sm font-semibold">E-mail<input name="email" type="email" required defaultValue={email} autoComplete="email" className={inputClass} /></label>
          )}
          {(modo === 'login' || modo === 'cadastro') && (
            <label className="block text-sm font-semibold">
              Senha
              <input name="senha" type="password" required minLength={modo === 'cadastro' ? 8 : 1} autoComplete={modo === 'login' ? 'current-password' : 'new-password'} className={inputClass} />
              {modo === 'cadastro' && <span className="mt-1 block text-xs font-normal text-gray-500">Mínimo de 8 caracteres.</span>}
            </label>
          )}
          {modo === 'redefinir' && (
            <>
              <label className="block text-sm font-semibold">Código de recuperação<input name="token" required defaultValue={token} className={inputClass} /></label>
              <label className="block text-sm font-semibold">Nova senha<input name="novaSenha" type="password" required minLength={8} autoComplete="new-password" className={inputClass} /></label>
            </>
          )}
        </div>

        {erro && <p role="alert" className="mt-4 text-sm font-semibold text-red-600">{erro}</p>}

        <Button type="submit" disabled={enviando} className="mt-6 h-12 w-full bg-red-600 text-base hover:bg-red-700">
          {enviando ? 'Aguarde...' : { login: 'Entrar', cadastro: 'Criar conta', recuperar: 'Enviar instruções', redefinir: 'Redefinir senha' }[modo]}
        </Button>

        <div className="mt-5 flex flex-col gap-2 text-center text-sm text-gray-500">
          {modo === 'login' && (
            <>
              <button type="button" onClick={() => mudarModo('recuperar')} className="font-semibold text-red-600 hover:underline">Esqueci minha senha</button>
              <span>Novo por aqui? <button type="button" onClick={() => mudarModo('cadastro')} className="font-semibold text-red-600 hover:underline">Criar conta</button></span>
            </>
          )}
          {modo !== 'login' && <button type="button" onClick={() => mudarModo('login')} className="font-semibold text-red-600 hover:underline">Voltar para o login</button>}
        </div>
      </form>
    </main>
  )
}
