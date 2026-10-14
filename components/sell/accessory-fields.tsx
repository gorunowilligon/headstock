import { SpecBlock } from '@/components/sell/spec-block'
import { SpecSelect } from '@/components/sell/spec-select'

export function AccessoryFields() {
  return (
    <SpecBlock title="Detalhes do acessório">
      <SpecSelect label="Tipo de acessório" options={['Case rígido', 'Bag', 'Correia', 'Cabos', 'Encordoamento', 'Tarraxas / Ferragens']} />
    </SpecBlock>
  )
}
