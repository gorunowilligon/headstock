import { SpecBlock } from '@/components/sell/spec-block'
import { SpecSelect } from '@/components/sell/spec-select'
import { nomeDoCampo as esp, type ValoresIniciais } from '@/lib/especificacoes'

export function PedalFields({ valores = {} }: { valores?: ValoresIniciais }) {
  return (
    <SpecBlock title="Especificações do pedal">
      <SpecSelect label="Tipo de efeito" name={esp('tipoEfeito')} options={['Overdrive / Distortion', 'Delay', 'Reverb', 'Modulation', 'Multi-efeitos']} defaultValue={valores[esp('tipoEfeito')]} />
      <SpecSelect label="Sinal" name={esp('sinal')} options={['Analógico', 'Digital']} defaultValue={valores[esp('sinal')]} />
      <SpecSelect label="Bypass" name={esp('bypass')} options={['True Bypass', 'Buffered']} defaultValue={valores[esp('bypass')]} />
    </SpecBlock>
  )
}
