import { SpecBlock } from '@/components/sell/spec-block'
import { SpecSelect } from '@/components/sell/spec-select'

export function PedalFields() {
  return (
    <SpecBlock title="Especificações do pedal">
      <SpecSelect label="Tipo de efeito" options={['Overdrive / Distortion', 'Delay', 'Reverb', 'Modulation', 'Multi-efeitos']} />
      <SpecSelect label="Sinal" options={['Analógico', 'Digital']} />
      <SpecSelect label="Bypass" options={['True Bypass', 'Buffered']} />
    </SpecBlock>
  )
}
