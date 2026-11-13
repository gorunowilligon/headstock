import { SpecBlock } from '@/components/sell/spec-block'
import { SpecInput } from '@/components/sell/spec-input'
import { SpecSelect } from '@/components/sell/spec-select'
import { nomeDoCampo as esp, type ValoresIniciais } from '@/lib/especificacoes'

export function GuitarBassFields({ isBass, valores = {} }: { isBass: boolean, valores?: ValoresIniciais }) {
  return (
    <>
      <SpecBlock title="Especificações do corpo e braço">
        <SpecSelect label="Tipo de corpo" name={esp('tipoCorpo')} options={['Solid Body', 'Semi-Hollow', 'Hollow Body']} defaultValue={valores[esp('tipoCorpo')]} />
        <SpecSelect label="Madeira do corpo" name={esp('madeiraCorpo')} options={['Alder', 'Ash', 'Mogno', 'Basswood', 'Poplar', 'Maple', 'Korina', 'Outra']} defaultValue={valores[esp('madeiraCorpo')]} />
        <SpecSelect label="Madeira do braço" name={esp('madeiraBraco')} options={['Maple', 'Roasted Maple', 'Mogno', 'Wenge', 'Outra']} defaultValue={valores[esp('madeiraBraco')]} />
        <SpecSelect label="Madeira da escala (Fretboard)" name={esp('madeiraEscala')} options={['Rosewood', 'Maple', 'Ébano', 'Pau-Ferro']} defaultValue={valores[esp('madeiraEscala')]} />
        <SpecSelect label="Orientação" name="orientacao" options={['Destro', 'Canhoto']} defaultValue={valores.orientacao} />
        <SpecInput label="Número de cordas" name="numeroCordas" type="number" placeholder={isBass ? 'Ex.: 4' : 'Ex.: 6'} min={4} max={12} defaultValue={valores.numeroCordas} />
      </SpecBlock>
      <SpecBlock title="Eletrônica e ferragens">
        <SpecSelect label="Configuração de captadores" name="tipoCaptacao" options={isBass ? ['P', 'J', 'PJ', 'JJ', 'HH', 'Ativos', 'Passivos'] : ['SSS', 'HSS', 'HH', 'Ativos', 'Passivos']} defaultValue={valores.tipoCaptacao} />
        <SpecSelect label="Tipo de ponte" name={esp('tipoPonte')} options={['Fixa', 'Tremolo', 'Floyd Rose', 'Tune-o-Matic']} defaultValue={valores[esp('tipoPonte')]} />
      </SpecBlock>
    </>
  )
}
