import { SpecBlock } from '@/components/sell/spec-block'
import { SpecSelect } from '@/components/sell/spec-select'
import { nomeDoCampo as esp, type ValoresIniciais } from '@/lib/especificacoes'

export function AcousticFields({ valores = {} }: { valores?: ValoresIniciais }) {
  return (
    <>
      <SpecBlock title="Especificações do corpo">
        <SpecSelect label="Formato do corpo" name={esp('formatoCorpo')} options={['Dreadnought', 'Parlor', 'Folk', 'Clássico', 'Jumbo']} defaultValue={valores[esp('formatoCorpo')]} />
        <SpecSelect label="Madeira do tampo (Top Wood)" name={esp('madeiraTampo')} options={['Spruce', 'Cedro', 'Mogno']} defaultValue={valores[esp('madeiraTampo')]} />
        <SpecSelect label="Fundo e laterais (Back & Sides)" name={esp('fundoLaterais')} options={['Rosewood', 'Mogno', 'Sapele']} defaultValue={valores[esp('fundoLaterais')]} />
      </SpecBlock>
      <SpecBlock title="Cordas e eletrônica">
        <SpecSelect label="Tipo de corda" name={esp('tipoCorda')} options={['Nylon', 'Aço']} defaultValue={valores[esp('tipoCorda')]} />
        <SpecSelect label="Eletrônica / Captação" name="tipoCaptacao" options={['Acústico puro', 'Eletroacústico']} defaultValue={valores.tipoCaptacao} />
      </SpecBlock>
    </>
  )
}
