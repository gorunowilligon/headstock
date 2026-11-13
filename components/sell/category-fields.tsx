import { AccessoryFields } from '@/components/sell/accessory-fields'
import { AcousticFields } from '@/components/sell/acoustic-fields'
import { AmpFields } from '@/components/sell/amp-fields'
import { GuitarBassFields } from '@/components/sell/guitar-bass-fields'
import { PedalFields } from '@/components/sell/pedal-fields'
import type { Categoria } from '@/lib/categories'
import type { ValoresIniciais } from '@/lib/especificacoes'

export function CategoryFields({ categoria, valores }: { categoria: Categoria | '', valores?: ValoresIniciais }) {
  switch (categoria) {
    case 'guitarra':
    case 'contrabaixo':
      return <GuitarBassFields isBass={categoria === 'contrabaixo'} valores={valores} />
    case 'violao':
      return <AcousticFields valores={valores} />
    case 'amp-guitarra':
    case 'amp-contrabaixo':
    case 'amp-violao':
      return <AmpFields valores={valores} />
    case 'pedais':
      return <PedalFields valores={valores} />
    case 'acessorios':
      return <AccessoryFields valores={valores} />
    default:
      return <p className="rounded-xl border-2 border-dashed p-5 text-center text-sm text-gray-500">Selecione uma categoria para ver as especificações técnicas.</p>
  }
}
