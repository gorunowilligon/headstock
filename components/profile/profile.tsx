'use client'

import { useState, type FormEvent } from 'react'
import { LogOut, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ListingRow } from '@/components/profile/listing-row'
import { mensagemDeErro } from '@/lib/api'
import type { Anuncio, UsuarioSessao } from '@/lib/models'

type CamposPerfil = { nome?: string, enderecoCompleto?: string, chavePix?: string }

export function Profile({ usuario, meusAnuncios, abaInicial = 'dados', onSalvarPerfil, onSair, onEditListing, onTogglePause, onDeleteListing }: {
  usuario: UsuarioSessao
  meusAnuncios: Anuncio[]
  abaInicial?: string
  onSalvarPerfil: (campos: CamposPerfil) => Promise<void>
  onSair: () => void
  onEditListing: (id: string) => void
  onTogglePause: (id: string) => void
  onDeleteListing: (id: string) => void
}) {
  const [tab, setTab] = useState(abaInicial)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso', texto: string } | null>(null)

  const campos: { nome: keyof CamposPerfil | 'email', label: string, valor: string, somenteLeitura?: boolean }[] = tab === 'dados'
    ? [{ nome: 'nome', label: 'Nome completo', valor: usuario.nome }, { nome: 'email', label: 'E-mail', valor: usuario.email, somenteLeitura: true }]
    : tab === 'endereco'
      ? [{ nome: 'enderecoCompleto', label: 'Endereço completo', valor: usuario.enderecoCompleto }]
      : [{ nome: 'chavePix', label: 'Chave Pix', valor: usuario.chavePix }]

  const mudarAba = (nova: string) => { setTab(nova); setMensagem(null) }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const alterados: CamposPerfil = {}
    for (const campo of campos) {
      if (!campo.somenteLeitura) alterados[campo.nome as keyof CamposPerfil] = String(data.get(campo.nome) ?? '').trim()
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
    <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-600">Sua conta</p>
          <h1 className="mt-1 text-3xl font-extrabold">Meu perfil</h1>
        </div>
        <Button variant="outline" onClick={onSair} className="gap-2"><LogOut /> Sair</Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-auto lg:flex-col">
          {[['dados', 'Meus dados'], ['anuncios', 'Meus anúncios'], ['endereco', 'Endereços'], ['financeiro', 'Financeiro']].map(([key, label]) => (
            <button key={key} onClick={() => mudarAba(key)} className={`whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-semibold ${tab === key ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </nav>
        <section className="max-w-2xl rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">{tab === 'dados' ? 'Dados pessoais' : tab === 'anuncios' ? 'Meus anúncios' : tab === 'endereco' ? 'Endereço de entrega' : 'Financeiro e pagamentos'}</h2>
          {tab === 'anuncios' ? (
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
            <form key={tab} onSubmit={handleSubmit}>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {campos.map((campo) => (
                  <label key={campo.nome} className="text-sm font-semibold">
                    {campo.label}
                    <input name={campo.nome} defaultValue={campo.valor} readOnly={campo.somenteLeitura} className={`mt-2 w-full rounded-lg border px-3 py-3 font-normal ${campo.somenteLeitura ? 'bg-gray-50 text-gray-500' : ''}`} />
                  </label>
                ))}
              </div>
              {mensagem && <p role={mensagem.tipo === 'erro' ? 'alert' : 'status'} className={`mt-4 text-sm font-semibold ${mensagem.tipo === 'erro' ? 'text-red-600' : 'text-green-600'}`}>{mensagem.texto}</p>}
              <Button type="submit" disabled={salvando} className="mt-6 bg-red-600 hover:bg-red-700">{salvando ? 'Salvando...' : 'Salvar alterações'}</Button>
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
