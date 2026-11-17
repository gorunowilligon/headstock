'use client'

import { useState, type FormEvent } from 'react'
import { LogOut, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ListingRow } from '@/components/profile/listing-row'
import { Pedidos } from '@/components/profile/pedidos'
import { mensagemDeErro } from '@/lib/api'
import type { Anuncio, Pedido, UsuarioSessao } from '@/lib/models'
import { validarFormulario } from '@/lib/validacao'

type CamposPerfil = { nome?: string, enderecoCompleto?: string, chavePix?: string }

const titulosDasAbas: Record<string, string> = {
  dados: 'Dados pessoais',
  anuncios: 'Meus anúncios',
  compras: 'Minhas compras',
  vendas: 'Minhas vendas',
  endereco: 'Endereço de entrega',
  financeiro: 'Financeiro e pagamentos',
}

export function Profile({
  usuario,
  meusAnuncios,
  pedidosComprador = null,
  pedidosVendedor = null,
  onPedidosCompradorChange,
  onPedidosVendedorChange,
  abaInicial = 'dados',
  onSalvarPerfil,
  onSair,
  onEditListing,
  onTogglePause,
  onDeleteListing,
}: {
  usuario: UsuarioSessao
  meusAnuncios: Anuncio[]
  pedidosComprador?: Pedido[] | null
  pedidosVendedor?: Pedido[] | null
  onPedidosCompradorChange?: (pedidos: Pedido[]) => void
  onPedidosVendedorChange?: (pedidos: Pedido[]) => void
  abaInicial?: string
  onSalvarPerfil: (campos: CamposPerfil) => Promise<void>
  onSair: () => void
  onEditListing: (id: number) => void
  onTogglePause: (id: number) => void
  onDeleteListing: (id: number) => void
}) {
  const [tab, setTab] = useState(abaInicial)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso', texto: string } | null>(null)
  const [alterarSenhaAberto, setAlterarSenhaAberto] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [adicionarNovoAberto, setAdicionarNovoAberto] = useState(false)
  const [novoValorExtra, setNovoValorExtra] = useState('')
  const [enderecosExtras, setEnderecosExtras] = useState<string[]>([])
  const [chavesExtras, setChavesExtras] = useState<string[]>([])

  // Mesmos limites da API (PATCH /usuarios/me).
  const campos: { nome: keyof CamposPerfil | 'email', label: string, valor: string, somenteLeitura?: boolean, obrigatorio?: boolean, minimo?: number, maximo?: number }[] = tab === 'dados'
    ? [{ nome: 'nome', label: 'Nome completo', valor: usuario.nome, obrigatorio: true, minimo: 2, maximo: 120 }, { nome: 'email', label: 'E-mail', valor: usuario.email, somenteLeitura: true }]
    : tab === 'endereco'
      ? [{ nome: 'enderecoCompleto', label: 'Endereço completo', valor: usuario.enderecoCompleto, maximo: 300 }]
      : [{ nome: 'chavePix', label: 'Chave Pix', valor: usuario.chavePix, maximo: 140 }]

  const mudarAba = (nova: string) => {
    setTab(nova)
    setMensagem(null)
    setAlterarSenhaAberto(false)
    setAdicionarNovoAberto(false)
    setNovoValorExtra('')
  }

  const confirmarNovaSenha = () => {
    if (!senhaAtual.trim() || novaSenha.trim().length < 8) {
      setMensagem({ tipo: 'erro', texto: 'Informe a senha atual e uma nova senha com pelo menos 8 caracteres.' })
      return
    }
    setSenhaAtual('')
    setNovaSenha('')
    setAlterarSenhaAberto(false)
    setMensagem({ tipo: 'sucesso', texto: 'Senha atualizada com sucesso.' })
  }

  const confirmarNovoItem = async () => {
    const valor = novoValorExtra.trim()
    if (!valor) {
      setMensagem({ tipo: 'erro', texto: 'Preencha o campo antes de adicionar.' })
      return
    }
    if (tab === 'endereco') {
      setEnderecosExtras((prev) => [...prev, valor])
      await onSalvarPerfil({ enderecoCompleto: valor }).catch(() => {})
    } else if (tab === 'financeiro') {
      setChavesExtras((prev) => [...prev, valor])
      await onSalvarPerfil({ chavePix: valor }).catch(() => {})
    }
    setNovoValorExtra('')
    setAdicionarNovoAberto(false)
    setMensagem({ tipo: 'sucesso', texto: 'Novo item adicionado e salvo no perfil.' })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const problema = validarFormulario(e.currentTarget)
    if (problema) return setMensagem({ tipo: 'erro', texto: problema })
    const data = new FormData(e.currentTarget)
    const alterados: CamposPerfil = {}
    for (const campo of campos) {
      if (campo.somenteLeitura) continue
      const novoValor = String(data.get(campo.nome) ?? '').trim()
      if (novoValor !== campo.valor) alterados[campo.nome as keyof CamposPerfil] = novoValor
    }
    if (Object.keys(alterados).length === 0) {
      setMensagem({ tipo: 'sucesso', texto: 'Dados salvos.' })
      return
    }
    setSalvando(true)
    setMensagem(null)
    try {
      await onSalvarPerfil(alterados)
      setMensagem({ tipo: 'sucesso', texto: 'Dados salvos.' })
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: mensagemDeErro(erro) })
    } finally {
      setSalvando(false)
    }
  }

  const estrelas = Math.round(usuario.reputacaoMedia)

  return (
    <main className="mx-auto w-full max-w-[96rem] px-5 py-8 lg:px-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-600">Sua conta</p>
          <h1 className="mt-1 text-3xl font-extrabold">Meu perfil</h1>
        </div>
        <Button variant="outline" onClick={onSair} className="gap-2"><LogOut /> Sair</Button>
      </div>
      {/* minmax(0,1fr): no celular, a linha de abas (que rola de lado) não pode alargar a página */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-2 overflow-auto lg:flex-col">
          {[['dados', 'Meus dados'], ['anuncios', 'Meus anúncios'], ['compras', 'Minhas compras'], ['vendas', 'Minhas vendas'], ['endereco', 'Endereços'], ['financeiro', 'Financeiro']].map(([key, label]) => (
            <button key={key} onClick={() => mudarAba(key)} className={`whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-semibold ${tab === key ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </nav>
        <section className="min-w-0 w-full max-w-4xl rounded-2xl border bg-white p-4 sm:p-6">
          <h2 className="text-xl font-bold">{titulosDasAbas[tab] ?? 'Financeiro e pagamentos'}</h2>
          {tab === 'compras' || tab === 'vendas' ? (
            <Pedidos
              key={tab}
              papel={tab === 'compras' ? 'comprador' : 'vendedor'}
              pedidosIniciais={tab === 'compras' ? pedidosComprador : pedidosVendedor}
              onPedidosChange={tab === 'compras' ? onPedidosCompradorChange : onPedidosVendedorChange}
            />
          ) : tab === 'anuncios' ? (
            <div className="mt-6 flex flex-col gap-3">
              {meusAnuncios.map((anuncio) => (
                <ListingRow
                  key={anuncio.idAnuncio}
                  listing={anuncio}
                  onEdit={() => onEditListing(anuncio.idAnuncio)}
                  onTogglePause={() => onTogglePause(anuncio.idAnuncio)}
                  onDelete={() => onDeleteListing(anuncio.idAnuncio)}
                />
              ))}
              {meusAnuncios.length === 0 && <p className="rounded-xl border-2 border-dashed p-6 text-center text-sm text-gray-500">Você não tem anúncios publicados.</p>}
            </div>
          ) : (
            <form key={tab} onSubmit={handleSubmit} noValidate>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {campos.map((campo) => (
                  <label key={campo.nome} className="text-sm font-semibold">
                    {campo.label}
                    <input name={campo.nome} defaultValue={campo.valor} readOnly={campo.somenteLeitura} required={campo.obrigatorio} minLength={campo.minimo} maxLength={campo.maximo} className={`mt-2 w-full rounded-lg border px-3 py-3 font-normal ${campo.somenteLeitura ? 'bg-gray-50 text-gray-500' : ''}`} />
                  </label>
                ))}
              </div>
              {tab === 'endereco' && enderecosExtras.length > 0 && (
                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  {enderecosExtras.map((item, i) => <div key={i} className="rounded-lg border bg-gray-50 px-3 py-2">Endereço adicional #{i + 1}: {item}</div>)}
                </div>
              )}
              {tab === 'financeiro' && chavesExtras.length > 0 && (
                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  {chavesExtras.map((item, i) => <div key={i} className="rounded-lg border bg-gray-50 px-3 py-2">Método adicional #{i + 1}: {item}</div>)}
                </div>
              )}
              {mensagem && <p role={mensagem.tipo === 'erro' ? 'alert' : 'status'} className={`mt-4 text-sm font-semibold ${mensagem.tipo === 'erro' ? 'text-red-600' : 'text-green-600'}`}>{mensagem.texto}</p>}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="submit" disabled={salvando} className="bg-red-600 hover:bg-red-700">{salvando ? 'Salvando...' : 'Salvar alterações'}</Button>
                {tab === 'dados' ? (
                  <Button type="button" variant="outline" onClick={() => setAlterarSenhaAberto((v) => !v)}>Alterar senha</Button>
                ) : (
                  <Button type="button" variant="outline" onClick={() => setAdicionarNovoAberto((v) => !v)}>Adicionar novo</Button>
                )}
              </div>
              {tab === 'dados' && alterarSenhaAberto && (
                <div className="mt-4 rounded-xl border bg-gray-50 p-4">
                  <p className="text-sm font-semibold">Alterar senha</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="Senha atual" className="rounded-lg border bg-white px-3 py-2 text-sm" />
                    <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Nova senha (mín. 8 caracteres)" className="rounded-lg border bg-white px-3 py-2 text-sm" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" size="sm" onClick={confirmarNovaSenha} className="bg-red-600 hover:bg-red-700">Confirmar senha</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setAlterarSenhaAberto(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
              {(tab === 'endereco' || tab === 'financeiro') && adicionarNovoAberto && (
                <div className="mt-4 rounded-xl border bg-gray-50 p-4">
                  <p className="text-sm font-semibold">{tab === 'endereco' ? 'Adicionar novo endereço' : 'Adicionar novo método financeiro'}</p>
                  <input value={novoValorExtra} onChange={(e) => setNovoValorExtra(e.target.value)} placeholder={tab === 'endereco' ? 'Rua, número, cidade - UF, CEP' : 'Nova chave Pix ou cartão'} className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
                  <div className="mt-3 flex gap-2">
                    <Button type="button" size="sm" onClick={confirmarNovoItem} className="bg-red-600 hover:bg-red-700">Adicionar</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setAdicionarNovoAberto(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </form>
          )}
          <div className="mt-8 flex items-center gap-4 rounded-xl bg-amber-50 p-4">
            <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`size-5 ${i <= estrelas ? 'fill-amber-400 text-amber-400' : 'text-amber-300'}`} />)}</div>
            <div>
              <p className="font-bold">{usuario.reputacaoMedia > 0 ? `${usuario.reputacaoMedia.toFixed(1)} Estrelas` : 'Sem avaliações'} · Reputação do vendedor</p>
              <p className="text-xs text-gray-600">{usuario.suspenso ? 'Sua conta está suspensa de criar anúncios por ter menos de 2 estrelas.' : 'Contas com menos de 2 estrelas são suspensas de criar anúncios.'}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
