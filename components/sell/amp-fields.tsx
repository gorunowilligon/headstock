import { SpecBlock } from '@/components/sell/spec-block'
import { SpecInput } from '@/components/sell/spec-input'
import { SpecSelect } from '@/components/sell/spec-select'
import { nomeDoCampo as esp, type ValoresIniciais } from '@/lib/especificacoes'

export function AmpFields({ valores = {} }: { valores?: ValoresIniciais }) {
  return (
    <SpecBlock title="Especificações do amplificador">
      <SpecSelect label="Tipo de circuito" name={esp('tipoCircuito')} options={['Válvula', 'Transistor / Solid State', 'Digital / Modeling', 'Híbrido']} defaultValue={valores[esp('tipoCircuito')]} />
      <SpecSelect label="Formato" name={esp('formatoAmplificador')} options={['Combo', 'Cabeçote (Head)', 'Gabinete (Cabinet)']} defaultValue={valores[esp('formatoAmplificador')]} />
      <SpecInput label="Potência (Watts)" name={esp('potenciaWatts')} type="number" placeholder="Ex.: 50" min={1} defaultValue={valores[esp('potenciaWatts')]} />
      <SpecSelect label="Configuração de falantes" name={esp('configuracaoFalantes')} options={['1x8"', '1x10"', '1x12"', '1x15"', '2x10"', '2x12"', '4x10"', '4x12"', '8x10"', 'Sem falante (cabeçote)']} defaultValue={valores[esp('configuracaoFalantes')]} />
    </SpecBlock>
  )
}
