import { CircleDollarSign, MoreHorizontal, RefreshCcw, Search, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Chat() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
      <div className="mb-7">
        <p className="text-sm font-semibold text-red-600">Conecte-se com músicos</p>
        <h1 className="mt-1 text-3xl font-extrabold">Negociações</h1>
      </div>
      <div className="grid min-h-[620px] overflow-hidden rounded-2xl border bg-white md:grid-cols-[300px_1fr]">
        <aside className="border-r bg-gray-50">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Conversas</h2>
              <button aria-label="Mais opções"><MoreHorizontal /></button>
            </div>
            <div className="mt-3 flex items-center rounded-lg border bg-white px-3 py-2">
              <Search className="size-4 text-gray-400" />
              <input className="w-full bg-transparent px-2 text-sm outline-none" placeholder="Buscar conversa" />
            </div>
          </div>
          <button className="flex w-full gap-3 border-b bg-white p-4 text-left">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-red-100 font-bold text-red-600">AF</div>
            <div className="min-w-0">
              <p className="font-semibold">André Fernandes</p>
              <p className="truncate text-xs text-gray-500">Como estão os trastes?</p>
            </div>
            <span className="ml-auto text-[10px] text-gray-400">10:42</span>
          </button>
        </aside>
        <section className="flex flex-col">
          <div className="flex items-center gap-3 border-b p-4">
            <div className="grid size-10 place-items-center rounded-full bg-red-100 font-bold text-red-600">AF</div>
            <div>
              <p className="font-semibold">André Fernandes</p>
              <p className="text-xs text-green-600">Online agora</p>
            </div>
          </div>
          <div className="flex-1 space-y-5 p-5">
            <p className="text-center text-xs text-gray-400">Hoje</p>
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-gray-100 p-3 text-sm">Oi! Tenho interesse na sua Strat. Como estão os trastes? <span className="mt-1 block text-right text-[10px] text-gray-400">10:36</span></div>
            <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-red-600 p-3 text-sm text-white">Oi, André! Estão com mais de 80% de vida útil, sem pontos mortos. Posso mandar um vídeo se quiser. <span className="mt-1 block text-right text-[10px] text-red-100">10:39</span></div>
            <div className="mx-auto max-w-sm rounded-2xl border-2 border-red-100 bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-bold text-red-700"><CircleDollarSign className="size-5" /> Proposta recebida</p>
                <span className="text-xs font-semibold text-red-600">Expira em 24h</span>
              </div>
              <p className="mt-4 text-3xl font-extrabold">R$ 4.500</p>
              <p className="mt-1 text-xs text-gray-500">para Fender Stratocaster Player Plus</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">Aceitar</Button>
                <Button size="sm" variant="outline" className="flex-1">Recusar</Button>
                <Button size="icon" variant="outline" aria-label="Fazer contraproposta"><RefreshCcw /></Button>
              </div>
            </div>
          </div>
          <div className="m-4 flex items-center rounded-xl border bg-gray-50 px-4 py-2">
            <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Escreva uma mensagem..." />
            <Button size="icon" className="bg-red-600 hover:bg-red-700" aria-label="Enviar mensagem"><Send /></Button>
          </div>
        </section>
      </div>
    </main>
  )
}
