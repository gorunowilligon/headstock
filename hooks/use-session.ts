import { useCallback, useEffect, useState } from 'react'
import { api, definirAoExpirarSessao, tokenStorage } from '@/lib/api'
import type { UsuarioSessao } from '@/lib/models'

interface RespostaAuth { token: string, usuario: UsuarioSessao }

export interface DadosCadastro {
  nome: string
  email: string
  senha: string
}

export function useSessao() {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    definirAoExpirarSessao(() => setUsuario(null))
    if (!tokenStorage.ler()) {
      setCarregando(false)
      return
    }
    api<UsuarioSessao>('/usuarios/me')
      .then(setUsuario)
      .catch(() => tokenStorage.limpar())
      .finally(() => setCarregando(false))
    return () => definirAoExpirarSessao(null)
  }, [])

  const iniciar = useCallback(async (caminho: string, body: unknown) => {
    const resposta = await api<RespostaAuth>(caminho, { method: 'POST', body })
    tokenStorage.salvar(resposta.token)
    setUsuario(resposta.usuario)
  }, [])

  return {
    usuario,
    carregando,
    entrar: (email: string, senha: string) => iniciar('/auth/login', { email, senha }),
    cadastrar: (dados: DadosCadastro) => iniciar('/auth/cadastro', dados),
    sair: () => { tokenStorage.limpar(); setUsuario(null) },
    atualizar: setUsuario,
  }
}
