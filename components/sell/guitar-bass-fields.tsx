import { SpecBlock } from '@/components/sell/spec-block'
import { SpecInput } from '@/components/sell/spec-input'
import { SpecSelect } from '@/components/sell/spec-select'

export function GuitarBassFields({ isBass }: { isBass: boolean }) {
  return (
    <>
      <SpecBlock title="Especificações do corpo e braço">
        <SpecSelect label="Tipo de corpo" options={['Solid Body', 'Semi-Hollow', 'Hollow Body']} />
        <SpecSelect label="Madeira do corpo" options={['Alder', 'Ash', 'Mogno', 'Basswood', 'Poplar', 'Maple', 'Korina', 'Outra']} />
        <SpecSelect label="Madeira do braço" options={['Maple', 'Roasted Maple', 'Mogno', 'Wenge', 'Outra']} />
        <SpecSelect label="Madeira da escala (Fretboard)" options={['Rosewood', 'Maple', 'Ébano', 'Pau-Ferro']} />
        <SpecSelect label="Orientação" options={['Destro', 'Canhoto']} />
        <SpecInput label="Número de cordas" type="number" placeholder={isBass ? 'Ex.: 4' : 'Ex.: 6'} min={4} max={12} />
      </SpecBlock>
      <SpecBlock title="Eletrônica e ferragens">
        <SpecSelect label="Configuração de captadores" options={isBass ? ['P', 'J', 'PJ', 'JJ', 'HH', 'Ativos', 'Passivos'] : ['SSS', 'HSS', 'HH', 'Ativos', 'Passivos']} />
        <SpecSelect label="Tipo de ponte" options={['Fixa', 'Tremolo', 'Floyd Rose', 'Tune-o-Matic']} />
      </SpecBlock>
    </>
  )
}
