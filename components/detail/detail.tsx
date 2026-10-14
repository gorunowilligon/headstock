'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, CreditCard, Flag, PackageCheck, ShieldCheck, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReportDialog } from '@/components/detail/report-dialog'
import { Spec } from '@/components/detail/spec'
import { products } from '@/lib/products'

export function Detail({ onBack }: { onBack: () => void }) {
  const [photo, setPhoto] = useState(0)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const photos = [
    products[0].image,
    'https://images.unsplash.com/photo-1526924143875-1e1d8d4f9f8f?auto=format&fit=crop&w=1000&q=85',
    'https://images.unsplash.com/photo-1556449895-a33c9dba33dd?auto=format&fit=crop&w=1000&q=85',
  ]

  useEffect(() => {
    if (!reportSent) return
    const timer = setTimeout(() => setReportSent(false), 4000)
    return () => clearTimeout(timer)
  }, [reportSent])

  const handleReportSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsReportOpen(false)
    setMotivo('')
    setReportSent(true)
  }

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8 lg:px-10">
      <button onClick={onBack} className="mb-7 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600"><ArrowLeft /> Voltar para anúncios</button>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <section>
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            <img src={photos[photo]} alt="Fender Stratocaster Player Plus" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {photos.map((src, i) => (
              <button key={src} onClick={() => setPhoto(i)} className={`overflow-hidden rounded-xl border-2 ${photo === i ? 'border-red-600' : 'border-transparent'}`}>
                <img src={src} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold">Especificações técnicas</h2>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-gray-200 text-sm">
              <Spec name="Marca / modelo" value="Fender Stratocaster Player Plus" />
              <Spec name="Madeira do corpo" value="Alder" />
              <Spec name="Braço" value="Maple / Pau Ferro" />
              <Spec name="Captação" value="SSS · Single Coil" />
              <Spec name="Número de cordas" value="6" />
              <Spec name="Acabamento" value="3-Color Sunburst" />
            </div>
            <h2 className="mb-3 mt-10 text-xl font-bold">Sobre este anúncio</h2>
            <p className="leading-7 text-gray-600">Guitarra impecável, regulada e pronta para tocar. Estou vendendo porque migrei para uma configuração diferente. Acompanha bag acolchoada e ponteira original. Sem marcas relevantes, trastes com mais de 80% de vida útil.</p>
          </div>
        </section>
        <aside>
          <div className="sticky top-28 flex flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm">
            <Badge className="w-fit bg-red-50 text-red-700 hover:bg-red-50">Destaque</Badge>
            <div>
              <h1 className="text-2xl font-extrabold leading-tight">Fender Stratocaster Player Plus</h1>
              <p className="mt-2 text-sm text-gray-500">Usado · Excelente · São Paulo, SP</p>
            </div>
            <div className="border-y py-5">
              <p className="text-3xl font-extrabold text-red-600">R$ 6.890</p>
              <p className="mt-1 text-sm text-gray-500">ou 10x de R$ 689,00 sem juros</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button className="h-12 bg-red-600 text-base hover:bg-red-700">Comprar agora</Button>
              <Button variant="outline" className="h-12 border-red-600 text-base text-red-600 hover:bg-red-50">Fazer oferta</Button>
            </div>
            <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-600">
              <p className="flex gap-2"><CreditCard className="mt-0.5 size-4 shrink-0 text-red-600" /> O pagamento só será liberado ao vendedor 48h após a confirmação da sua entrega.</p>
              <p className="flex gap-2"><PackageCheck className="mt-0.5 size-4 shrink-0 text-red-600" /> O vendedor terá 3 dias úteis para enviar o código de rastreio.</p>
              <p className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-red-600" /> Você tem 48h após a entrega para contestar o estado do instrumento.</p>
            </div>
            <div className="flex items-center gap-3 border-t pt-4">
              <div className="grid size-10 place-items-center rounded-full bg-red-100 font-bold text-red-600">MC</div>
              <div>
                <p className="text-sm font-semibold">Marcos Cavalcanti</p>
                <p className="flex items-center gap-1 text-xs text-gray-500"><Star className="size-3 fill-amber-400 text-amber-400" /> 4.9 · 23 vendas</p>
              </div>
            </div>
            <div>
              <button onClick={() => setIsReportOpen(true)} className="flex w-fit items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-600"><Flag className="size-3.5" /> Denunciar</button>
              {reportSent && <p role="status" className="mt-2 text-xs font-semibold text-green-600">Denúncia enviada para a moderação.</p>}
            </div>
          </div>
        </aside>
      </div>
      <ReportDialog open={isReportOpen} motivo={motivo} onMotivoChange={setMotivo} onClose={() => setIsReportOpen(false)} onSubmit={handleReportSubmit} />
    </main>
  )
}
