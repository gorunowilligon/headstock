import { SpecBlock } from '@/components/sell/spec-block'
import { SpecInput } from '@/components/sell/spec-input'
import { SpecSelect } from '@/components/sell/spec-select'
import { nomeDoCampo as esp, type ValoresIniciais } from '@/lib/especificacoes'

export function GlobalSpecFields({ valores = {} }: { valores?: ValoresIniciais }) {
  return (
    <SpecBlock title="Informações gerais">
      <SpecInput label="Marca" name="marca" placeholder="Ex.: Fender" required defaultValue={valores.marca} />
      <SpecInput label="Modelo" name="modelo" placeholder="Ex.: Stratocaster Player Plus" required defaultValue={valores.modelo} />
      <SpecInput label="Ano de fabricação" name={esp('anoFabricacao')} type="number" placeholder="Ex.: 2019" min={1900} max={new Date().getFullYear()} defaultValue={valores[esp('anoFabricacao')]} />
      <SpecInput label="Cor / Acabamento (Finish)" name={esp('corAcabamento')} placeholder="Ex.: 3-Color Sunburst" defaultValue={valores[esp('corAcabamento')]} />
      <SpecSelect label="País de origem (Made In)" name={esp('paisOrigem')} options={['Estados Unidos', 'México', 'Japão', 'Coreia do Sul', 'China', 'Indonésia', 'Brasil', 'Alemanha', 'Reino Unido', 'Outro']} defaultValue={valores[esp('paisOrigem')]} />
    </SpecBlock>
  )
}
