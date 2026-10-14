'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ListingRow } from '@/components/profile/listing-row'
import type { Product } from '@/lib/products'

export function Profile({ meusAnuncios, pausados, onTogglePause, onDeleteListing }: { meusAnuncios: Product[], pausados: number[], onTogglePause: (id: number) => void, onDeleteListing: (id: number) => void }) {
  const [tab, setTab] = useState('dados')
  const fields = tab === 'dados'
    ? [['Nome completo', 'Marcos Cavalcanti'], ['E-mail', 'marcos@email.com'], ['Data de nascimento', '12/08/1992']]
    : tab === 'endereco'
      ? [['CEP', '01310-100'], ['Rua', 'Av. Paulista'], ['Número', '1500']]
      : [['Cartão principal', '•••• 4242'], ['Chave Pix', 'marcos@email.com']]

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-red-600">Sua conta</p>
        <h1 className="mt-1 text-3xl font-extrabold">Meu perfil</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-auto lg:flex-col">
          {[['dados', 'Meus dados'], ['anuncios', 'Meus anúncios'], ['endereco', 'Endereços'], ['financeiro', 'Financeiro']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-semibold ${tab === key ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </nav>
        <section className="max-w-2xl rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold">{tab === 'dados' ? 'Dados pessoais' : tab === 'anuncios' ? 'Meus anúncios' : tab === 'endereco' ? 'Endereço de entrega' : 'Financeiro e pagamentos'}</h2>
          {tab === 'anuncios' ? (
            <div className="mt-6 flex flex-col gap-3">
              {meusAnuncios.map((anuncio) => (
                <ListingRow
                  key={anuncio.id}
                  listing={anuncio}
                  isPaused={pausados.includes(anuncio.id)}
                  onTogglePause={() => onTogglePause(anuncio.id)}
                  onDelete={() => onDeleteListing(anuncio.id)}
                />
              ))}
              {meusAnuncios.length === 0 && <p className="rounded-xl border-2 border-dashed p-6 text-center text-sm text-gray-500">Você não tem anúncios publicados.</p>}
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {fields.map(([label, value]) => (
                  <label key={label} className="text-sm font-semibold">{label}<input className="mt-2 w-full rounded-lg border px-3 py-3 font-normal" defaultValue={value} /></label>
                ))}
              </div>
              <Button variant="outline" className="mt-6">{tab === 'dados' ? 'Alterar senha' : 'Adicionar novo'}</Button>
            </>
          )}
          <div className="mt-8 flex items-center gap-4 rounded-xl bg-amber-50 p-4">
            <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`size-5 ${i === 5 ? 'text-amber-300' : 'fill-amber-400 text-amber-400'}`} />)}</div>
            <div>
              <p className="font-bold">4.8 Estrelas · Reputação do vendedor</p>
              <p className="text-xs text-gray-600">Contas com menos de 2 estrelas são suspensas de criar anúncios.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
