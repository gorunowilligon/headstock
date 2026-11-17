import { Filter } from '@/components/home/filter'
import { condicoesDoFiltro, contarFiltros, limparFiltros, type DadosFiltros } from '@/lib/filtros'
import type { Instrumento } from '@/lib/models'

const unicos = (valores: string[]) => [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
const marcasPadrao = ['Boss', 'Fender', 'Gibson', 'Ibanez', 'Martin', 'Marshall', 'Tagima', 'Yamaha']
const captacoesPadrao = ['Humbucker', 'Single Coil', 'HSS', 'HSH', 'P90', 'Piezo', 'Ativa']

type ListaFiltro = 'marcas' | 'condicoes' | 'tiposCaptacao'

export function Filters({ filtros, onChange, instrumentos, aberto }: { filtros: DadosFiltros, onChange: (filtros: DadosFiltros) => void, instrumentos: Instrumento[], aberto: boolean }) {
  // Marcas e captações oferecidas são as da seção aberta (com fallback padrão caso o catálogo mestre ainda esteja carregando).
  const daSecao = filtros.categorias.length ? instrumentos.filter((i) => filtros.categorias.includes(i.categoria)) : instrumentos
  const marcasExtraidas = unicos(daSecao.map((i) => i.marca))
  const captacoesExtraidas = unicos(daSecao.map((i) => i.tipoCaptacao))
  const marcas = instrumentos.length > 0 ? marcasExtraidas : marcasPadrao
  const tiposCaptacao = instrumentos.length > 0 ? captacoesExtraidas : captacoesPadrao

  const alternar = (lista: ListaFiltro, valor: string) => {
    const atual = filtros[lista]
    onChange({ ...filtros, [lista]: atual.includes(valor) ? atual.filter((v) => v !== valor) : [...atual, valor] })
  }

  const opcoes = (lista: ListaFiltro, valores: string[]) => valores.map((valor) => (
    <label key={valor} className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={filtros[lista].includes(valor)} onChange={() => alternar(lista, valor)} /> {valor}
    </label>
  ))

  return (
    <aside className={`${aberto ? 'block' : 'hidden'} w-full shrink-0 lg:block lg:w-64`}>
      <div className="sticky top-28 flex flex-col gap-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Filtros</h2>
          <button onClick={() => onChange(limparFiltros(filtros))} disabled={contarFiltros(filtros) === 0} className="text-xs font-semibold text-red-600 disabled:text-gray-300">Limpar tudo</button>
        </div>
        {marcas.length > 0 && <Filter title="Marca">{opcoes('marcas', marcas)}</Filter>}
        {tiposCaptacao.length > 0 && <Filter title="Tipo de captação">{opcoes('tiposCaptacao', tiposCaptacao)}</Filter>}
        <Filter title="Condição">{opcoes('condicoes', condicoesDoFiltro)}</Filter>
        <Filter title="Faixa de preço (R$)">
          <div className="grid grid-cols-2 gap-2">
            <input type="number" min={0} value={filtros.precoMin} onChange={(e) => onChange({ ...filtros, precoMin: e.target.value })} className="rounded-lg border px-2 py-2 text-xs" placeholder="Mínimo" aria-label="Preço mínimo" />
            <input type="number" min={0} value={filtros.precoMax} onChange={(e) => onChange({ ...filtros, precoMax: e.target.value })} className="rounded-lg border px-2 py-2 text-xs" placeholder="Máximo" aria-label="Preço máximo" />
          </div>
        </Filter>
        <Filter title="Localização">
          <input value={filtros.localizacao} onChange={(e) => onChange({ ...filtros, localizacao: e.target.value })} className="rounded-lg border px-2 py-2 text-xs" placeholder="Cidade ou estado" aria-label="Localização" />
        </Filter>
      </div>
    </aside>
  )
}
