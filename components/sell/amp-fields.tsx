import { SpecBlock } from '@/components/sell/spec-block'
import { SpecInput } from '@/components/sell/spec-input'
import { SpecSelect } from '@/components/sell/spec-select'

export function AmpFields() {
  return (
    <SpecBlock title="Especificações do amplificador">
      <SpecSelect label="Tipo de circuito" options={['Válvula', 'Transistor / Solid State', 'Digital / Modeling', 'Híbrido']} />
      <SpecSelect label="Formato" options={['Combo', 'Cabeçote (Head)', 'Gabinete (Cabinet)']} />
      <SpecInput label="Potência (Watts)" type="number" placeholder="Ex.: 50" min={1} />
      <SpecSelect label="Configuração de falantes" options={['1x8"', '1x10"', '1x12"', '1x15"', '2x10"', '2x12"', '4x10"', '4x12"', '8x10"', 'Sem falante (cabeçote)']} />
    </SpecBlock>
  )
}
