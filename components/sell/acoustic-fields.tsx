import { SpecBlock } from '@/components/sell/spec-block'
import { SpecSelect } from '@/components/sell/spec-select'

export function AcousticFields() {
  return (
    <>
      <SpecBlock title="Especificações do corpo">
        <SpecSelect label="Formato do corpo" options={['Dreadnought', 'Parlor', 'Folk', 'Clássico', 'Jumbo']} />
        <SpecSelect label="Madeira do tampo (Top Wood)" options={['Spruce', 'Cedro', 'Mogno']} />
        <SpecSelect label="Fundo e laterais (Back & Sides)" options={['Rosewood', 'Mogno', 'Sapele']} />
      </SpecBlock>
      <SpecBlock title="Cordas e eletrônica">
        <SpecSelect label="Tipo de corda" options={['Nylon', 'Aço']} />
        <SpecSelect label="Eletrônica / Captação" options={['Acústico puro', 'Eletroacústico']} />
      </SpecBlock>
    </>
  )
}
