import { SpecBlock } from '@/components/sell/spec-block'
import { SpecInput } from '@/components/sell/spec-input'
import { SpecSelect } from '@/components/sell/spec-select'

export function GlobalSpecFields() {
  return (
    <SpecBlock title="Informações gerais">
      <SpecInput label="Marca" name="marca" placeholder="Ex.: Fender" required />
      <SpecInput label="Modelo" name="modelo" placeholder="Ex.: Stratocaster Player Plus" required />
      <SpecInput label="Ano de fabricação" type="number" placeholder="Ex.: 2019" min={1900} max={new Date().getFullYear()} />
      <SpecInput label="Cor / Acabamento (Finish)" placeholder="Ex.: 3-Color Sunburst" />
      <SpecSelect label="País de origem (Made In)" options={['Estados Unidos', 'México', 'Japão', 'Coreia do Sul', 'China', 'Indonésia', 'Brasil', 'Alemanha', 'Reino Unido', 'Outro']} />
    </SpecBlock>
  )
}
