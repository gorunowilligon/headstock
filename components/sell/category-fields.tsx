import { AccessoryFields } from '@/components/sell/accessory-fields'
import { AcousticFields } from '@/components/sell/acoustic-fields'
import { AmpFields } from '@/components/sell/amp-fields'
import { GuitarBassFields } from '@/components/sell/guitar-bass-fields'
import { PedalFields } from '@/components/sell/pedal-fields'
import type { Categoria } from '@/lib/categories'

export function CategoryFields({ categoria }: { categoria: Categoria | '' }) {
  switch (categoria) {
    case 'guitarra':
    case 'contrabaixo':
      return <GuitarBassFields isBass={categoria === 'contrabaixo'} />
    case 'violao':
      return <AcousticFields />
    case 'amp-guitarra':
    case 'amp-contrabaixo':
    case 'amp-violao':
      return <AmpFields />
    case 'pedais':
      return <PedalFields />
    case 'acessorios':
      return <AccessoryFields />
    default:
      return <p className="rounded-xl border-2 border-dashed p-5 text-center text-sm text-gray-500">Selecione uma categoria para ver as especificações técnicas.</p>
  }
}
