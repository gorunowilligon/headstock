'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Sell() {
  const [price, setPrice] = useState('')
  const value = Number(price) || 0

  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600">Venda para a comunidade</p>
          <h1 className="mt-1 text-3xl font-extrabold">Criar anúncio</h1>
          <p className="mt-2 text-gray-500">Conte a história do seu instrumento e encontre o próximo dono.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-1 text-lg font-bold">1. Fotos do instrumento</h2>
              <p className="mb-5 text-sm text-gray-500">Envie no mínimo 3 fotos do item. Limite de 5 MB por imagem (serão redimensionadas no servidor).</p>
              <div className="grid min-h-52 place-items-center rounded-xl border-2 border-dashed border-red-200 bg-red-50/40 p-6 text-center">
                <div>
                  <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><Upload /></div>
                  <p className="font-semibold">Arraste suas fotos aqui</p>
                  <p className="mt-1 text-sm text-gray-500">ou <span className="font-semibold text-red-600">selecione os arquivos</span></p>
                </div>
              </div>
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold">2. O que você está vendendo?</h2>
              <label className="mb-4 block text-sm font-semibold">
                Instrumento do catálogo mestre
                <select className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal">
                  <option>Fender Stratocaster Player Plus</option>
                  <option>Selecione um instrumento</option>
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" /> Modelo não consta no catálogo? Preencha as especificações manualmente</label>
            </section>
            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-5 text-lg font-bold">3. Preço e preferências</h2>
              <label className="block text-sm font-semibold">
                Valor do anúncio
                <div className="mt-2 flex items-center rounded-lg border px-3">
                  <span className="text-gray-400">R$</span>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full px-2 py-3 outline-none" placeholder="0,00" />
                </div>
              </label>
              <label className="mt-5 flex items-center justify-between border-t pt-5 text-sm font-semibold">
                Aceitar propostas de preço
                <input type="checkbox" defaultChecked />
              </label>
            </section>
          </div>
          <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-bold">Resumo financeiro</h2>
            <p className="mt-1 text-sm text-gray-500">Você recebe após a venda.</p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span>Valor do anúncio</span>
                <strong>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Taxa Headstock (7%)</span>
                <span>- R$ {(value * .07).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-4 text-base">
                <strong>Você receberá</strong>
                <strong className="text-xl text-red-600">R$ {(value * .93).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
            <Button className="mt-7 w-full bg-red-600 hover:bg-red-700">Publicar anúncio</Button>
          </aside>
        </div>
      </div>
    </main>
  )
}
