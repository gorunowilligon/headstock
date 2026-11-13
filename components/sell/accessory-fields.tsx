import { SpecBlock } from '@/components/sell/spec-block'
import { SpecSelect } from '@/components/sell/spec-select'
import { nomeDoCampo as esp, type ValoresIniciais } from '@/lib/especificacoes'

export function AccessoryFields({ valores = {} }: { valores?: ValoresIniciais }) {
  return (
    <SpecBlock title="Detalhes do acessório">
      <SpecSelect label="Tipo de acessório" name={esp('tipoAcessorio')} options={['Case rígido', 'Bag', 'Correia', 'Cabos', 'Encordoamento', 'Tarraxas / Ferragens']} defaultValue={valores[esp('tipoAcessorio')]} />
    </SpecBlock>
  )
}
